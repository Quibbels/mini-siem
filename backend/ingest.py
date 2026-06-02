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

    last_seen = get_any(["Last seen", "last_seen", "timestamp", "@timestamp"])
    source_ip = get_any(["Source IP", "source_ip", "src_ip"])
    dest_ip = get_any(["Destination IP", "dest_ip", "dst_ip"])
    protocol = get_any(["Protocol", "protocol", "event_type"])
    threat_label = get_any(["Threat Label", "threat_label", "threatlabel"])

    return {
        "timestamp": pd.to_datetime(last_seen),
        "source_ip": source_ip,
        "dest_ip": dest_ip,
        "event_type": protocol,
        "severity": 3 if str(threat_label).lower() == "malicious" else 2 if str(threat_label).lower() == "suspicious" else 1,
    }

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