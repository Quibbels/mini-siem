from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
    Float,
)
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///siem.db"

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, index=True, nullable=False)
    source_ip = Column(String, index=True)
    dest_ip = Column(String, index=True)
    source_port = Column(Integer)
    dest_port = Column(Integer)
    username = Column(String, index=True)
    event_type = Column(String, index=True)
    severity = Column(Integer, index=True)
    message = Column(String)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    rule_name = Column(String, index=True)
    description = Column(String)
    severity = Column(Integer, index=True)
    source_ip = Column(String, index=True)
    username = Column(String, index=True)
    first_seen = Column(DateTime, index=True)
    last_seen = Column(DateTime, index=True)
    count = Column(Integer)


def init_db():
    Base.metadata.create_all(bind=engine)
