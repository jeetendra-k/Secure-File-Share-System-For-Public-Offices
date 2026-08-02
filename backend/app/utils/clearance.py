from fastapi import HTTPException, status
from app.core.classification import CLASSIFICATION_LEVELS, ROLE_CLEARANCE

def check_clearance(user_role: str, file_classification: str):
    if ROLE_CLEARANCE[user_role] < CLASSIFICATION_LEVELS[file_classification]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient clearance level"
        )
