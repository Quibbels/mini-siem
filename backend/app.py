from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from models import init_db, SessionLocal, Event, Alert
from ingest import ingest_csv
from rules import apply_rules

from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

init_db()


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
        # Last 24h
        now = datetime.utcnow()
        start = now - timedelta(hours=24)

        rows = (
            db.query(
                func.strftime("%Y-%m-%d %H:00:00", Event.timestamp).label("bucket"),
                func.count(Event.id),
            )
            .filter(Event.timestamp >= start)
            .group_by("bucket")
            .order_by("bucket")
            .all()
        )

        data = [{"bucket": r[0], "count": r[1]} for r in rows]
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
                    "rule_name": a.rule_name,
                    "description": a.description,
                    "severity": a.severity,
                    "source_ip": a.source_ip,
                    "username": a.username,
                    "first_seen": a.first_seen.isoformat(),
                    "last_seen": a.last_seen.isoformat(),
                    "count": a.count,
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
            .filter(Alert.severity >= 4)
            .group_by(Alert.source_ip)
            .all()
        )

        blocked_ips = [r[0] for r in rows]

        rules = (
            db.query(Alert.rule_name, func.count(Alert.id))
            .group_by(Alert.rule_name)
            .all()
        )

        rules_summary = [
            {"rule_name": r[0], "alerts": r[1]} for r in rules
        ]

        return jsonify({"blocked_ips": blocked_ips, "rules": rules_summary})
    finally:
        db.close()


if __name__ == "__main__":
    app.run(debug=True, port=5000)

#This is Chris
