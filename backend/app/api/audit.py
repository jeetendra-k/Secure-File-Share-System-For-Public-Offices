from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.audit_log import AuditLog
from app.utils.auth import get_current_user
from app.utils.rbac import require_roles

router = APIRouter(prefix="/audit", tags=["Audit Logs"])


@router.get(
    "/logs",
    dependencies=[Depends(require_roles("SUPER_ADMIN", "ADMIN", "AUDITOR"))],
)
def get_audit_logs(
    limit: int = 25,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        logs = (
            db.query(AuditLog)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
            .all()
        )

        # ✅ RETURN RAW ARRAY (NO WRAPPER)
        return [
            {
                "id": log.id,
                "action": log.action,
                "user_id": log.user_id,
                "resource": log.resource,
                "ip_address": log.ip_address or "unknown",
                "created_at": log.created_at.isoformat()
                if log.created_at
                else None,
            }
            for log in logs
        ]

    except Exception as e:
        # 👇 This makes the error visible instead of silent 500
        raise HTTPException(
            status_code=500,
            detail=f"Audit log fetch failed: {str(e)}"
        )
