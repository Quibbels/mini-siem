from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///siem.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    source_ip = Column(String, nullable=True, index=True)
    dest_ip = Column(String, nullable=True)
    event_type = Column(String, nullable=True)
    severity = Column(Integer, nullable=False, default=1)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    last_seen = Column(DateTime, nullable=False, index=True)
    source_ip = Column(String, nullable=True, index=True)
    dest_ip = Column(String, nullable=True)
    event_type = Column(String, nullable=True)
    threat_label = Column(String, nullable=True)
    severity = Column(Integer, nullable=False, default=1)


def init_db():
    Base.metadata.create_all(bind=engine)