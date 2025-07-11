from deltalake import DeltaTable
import pandas as pd
import os
import json
from datetime import datetime, timedelta
import calendar

# Update BASE_DIR to point to the correct delta_tables directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TABLE_PATHS = {
    "bronze": os.path.join(BASE_DIR, "delta_tables", "bronze"),
    "silver_rrbucket": os.path.join(BASE_DIR, "delta_tables", "silver_rrbucket"),
    "silver_vitalsbaseline": os.path.join(BASE_DIR, "delta_tables", "silver_vitalsbaseline"),
    "silver_vitalsswt": os.path.join(BASE_DIR, "delta_tables", "silver_vitalsswt"),
}

def get_week_dates(date_str):
    """Get all dates in the week containing the given date."""
    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    start_of_week = date_obj - timedelta(days=date_obj.weekday())
    dates = []
    for i in range(7):
        dates.append((start_of_week + timedelta(days=i)).strftime('%Y-%m-%d'))
    return dates

def get_month_dates(date_str):
    """Get all dates in the month containing the given date."""
    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    year, month = date_obj.year, date_obj.month
    num_days = calendar.monthrange(year, month)[1]
    dates = []
    for day in range(1, num_days + 1):
        dates.append(datetime(year, month, day).strftime('%Y-%m-%d'))
    return dates

def get_aggregated_summary(date_list, period_type):
    """Get aggregated summary for a list of dates."""
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(BASE_DIR, 'data')
    
    # Aggregate raw records for all dates
    raw_count = 0
    raw_users = set()
    raw_records_by_user = {}  # Track raw records per user
    for date_str in date_list:
        for fname in os.listdir(data_dir):
            if fname.endswith('.gz'):
                user_id, ingestion_date = fname.split('_')[0], fname.split('_')[1].replace('.gz', '')
                try:
                    dt = datetime.utcfromtimestamp(int(ingestion_date) / 1000)
                    date_str_file = dt.strftime('%Y-%m-%d')
                except Exception:
                    date_str_file = ''
                if date_str_file == date_str:
                    import gzip, json
                    with gzip.open(os.path.join(data_dir, fname), 'rt', encoding='utf-8') as f:
                        records = json.load(f)
                        if isinstance(records, list):
                            record_count = len(records)
                            raw_count += record_count
                            raw_users.add(user_id)
                            raw_records_by_user[user_id] = raw_records_by_user.get(user_id, 0) + record_count
                        else:
                            raw_count += 1
                            raw_users.add(user_id)
                            raw_records_by_user[user_id] = raw_records_by_user.get(user_id, 0) + 1
    
    # Aggregate bronze records for all dates
    bronze_count = 0
    bronze_users = set()
    bronze_records_by_user = {}  # Track bronze records per user
    try:
        dt_bronze = DeltaTable(TABLE_PATHS['bronze'])
        df_bronze = dt_bronze.to_pandas()
        for date_str in date_list:
            df_filtered = df_bronze[df_bronze['ingestion_date'] == date_str]
            bronze_count += len(df_filtered)
            bronze_users.update(df_filtered['user_id'].unique())
            # Count records per user
            for user_id in df_filtered['user_id'].unique():
                user_records = len(df_filtered[df_filtered['user_id'] == user_id])
                bronze_records_by_user[user_id] = bronze_records_by_user.get(user_id, 0) + user_records
    except Exception as e:
        bronze_count = 0
        bronze_users = set()
    
    # Aggregate silver records for all dates
    silver_count = 0
    silver_users = set()
    silver_records_by_user = {}  # Track silver records per user
    for key in ['silver_rrbucket', 'silver_vitalsbaseline', 'silver_vitalsswt']:
        try:
            dt_silver = DeltaTable(TABLE_PATHS[key])
            df_silver = dt_silver.to_pandas()
            for date_str in date_list:
                df_filtered = df_silver[df_silver['ingestion_date'] == date_str]
                silver_count += len(df_filtered)
                silver_users.update(df_filtered['user_id'].unique())
                # Count records per user
                for user_id in df_filtered['user_id'].unique():
                    user_records = len(df_filtered[df_filtered['user_id'] == user_id])
                    silver_records_by_user[user_id] = silver_records_by_user.get(user_id, 0) + user_records
        except Exception:
            continue
    
    # Calculate successful and failed ingestions based on new logic
    successful_ingestions = 0
    failed_ingestions = 0
    
    for user_id in raw_users:
        raw_records = raw_records_by_user.get(user_id, 0)
        bronze_records = bronze_records_by_user.get(user_id, 0)
        silver_records = silver_records_by_user.get(user_id, 0)
        
        # Check if user meets all criteria for successful ingestion
        if (raw_records == bronze_records and 
            bronze_records > 0 and 
            silver_records == raw_records * 3):
            successful_ingestions += 1
        else:
            failed_ingestions += 1
    
    # Status
    raw_to_bronze_success = (raw_count == bronze_count and raw_count > 0)
    bronze_to_silver_success = (bronze_count * 3 == silver_count and bronze_count > 0)
    
    return {
        "period_type": period_type,
        "date_range": f"{date_list[0]} to {date_list[-1]}",
        "date_list": date_list,
        "total_users": len(raw_users),
        "total_raw": raw_count,
        "total_bronze": bronze_count,
        "total_silver": silver_count,
        "raw_to_bronze_status": "Success" if raw_to_bronze_success else "Failed",
        "bronze_to_silver_status": "Success" if bronze_to_silver_success else "Failed",
        "successful_ingestions": successful_ingestions,
        "failed_ingestions": failed_ingestions,
        "users": sorted(list(raw_users))
    }

