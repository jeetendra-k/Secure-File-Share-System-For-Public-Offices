from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from app.api import auth, users, files, biometric, audit, dashboard

# Optional global audit middleware (if enabled)
from app.middleware.audit_middleware import AuditMiddleware


app = FastAPI(
    title="SecureGov Backend",
    version="1.0.0"
)

# =========================================================
# 🌐 CORS CONFIGURATION (CRITICAL)
# =========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(AuditMiddleware)

# =========================================================
# 🧾 OPTIONAL GLOBAL AUDIT MIDDLEWARE
# (Enable only if fully implemented)
# =========================================================
# app.add_middleware(AuditMiddleware)

# =========================================================
# 🔌 API ROUTERS
# =========================================================
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(files.router)
app.include_router(biometric.router)
app.include_router(audit.router)
app.include_router(dashboard.router)

# =========================================================
# 🩺 HEALTH CHECK
# =========================================================
@app.get("/")
def root():
    return {
        "status": "SecureGov Backend is running",
        "version": app.version
    }
