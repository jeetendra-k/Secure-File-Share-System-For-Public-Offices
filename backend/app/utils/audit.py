import hashlib
import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


def compute_hash(data: dict) -> str:
    serialized = json.dumps(data, sort_keys=True).encode("utf-8")
    return hashlib.sha256(serialized).hexdigest()


def create_audit_log(
    db: Session,
    user_id: int,
    action: str,
    resource: str,
    ip: str | None,
    user_agent: str | None,
    request_body: dict | None = None,
):
    try:
        # 🔗 Get previous log hash
        prev_log = (
            db.query(AuditLog)
            .order_by(AuditLog.id.desc())
            .first()
        )
        prev_hash = prev_log.hash if prev_log else None

        payload = {
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "ip": ip,
            "user_agent": user_agent,
            "request_body": request_body,
            "timestamp": datetime.utcnow().isoformat(),
            "prev_hash": prev_hash,
        }

        request_hash = compute_hash(payload)
        final_hash = compute_hash({
            **payload,
            "request_hash": request_hash,
        })

        audit = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            ip_address=ip,
            user_agent=user_agent,
            request_body=json.dumps(request_body) if request_body else None,
            request_hash=request_hash,
            prev_hash=prev_hash,
            hash=final_hash,
        )

        db.add(audit)
        db.commit()

    except Exception as e:
        db.rollback()
        print("AUDIT LOG FAILED:", e)
