from enum import Enum

class Role(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    SECURITY_OFFICER = "SECURITY_OFFICER"
    DEPT_OFFICER = "DEPT_OFFICER"
    CLERK = "CLERK"
    AUDITOR = "AUDITOR"
