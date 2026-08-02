from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from jose import jwt, JWTError

from app.database import SessionLocal
from app.utils.audit import create_audit_log
from app.core.config import settings


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 🔥 CRITICAL: Skip CORS preflight
        if request.method == "OPTIONS":
            return await call_next(request)

        response = await call_next(request)

        try:
            # Skip unaudited paths
            if request.url.path.startswith((
                "/docs",
                "/openapi.json",
                "/redoc",
                "/audit/logs",
                "/dashboard",
            )):
                return response

            # Extract token manually (middleware-safe)
            auth_header = request.headers.get("authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return response

            token = auth_header.split(" ")[1]

            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM],
            )

            user_id = payload.get("user_id") or payload.get("sub")
            if not user_id:
                return response

            db = SessionLocal()

            create_audit_log(
                db=db,
                user_id=int(user_id),
                action=f"{request.method}",
                resource=request.url.path,
                ip=request.client.host if request.client else "unknown",
                user_agent=request.headers.get("user-agent", ""),
                request_body=None,
            )

            db.close()

        except JWTError:
            pass  # Invalid token → no audit
        except Exception:
            pass  # Audit must NEVER break app

        return response