def get_weekly_summary(date_str: str) -> dict:
    """Get summary for the week containing the given date."""
    week_dates = get_week_dates(date_str)
    return get_aggregated_summary(week_dates, "week")

def get_monthly_summary(date_str: str) -> dict:
    """Get summary for the month containing the given date."""
    month_dates = get_month_dates(date_str)
    return get_aggregated_summary(month_dates, "month")


def get_data_sync_status(date_str: str) -> dict:
    def check_availability(df, user_id):
        if df.empty:
            return "Missing"
        user_id_cols = [col for col in df.columns if 'user_id' in col.lower()]
        for col in user_id_cols:
            if user_id in df[col].values:
                return "Available"
        return "Missing"

    def get_all_users():
        all_users = set()
        for name, path in TABLE_PATHS.items():
            try:
                dt = DeltaTable(path)
                df = dt.to_pandas()
                user_id_cols = [col for col in df.columns if 'user_id' in col.lower()]
                for col in user_id_cols:
                    all_users.update(df[col].dropna().unique())
            except Exception as e:
                print(f"Error getting users from {name}: {str(e)}")
                continue
        return sorted(all_users)

    def get_column_names():
        columns = ["user_id"]
        for name in TABLE_PATHS:
            if name == "bronze":
                columns.append("Bronze Data")
            elif name == "silver_rrbucket":
                columns.append("Silver RRBucket")
            elif name == "silver_vitalsbaseline":
                columns.append("Silver VitalsBaseline")
            elif name == "silver_vitalsswt":
                columns.append("Silver VitalSWT")
            else:
                columns.append(name.replace("_", " ").title())
        return columns

    result = []
    tables = {}
    empty_df = pd.DataFrame(columns=['user_id'])
    columns = get_column_names()
    all_users = get_all_users()

    for name, path in TABLE_PATHS.items():
        try:
            dt = DeltaTable(path)
            df = dt.to_pandas()
            # Filter by ingestion_date
            filtered = df[df['ingestion_date'] == date_str]
            tables[name] = filtered if not filtered.empty else empty_df
        except Exception as e:
            print(f"Error processing table {name}: {str(e)}")
            tables[name] = empty_df
            continue

    for uid in all_users:
        row = {
            "user_id": uid,
            "bronze": check_availability(tables.get('bronze', empty_df), uid),
            "silver_rrbucket": check_availability(tables.get('silver_rrbucket', empty_df), uid),
            "silver_vitalsbaseline": check_availability(tables.get('silver_vitalsbaseline', empty_df), uid),
            "silver_vitalsswt": check_availability(tables.get('silver_vitalsswt', empty_df), uid)
        }
        result.append(row)

    return {
        "columns": columns,
        "data": result
    }


def get_user_vitals_status(date_str: str) -> dict:
    def get_all_users():
        all_users = set()
        for name, path in TABLE_PATHS.items():
            try:
                dt = DeltaTable(path)
                df = dt.to_pandas()
                user_id_cols = [col for col in df.columns if 'user_id' in col.lower()]
                for col in user_id_cols:
                    all_users.update(df[col].dropna().unique())
            except Exception as e:
                print(f"Error getting users from {name}: {str(e)}")
                continue
        return sorted(all_users)

    def get_vitals_columns():
        try:
            dt = DeltaTable(TABLE_PATHS['bronze'])
            df = dt.to_pandas()
            if 'type' in df.columns:
                vitals = df['type'].unique().tolist()
                vitals = sorted([vital for vital in vitals if vital and vital.strip()])
                return ["user_id"] + vitals
            else:
                return ["user_id", "STEPS", "HEART_RATE", "HEART_RATE_VARIABILITY_SDNN", "BLOOD_OXYGEN", "RESPIRATORY_RATE"]
        except Exception as e:
            print(f"Error getting vitals columns: {str(e)}")
            return ["user_id", "STEPS", "HEART_RATE", "HEART_RATE_VARIABILITY_SDNN", "BLOOD_OXYGEN", "RESPIRATORY_RATE"]

    dt = DeltaTable(TABLE_PATHS['bronze'])
    df = dt.to_pandas()
    df = df[df['ingestion_date'] == date_str]
    columns = get_vitals_columns()
    vitals = columns[1:]
    result = []
    all_users = get_all_users()
    for uid in all_users:
        user_df = df[df['user_id'] == uid]
        entry = {"user_id": uid}
        for vital in vitals:
            entry[vital] = "Available" if not user_df.empty and vital in user_df['type'].values else "Missing"
        result.append(entry)
    return {
        "columns": columns,
        "data": result
    }


