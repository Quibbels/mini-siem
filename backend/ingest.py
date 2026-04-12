import pandas as pd
from dateutil import parser as dateparser
from sqlalchemy.orm import Session
from models import Event
from datetime import datetime

def threat_to_severity(label):
    label = str(label).strip().lower() if label is not None else "benign"
    if label == "malicious":
        return 3
    if label == "suspicious":
        return 2
    return 1

def normalize_row(row):
    def get_any(keys, default=None):
        for k in keys:
            if k in row and pd.notna(row[k]):
                return row[k]
        return default

    ts_raw = get_any(["Last seen", "timestamp", "time", "date", "@timestamp"])
    if isinstance(ts_raw, datetime):
        ts = ts_raw
    else:
        ts = dateparser.parse(str(ts_raw)) if ts_raw is not None else datetime.utcnow()

    source_ip = get_any(["Source IP", "src_ip", "source_ip", "client_ip"])
    dest_ip = get_any(["Destination IP", "dst_ip", "dest_ip", "server_ip"])
    protocol = get_any(["protocol", "event_type", "action", "event"])
    threat_label = get_any(["threat_label"], "benign")

    return dict(
        timestamp=ts,
        source_ip=str(source_ip) if source_ip else None,
        dest_ip=str(dest_ip) if dest_ip else None,
        event_type=str(protocol) if protocol else "unknown",
        severity=threat_to_severity(threat_label),
    )

def ingest_csv(session: Session, csv_path: str):
    df = pd.read_csv(csv_path, encoding="utf-8-sig")
    events = []

    for _, row in df.iterrows():
        norm = normalize_row(row)
        ev = Event(**norm)
        events.append(ev)

    session.bulk_save_objects(events)
    session.commit()
    return len(events)