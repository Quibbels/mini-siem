from collections import defaultdict
from datetime import timedelta


def apply_rules(events):
    """
    Input: list of Event ORM objects sorted by timestamp.
    Output: list of Alert-like dicts.
    """
    alerts = []

    # Rule 1: excessive login failures per IP
    fail_window = timedelta(minutes=5)
    fail_threshold = 5

    failures_by_ip = defaultdict(list)

    for ev in events:
        if ev.event_type == "login_failure":
            failures_by_ip[ev.source_ip].append(ev)

    for ip, evs in failures_by_ip.items():
        evs.sort(key=lambda e: e.timestamp)
        start = 0
        for end in range(len(evs)):
            while (
                evs[end].timestamp - evs[start].timestamp > fail_window
                and start < end
            ):
                start += 1
            window_count = end - start + 1
            if window_count >= fail_threshold:
                alerts.append(
                    {
                        "rule_name": "Excessive login failures",
                        "description": f"{window_count} failures from {ip} within {fail_window}.",
                        "severity": 4,
                        "source_ip": ip,
                        "username": evs[end].username,
                        "first_seen": evs[start].timestamp,
                        "last_seen": evs[end].timestamp,
                        "count": window_count,
                    }
                )
                break  # one alert per IP for simplicity

    # Rule 2: port scan detection (many distinct dest ports)
    scan_window = timedelta(minutes=5)
    port_threshold = 10

    events_by_ip = defaultdict(list)
    for ev in events:
        if ev.source_ip:
            events_by_ip[ev.source_ip].append(ev)

    for ip, evs in events_by_ip.items():
        evs.sort(key=lambda e: e.timestamp)
        start = 0
        ports_in_window = defaultdict(int)

        for end in range(len(evs)):
            ev = evs[end]
            if ev.dest_port is not None:
                ports_in_window[ev.dest_port] += 1

            while (
                evs[end].timestamp - evs[start].timestamp > scan_window
                and start < end
            ):
                old = evs[start]
                if old.dest_port in ports_in_window:
                    ports_in_window[old.dest_port] -= 1
                    if ports_in_window[old.dest_port] <= 0:
                        del ports_in_window[old.dest_port]
                start += 1

            if len(ports_in_window.keys()) >= port_threshold:
                first_time = evs[start].timestamp
                last_time = evs[end].timestamp
                alerts.append(
                    {
                        "rule_name": "Port scan detected",
                        "description": f"Source {ip} contacted >= {port_threshold} unique ports within {scan_window}.",
                        "severity": 5,
                        "source_ip": ip,
                        "username": None,
                        "first_seen": first_time,
                        "last_seen": last_time,
                        "count": len(ports_in_window.keys()),
                    }
                )
                break

    # Rule 3: firewall deny spike per IP
    deny_window = timedelta(minutes=5)
    deny_threshold = 20

    deny_by_ip = defaultdict(list)
    for ev in events:
        if ev.event_type == "firewall_deny":
            deny_by_ip[ev.source_ip].append(ev)

    for ip, evs in deny_by_ip.items():
        evs.sort(key=lambda e: e.timestamp)
        start = 0
        for end in range(len(evs)):
            while (
                evs[end].timestamp - evs[start].timestamp > deny_window
                and start < end
            ):
                start += 1
            window_count = end - start + 1
            if window_count >= deny_threshold:
                alerts.append(
                    {
                        "rule_name": "Firewall deny spike",
                        "description": f"{window_count} firewall denies from {ip} within {deny_window}.",
                        "severity": 3,
                        "source_ip": ip,
                        "username": None,
                        "first_seen": evs[start].timestamp,
                        "last_seen": evs[end].timestamp,
                        "count": window_count,
                    }
                )
                break

    return alerts
