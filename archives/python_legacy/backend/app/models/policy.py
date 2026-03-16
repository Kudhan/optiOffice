from pydantic import BaseModel
from typing import Optional, List

class PasswordPolicy(BaseModel):
    min_length: int = 8
    require_uppercase: bool = True
    require_lowercase: bool = True
    require_numbers: bool = True
    require_special_chars: bool = False
    expiry_days: int = 90
    history_limit: int = 3

class LoginPolicy(BaseModel):
    max_attempts: int = 5
    lockout_duration_minutes: int = 30
    session_timeout_minutes: int = 60

class UserPolicy(BaseModel):
    max_users: int = 100
    allow_soft_delete: bool = True
    force_profile_completion: bool = True

class AttendancePolicy(BaseModel):
    office_start_time: str = "09:00"
    office_end_time: str = "18:00"
    grace_period_minutes: int = 15
    min_work_hours: float = 8.0
    half_day_hours: float = 4.0
    allow_manual_checkin: bool = True
    allow_wfh: bool = False
    geo_fencing_enabled: bool = False
    geo_radius_meters: int = 100
    
class LeavePolicy(BaseModel):
    annual_leave_quota: int = 12
    sick_leave_quota: int = 10
    casual_leave_quota: int = 8
    carry_forward_limit: int = 5
    approval_required: bool = True
    allow_negative_balance: bool = False
    sandwich_rule: bool = False
    probation_period_months: int = 3

class TaskPolicy(BaseModel):
    who_can_assign_tasks: str = "manager" # manager, everyone
    daily_task_limit: int = 20
    allow_deadline_override: bool = True
    mandatory_task_updates: bool = False

class DocumentPolicy(BaseModel):
    max_file_size_mb: int = 10
    allowed_file_types: List[str] = ["pdf", "docx", "jpg", "png"]
    retention_period_days: int = 365
    allow_external_sharing: bool = False

class NotificationPolicy(BaseModel):
    enable_email_notifications: bool = True
    enable_in_app_notifications: bool = True
    enable_slack_notifications: bool = False
    quiet_hours_start: str = "22:00"
    quiet_hours_end: str = "07:00"

class SecurityPolicy(BaseModel):
    enable_mfa: bool = False
    enforce_sso: bool = False
    ip_whitelisting_enabled: bool = False
    allowed_ips: List[str] = []
    audit_log_retention_days: int = 90

class BillingPolicy(BaseModel):
    max_users_per_plan: int = 50
    grace_period_days: int = 7
    currency: str = "USD"
    tax_percentage: float = 0.0

class AutomationPolicy(BaseModel):
    auto_approve_leave_days: int = 0 # 0 means disabled
    escalate_after_days: int = 3

class CustomizationPolicy(BaseModel):
    company_name: str = "Office SaaS"
    primary_color: str = "#4f46e5"
    logo_url: Optional[str] = None
    enable_beta_features: bool = False

class SystemPolicy(BaseModel):
    password_policy: PasswordPolicy = PasswordPolicy()
    login_policy: LoginPolicy = LoginPolicy()
    user_policy: UserPolicy = UserPolicy()
    attendance_policy: AttendancePolicy = AttendancePolicy()
    leave_policy: LeavePolicy = LeavePolicy()
    task_policy: TaskPolicy = TaskPolicy()
    document_policy: DocumentPolicy = DocumentPolicy()
    notification_policy: NotificationPolicy = NotificationPolicy()
    security_policy: SecurityPolicy = SecurityPolicy()
    billing_policy: BillingPolicy = BillingPolicy()
    automation_policy: AutomationPolicy = AutomationPolicy()
    customization_policy: CustomizationPolicy = CustomizationPolicy()

class SystemPolicyUpdate(BaseModel):
    password_policy: Optional[PasswordPolicy] = None
    login_policy: Optional[LoginPolicy] = None
    user_policy: Optional[UserPolicy] = None
    attendance_policy: Optional[AttendancePolicy] = None
    leave_policy: Optional[LeavePolicy] = None
    task_policy: Optional[TaskPolicy] = None
    document_policy: Optional[DocumentPolicy] = None
    notification_policy: Optional[NotificationPolicy] = None
    security_policy: Optional[SecurityPolicy] = None
    billing_policy: Optional[BillingPolicy] = None
    automation_policy: Optional[AutomationPolicy] = None
    customization_policy: Optional[CustomizationPolicy] = None
