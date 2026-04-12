from collections import defaultdict
from datetime import timedelta


def apply_rules(events):
    alerts = []

    for ev in events:
        if ev.severity >= 2:
            threat_label = "suspicious" if ev.severity == 2 else "malicious"

            alerts.append({
                "last_seen": ev.timestamp,
                "source_ip": ev.source_ip,
                "dest_ip": ev.dest_ip,
                "event_type": ev.event_type,
                "threat_label": threat_label,
                "severity": ev.severity,
            })

    return alerts