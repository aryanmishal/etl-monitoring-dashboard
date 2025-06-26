from deltalake import DeltaTable
import pandas as pd
import os
import json

# Update BASE_DIR to point to the correct delta_tables directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TABLE_PATHS = {
    "bronze": os.path.join(BASE_DIR, "delta_tables", "bronze"),
    "silver_rrbucket": os.path.join(BASE_DIR, "delta_tables", "silver_rrbucket"),
    "silver_vitalsbaseline": os.path.join(BASE_DIR, "delta_tables", "silver_vitalsbaseline"),
    "silver_vitalsswt": os.path.join(BASE_DIR, "delta_tables", "silver_vitalsswt"),
}


def get_data_sync_status(date_str: str) -> list:
    def check_availability(df, user_id):
        if df.empty:
            return "Missing"
        # Check all possible user_id columns
        user_id_cols = [col for col in df.columns if 'user_id' in col.lower()]
        for col in user_id_cols:
            if user_id in df[col].values:
                return "Available"
        return "Missing"

    def parse_date_column(df, date_str):
        # Try different date column names
        date_columns = ['ingestion_date', 'ingestion_timestamp', 'date', 'timestamp']
        print(f"Looking for date: {date_str}")
        
        for col in date_columns:
            if col in df.columns:
                try:
                    print(f"Found column {col} with sample values: {df[col].head().tolist()}")
                    # Use the date string as-is (YYYY-MM-DD)
                    target_date = date_str
                    # For timestamp columns, extract just the date part
                    if col == 'ingestion_timestamp':
                        df[col] = df[col].str.split(' ').str[0]
                        print(f"After splitting timestamp, sample values: {df[col].head().tolist()}")
                    # Filter rows where date matches
                    filtered = df[df[col] == target_date]
                    print(f"Found {len(filtered)} matching rows")
                    return filtered
                except Exception as e:
                    print(f"Error parsing date column {col}: {str(e)}")
                    continue
        return pd.DataFrame(columns=['user_id'])

    def get_all_users():
        """Get all unique users from all tables."""
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

    result = []
    tables = {}
    empty_df = pd.DataFrame(columns=['user_id'])

    # First, get all unique users from all tables
    all_users = get_all_users()
    print(f"Found all unique users: {all_users}")

    # Process each table for the given date
    for name, path in TABLE_PATHS.items():
        try:
            print(f"\nProcessing table: {name}")
            dt = DeltaTable(path)
            df = dt.to_pandas()
            print(f"Table columns: {df.columns.tolist()}")
            
            # Parse and filter by date
            filtered = parse_date_column(df, date_str)
            if not filtered.empty:
                tables[name] = filtered
                print(f"Found {len(filtered)} rows for {name}")
            else:
                print(f"Warning: No data found for date {date_str} in {name} table")
                tables[name] = empty_df
                
        except Exception as e:
            print(f"Error processing table {name}: {str(e)}")
            tables[name] = empty_df
            continue

    # Create entries for all users, even if they don't have data for the date
    for uid in all_users:
        row = {
            "user_id": uid,
            "bronze": check_availability(tables.get('bronze', empty_df), uid),
            "silver_rrbucket": check_availability(tables.get('silver_rrbucket', empty_df), uid),
            "silver_vitalsbaseline": check_availability(tables.get('silver_vitalsbaseline', empty_df), uid),
            "silver_vitalsswt": check_availability(tables.get('silver_vitalsswt', empty_df), uid)
        }
        result.append(row)
        print(f"User {uid} status: {row}")

    return result


def get_user_vitals_status(date_str: str) -> list:
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

    dt = DeltaTable(TABLE_PATHS['bronze'])
    df = dt.to_pandas()
    df['ingestion_date'] = pd.to_datetime(
        df['ingestion_date'], dayfirst=True).dt.date.astype(str)
    df = df[df['ingestion_date'] == date_str]

    vitals = ["STEPS", "HEART_RATE", "HEART_RATE_VARIABILITY_SDNN",
              "BLOOD_OXYGEN", "RESPIRATORY_RATE"]
    result = []

    all_users = get_all_users()

    for uid in all_users:
        user_df = df[df['user_id'] == uid]
        entry = {"user_id": uid}
        for vital in vitals:
            entry[vital] = "Available" if not user_df.empty and vital in user_df['type'].values else "Missing"
        result.append(entry)

    return result


def get_summary(date_str: str) -> dict:
    # Get total users from JSON file
    json_path = os.path.join(BASE_DIR, "data", "sample.healthkit.json")
    unique_users = set()
    
    with open(json_path, 'r') as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if 'user_id' in entry:
                    unique_users.add(entry['user_id'])
            except json.JSONDecodeError:
                continue
    
    total_users = len(unique_users)
    
    # Get successful ingestions from bronze delta table
    try:
        dt = DeltaTable(TABLE_PATHS['bronze'])
        df = dt.to_pandas()
        # Convert ingestion_date to string format for comparison
        df['ingestion_date'] = pd.to_datetime(df['ingestion_date']).dt.strftime('%Y-%m-%d')
        # Filter for the selected date
        df = df[df['ingestion_date'] == date_str]
        # Count unique users who have data in bronze table
        successful_ingestions = len(df['user_id'].unique())
    except Exception as e:
        print(f"Error reading bronze table: {str(e)}")
        successful_ingestions = 0
    
    missing_count = total_users - successful_ingestions
    
    return {
        "total_users": total_users,
        "successful_ingestions": successful_ingestions,
        "missing_ingestions": missing_count
    }
