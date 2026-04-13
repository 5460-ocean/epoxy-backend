from fastapi import APIRouter

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_dashboard():
    return {
        "projects": {
            "total": 4,
            "active": 3,
            "by_surface": {
                "Floor": 2,
                "Wall": 1
            }
        },
        "logs": {
            "total": 3,
            "most_common_action": "UPDATE_PROJECT"
        },
        "activity": {
            "logs_per_day": {
                "2026-04-09": 3
            },
            "actions_over_time": {
                "CREATE_PROJECT": {
                    "2026-04-09": 1
                },
                "DELETE_PROJECT": {
                    "2026-04-09": 1
                },
                "UPDATE_PROJECT": {
                    "2026-04-09": 1
                }
            }
        }
    }
