from fastapi import APIRouter, Query
from services.delta_reader import (
    get_data_sync_status,
    get_user_vitals_status,
    get_summary
)
from datetime import datetime
from .auth_routes import router as auth_router

router = APIRouter()
router.include_router(auth_router)


@router.get("/sync-status")
def sync_status(date: str = Query(default=datetime.today().strftime('%Y-%m-%d')),
                page: int = Query(default=1, ge=1),
                page_size: int = Query(default=10, ge=1)):
    all_data = get_data_sync_status(date)
    total_users = len(all_data)
    total_pages = (total_users + page_size - 1) // page_size
    start = (page - 1) * page_size
    end = start + page_size
    paginated_data = all_data[start:end]
    return {
        "date": date,
        "data": paginated_data,
        "total_users": total_users,
        "total_pages": total_pages,
        "page": page,
        "page_size": page_size
    }


@router.get("/user-vitals")
def user_vitals(date: str = Query(default=datetime.today().strftime('%Y-%m-%d')),
                page: int = Query(default=1, ge=1),
                page_size: int = Query(default=10, ge=1)):
    all_data = get_user_vitals_status(date)
    total_users = len(all_data)
    total_pages = (total_users + page_size - 1) // page_size
    start = (page - 1) * page_size
    end = start + page_size
    paginated_data = all_data[start:end]
    return {
        "date": date,
        "data": paginated_data,
        "total_users": total_users,
        "total_pages": total_pages,
        "page": page,
        "page_size": page_size
    }


@router.get("/summary")
def summary(date: str = Query(default=datetime.today().strftime('%Y-%m-%d')),
            page: int = Query(default=1, ge=1),
            page_size: int = Query(default=10, ge=1)):
    summary_data = get_summary(date)
    # If summary_data contains a list of users, paginate it. Otherwise, return as is with pagination info.
    if isinstance(summary_data, dict) and 'users' in summary_data and isinstance(summary_data['users'], list):
        all_users = summary_data['users']
        total_users = len(all_users)
        total_pages = (total_users + page_size - 1) // page_size
        start = (page - 1) * page_size
        end = start + page_size
        paginated_users = all_users[start:end]
        summary_data['users'] = paginated_users
        summary_data['total_users'] = total_users
        summary_data['total_pages'] = total_pages
        summary_data['page'] = page
        summary_data['page_size'] = page_size
    return {"date": date, **summary_data}