def get_summary(date_str: str) -> dict:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(BASE_DIR, 'data')
    # Count raw records for the date
    raw_count = 0
    raw_users = set()
    raw_records_by_user = {}  # Track raw records per user
    for fname in os.listdir(data_dir):
        if fname.endswith('.gz'):
            user_id, ingestion_date = fname.split('_')[0], fname.split('_')[1].replace('.gz', '')
            try:
                from datetime import datetime
                dt = datetime.utcfromtimestamp(int(ingestion_date) / 1000)
                date_str_file = dt.strftime('%Y-%m-%d')
            except Exception:
                date_str_file = ''
            if date_str_file == date_str:
                import gzip, json
                with gzip.open(os.path.join(data_dir, fname), 'rt', encoding='utf-8') as f:
                    records = json.load(f)
                    if isinstance(records, list):
                        record_count = len(records)
                        raw_count += record_count
                        raw_users.add(user_id)
                        raw_records_by_user[user_id] = record_count
                    else:
                        raw_count += 1
                        raw_users.add(user_id)
                        raw_records_by_user[user_id] = 1
    # Bronze
    bronze_count = 0
    bronze_users = set()
    bronze_records_by_user = {}  # Track bronze records per user
    try:
        dt_bronze = DeltaTable(TABLE_PATHS['bronze'])
        df_bronze = dt_bronze.to_pandas()
        df_bronze = df_bronze[df_bronze['ingestion_date'] == date_str]
        bronze_count = len(df_bronze)
        bronze_users = set(df_bronze['user_id'].unique())
        # Count records per user
        for user_id in df_bronze['user_id'].unique():
            user_records = len(df_bronze[df_bronze['user_id'] == user_id])
            bronze_records_by_user[user_id] = user_records
    except Exception as e:
        bronze_count = 0
        bronze_users = set()
    # Silver (sum all silver tables)
    silver_count = 0
    silver_users = set()
    silver_records_by_user = {}  # Track silver records per user
    for key in ['silver_rrbucket', 'silver_vitalsbaseline', 'silver_vitalsswt']:
        try:
            dt_silver = DeltaTable(TABLE_PATHS[key])
            df_silver = dt_silver.to_pandas()
            df_silver = df_silver[df_silver['ingestion_date'] == date_str]
            silver_count += len(df_silver)
            silver_users.update(df_silver['user_id'].unique())
            # Count records per user
            for user_id in df_silver['user_id'].unique():
                user_records = len(df_silver[df_silver['user_id'] == user_id])
                silver_records_by_user[user_id] = silver_records_by_user.get(user_id, 0) + user_records
        except Exception:
            continue
    # Calculate successful and failed ingestions based on new logic
    successful_ingestions = 0
    failed_ingestions = 0
    
    for user_id in raw_users:
        raw_records = raw_records_by_user.get(user_id, 0)
        bronze_records = bronze_records_by_user.get(user_id, 0)
        silver_records = silver_records_by_user.get(user_id, 0)
        
        # Check if user meets all criteria for successful ingestion
        if (raw_records == bronze_records and 
            bronze_records > 0 and 
            silver_records == raw_records * 3):
            successful_ingestions += 1
        else:
            failed_ingestions += 1
    
    # Status
    raw_to_bronze_success = (raw_count == bronze_count and raw_count > 0)
    bronze_to_silver_success = (bronze_count * 3 == silver_count and bronze_count > 0)
    return {
        "date": date_str,
        "total_users": len(raw_users),
        "total_raw": raw_count,
        "total_bronze": bronze_count,
        "total_silver": silver_count,
        "raw_to_bronze_status": "Success" if raw_to_bronze_success else "Failed",
        "bronze_to_silver_status": "Success" if bronze_to_silver_success else "Failed",
        "successful_ingestions": successful_ingestions,
        "failed_ingestions": failed_ingestions,
        "users": sorted(list(raw_users))
    }
