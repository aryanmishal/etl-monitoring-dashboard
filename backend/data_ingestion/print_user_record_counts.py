import os
import gzip
import json
from datetime import datetime
import pandas as pd
from deltalake import DeltaTable

DATE = '2025-06-05'
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_dir = os.path.join(BASE_DIR, 'data')
table_paths = {
    'bronze': os.path.join(BASE_DIR, 'delta_tables', 'bronze'),
    'silver_rrbucket': os.path.join(BASE_DIR, 'delta_tables', 'silver_rrbucket'),
    'silver_vitalsbaseline': os.path.join(BASE_DIR, 'delta_tables', 'silver_vitalsbaseline'),
    'silver_vitalsswt': os.path.join(BASE_DIR, 'delta_tables', 'silver_vitalsswt'),
}

# 1. Raw records per user
def get_raw_counts(date):
    raw_counts = {}
    for fname in os.listdir(data_dir):
        if fname.endswith('.gz'):
            user_id, ingestion_date = fname.split('_')[0], fname.split('_')[1].replace('.gz', '')
            try:
                dt = datetime.utcfromtimestamp(int(ingestion_date) / 1000)
                date_str_file = dt.strftime('%Y-%m-%d')
            except Exception:
                date_str_file = ''
            if date_str_file == date:
                with gzip.open(os.path.join(data_dir, fname), 'rt', encoding='utf-8') as f:
                    records = json.load(f)
                    count = len(records) if isinstance(records, list) else 1
                    raw_counts[user_id] = raw_counts.get(user_id, 0) + count
    return raw_counts

# 2. Bronze records per user
def get_bronze_counts(date):
    bronze_counts = {}
    try:
        dt_bronze = DeltaTable(table_paths['bronze'])
        df = dt_bronze.to_pandas()
        df = df[df['ingestion_date'] == date]
        for user_id in df['user_id'].unique():
            user_records = len(df[df['user_id'] == user_id])
            bronze_counts[user_id] = user_records
    except Exception as e:
        print(f"Error reading bronze table: {e}")
    return bronze_counts

# 3. Silver records per user (sum across all 3 tables)
def get_silver_counts(date):
    silver_counts = {}
    for key in ['silver_rrbucket', 'silver_vitalsbaseline', 'silver_vitalsswt']:
        try:
            dt_silver = DeltaTable(table_paths[key])
            df = dt_silver.to_pandas()
            df = df[df['ingestion_date'] == date]
            for user_id in df['user_id'].unique():
                user_records = len(df[df['user_id'] == user_id])
                silver_counts[user_id] = silver_counts.get(user_id, 0) + user_records
        except Exception as e:
            print(f"Error reading {key}: {e}")
    return silver_counts

if __name__ == "__main__":
    raw = get_raw_counts(DATE)
    bronze = get_bronze_counts(DATE)
    silver = get_silver_counts(DATE)
    all_users = set(raw) | set(bronze) | set(silver)
    print(f"User record counts for {DATE}:")
    print(f"{'User ID':<40} {'Raw':>6} {'Bronze':>8} {'Silver':>8}")
    for user in sorted(all_users):
        print(f"{user:<40} {raw.get(user, 0):>6} {bronze.get(user, 0):>8} {silver.get(user, 0):>8}") 