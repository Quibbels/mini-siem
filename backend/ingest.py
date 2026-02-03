import pandas as pd
from dateutil import parser as dateparser
from sqlalchemy.orm import Session
from models import Event
from datetime import datetime


def normalize_row(row):
    """
    Map various possible column names to our internal schema.
    Adjust this mapping to fit your real CSV headers.
    """
    def get_any(keys, default=None):
        for k in keys:
            if k in row and pd.notna(row[k]):
                return row[k]
        return default

    # timestamp
    ts_raw = get_any(["timestamp", "time", "date", "@timestamp"])
    if isinstance(ts_raw, datetime):
        ts = ts_raw
    else:
        ts = dateparser.parse(str(ts_raw)) if ts_raw is not None else datetime.utcnow()

    source_ip = get_any(["src_ip", "source_ip", "client_ip"])
    dest_ip = get_any(["dst_ip", "dest_ip", "server_ip"])
    source_port = get_any(["src_port", "source_port", "sport"])
    dest_port = get_any(["dst_port", "dest_port", "dport"])
    username = get_any(["user", "username", "account"])
    event_type = get_any(["event_type", "action", "event"])
    severity = get_any(["severity", "level", "priority"])
    message = get_any(["message", "msg", "description"])

    try:
        source_port = int(source_port) if source_port not in [None, ""] else None
    except ValueError:
        source_port = None

    try:
        dest_port = int(dest_port) if dest_port not in [None, ""] else None
    except ValueError:
        dest_port = None

    try:
        severity = int(severity) if severity not in [None, ""] else 1
    except ValueError:
        severity = 1

    if not event_type:
        event_type = "unknown"

    return dict(
        timestamp=ts,
        source_ip=str(source_ip) if source_ip else None,
        dest_ip=str(dest_ip) if dest_ip else None,
        source_port=source_port,
        dest_port=dest_port,
        username=str(username) if username else None,
        event_type=str(event_type),
        severity=severity,
        message=str(message) if message else "",
    )


def ingest_csv(session: Session, csv_path: str):
    df = pd.read_csv(csv_path)
    events = []

    for _, row in df.iterrows():
        norm = normalize_row(row)
        ev = Event(**norm)
        events.append(ev)

    session.bulk_save_objects(events)
    session.commit()
    return len(events)
