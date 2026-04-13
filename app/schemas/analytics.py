from pydantic import BaseModel
from typing import Dict

class LogsAnalytics(BaseModel):
    total_logs: int
    most_common_action: str | None = None
    top_user: str | None = None
    actions_breakdown: Dict[str, int]

class TimeAnalytics(BaseModel):
    days_filter: int
    logs_per_day: Dict[str, int]

class ActionsOverTime(BaseModel):
    days_filter: int
    actions_over_time: Dict[str, Dict[str, int]]

class Dashboard(BaseModel):
    projects: dict
    logs: dict
    activity: dict
