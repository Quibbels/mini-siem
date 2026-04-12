from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from models import init_db, SessionLocal, Event, Alert
from ingest import ingest_csv
from rules import apply_rules

from datetime import datetime, timedelta

from flask import Flask, jsonify, request
from werkzeug.utils import secure_filename
import os

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
CORS(app)

init_db()
db = SessionLocal()
db.query(Event).delete()
db.query(Alert).delete()
db.commit()
db.close()

@app.route("/api/upload-logs", methods=["POST"])
def api_upload_logs():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    f = request.files["file"]
    if f.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(f.filename)
    save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    f.save(save_path)

    # Ingest the saved CSV using your existing logic
    db = SessionLocal()
    try:
        count = ingest_csv(db, save_path)

        # Recompute alerts after ingest
        db.query(Alert).delete()
        events = db.query(Event).order_by(Event.timestamp).all()
        alerts_dicts = apply_rules(events)
        for a in alerts_dicts:
            db.add(Alert(**a))
        db.commit()

        return jsonify({"ingested": count, "filename": filename}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/api/ingest", methods=["POST"])
def api_ingest():
    data = request.get_json(force=True)
    path = data.get("path", "sample_logs.csv")

    db = SessionLocal()
    try:
        count = ingest_csv(db, path)

        # Recompute alerts every time we ingest
        db.query(Alert).delete()
        events = db.query(Event).order_by(Event.timestamp).all()
        alerts_dicts = apply_rules(events)
        for a in alerts_dicts:
            alert = Alert(**a)
            db.add(alert)
        db.commit()

        return jsonify({"ingested": count, "alerts": len(alerts_dicts)})
    finally:
        db.close()


@app.route("/api/overview", methods=["GET"])
def api_overview():
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        last_24h = now - timedelta(hours=24)

        total_events = db.query(func.count(Event.id)).scalar()
        events_24h = (
            db.query(func.count(Event.id))
            .filter(Event.timestamp >= last_24h)
            .scalar()
        )
        high_severity = (
            db.query(func.count(Event.id))
            .filter(Event.severity >= 4)
            .scalar()
        )
        unique_sources = db.query(func.count(func.distinct(Event.source_ip))).scalar()

        alerts_count = db.query(func.count(Alert.id)).scalar()

        return jsonify(
            {
                "total_events": total_events,
                "events_24h": events_24h,
                "high_severity_events": high_severity,
                "unique_sources": unique_sources,
                "alerts": alerts_count,
            }
        )
    finally:
        db.close()


@app.route("/api/events/time-series", methods=["GET"])
def api_events_time_series():
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        start = now - timedelta(hours=24)

        rows = (
            db.query(
                func.strftime("%Y-%m-%d %H:00:00", Event.timestamp).label("bucket"),
                func.count(Event.id).label("count"),
            )
            .filter(Event.timestamp >= start)
            .group_by("bucket")
            .order_by("bucket")
            .all()
        )

        # Fallback: if no events in the real last 24h, show the latest 24h window from the DB
        if not rows:
            latest_event = db.query(func.max(Event.timestamp)).scalar()

            if latest_event:
                fallback_start = latest_event - timedelta(hours=24)

                rows = (
                    db.query(
                        func.strftime("%Y-%m-%d %H:00:00", Event.timestamp).label("bucket"),
                        func.count(Event.id).label("count"),
                    )
                    .filter(Event.timestamp >= fallback_start)
                    .group_by("bucket")
                    .order_by("bucket")
                    .all()
                )

        data = [{"bucket": r.bucket, "count": r.count} for r in rows]
        return jsonify(data)
    finally:
        db.close()


@app.route("/api/events/top-sources", methods=["GET"])
def api_top_sources():
    db = SessionLocal()
    try:
        rows = (
            db.query(Event.source_ip, func.count(Event.id).label("count"))
            .group_by(Event.source_ip)
            .order_by(desc("count"))
            .limit(5)
            .all()
        )
        data = []
        for ip, count in rows:
            data.append(
                {"source_ip": ip if ip is not None else "Unknown", "count": count}
            )
        return jsonify(data)
    finally:
        db.close()


@app.route("/api/alerts", methods=["GET"])
def api_alerts():
    db = SessionLocal()
    try:
        rows = (
            db.query(Alert)
            .order_by(desc(Alert.severity), desc(Alert.last_seen))
            .limit(50)
            .all()
        )

        data = []
        for a in rows:
            data.append(
                {
                    "id": a.id,
                    "last_seen": a.last_seen.isoformat() if a.last_seen else None,
                    "source_ip": a.source_ip,
                    "dest_ip": a.dest_ip,
                    "event_type": a.event_type,
                    "threat_label": a.threat_label,
                    "severity": a.severity,
                }
            )

        return jsonify(data)
    finally:
        db.close()


@app.route("/api/security-measures", methods=["GET"])
def api_security_measures():
    db = SessionLocal()
    try:
        rows = (
            db.query(Alert.source_ip)
            .filter(Alert.source_ip.isnot(None))
            .filter(Alert.severity >= 2)
            .group_by(Alert.source_ip)
            .all()
        )

        blocked_ips = [r[0] for r in rows]

        threat_rows = (
            db.query(Alert.threat_label, func.count(Alert.id))
            .group_by(Alert.threat_label)
            .all()
        )

        rules_summary = [
            {
                "rule_name": threat if threat is not None else "unknown",
                "alerts": count
            }
            for threat, count in threat_rows
        ]

        return jsonify({
            "blocked_ips": blocked_ips,
            "rules": rules_summary
        })
    finally:
        db.close()

@app.route("/api/alerts/clear", methods=["POST"])
def api_clear_alerts():
    db = SessionLocal()
    try:
        deleted = db.query(Alert).delete()
        db.commit()
        return jsonify({"deleted": deleted}), 200
    finally:
        db.close()

@app.route("/api/alerts/<int:alert_id>", methods=["DELETE"])
def api_delete_alert(alert_id):
    db = SessionLocal()
    try:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()

        if not alert:
            return jsonify({"error": "Alert not found"}), 404

        db.delete(alert)
        db.commit()

        return jsonify({"deleted": alert_id}), 200
    finally:
        db.close()

if __name__ == "__main__":
    app.run(debug=True, port=5000)

#This is Chris
