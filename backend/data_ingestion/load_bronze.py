import pandas as pd
from deltalake.writer import write_deltalake
import os
import shutil
import gzip
import json
from datetime import datetime, UTC

def read_gzipped_json(filename):
    with gzip.open(filename, 'rt', encoding='utf-8') as f:
        return json.load(f)

def flatten_dict_column(df, col, prefix):
    if col in df.columns:
        dict_df = df[col].apply(lambda x: x if isinstance(x, dict) else {}).apply(pd.Series)
        dict_df = dict_df.add_prefix(prefix)
        df = pd.concat([df.drop(columns=[col]), dict_df], axis=1)
    return df

def extract_user_and_date_from_filename(filename):
    # filename: <user_id>_<timestamp>....gz
    base = os.path.basename(filename)
    parts = base.split('_')
    user_id = parts[0]
    timestamp = parts[1].replace('.gz', '')  # Remove .gz extension
    # Convert UTC ms timestamp to YYYY-MM-DD
    try:
        dt = datetime.fromtimestamp(int(timestamp) / 1000, UTC)
        date_str = dt.strftime('%Y-%m-%d')
    except Exception as e:
        print(f"Error converting timestamp {timestamp} for {filename}: {e}")
        date_str = ''
    return user_id, date_str

def load_bronze_and_silver_from_gz():
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(BASE_DIR, 'data')
    files = [os.path.join(data_dir, f) for f in os.listdir(data_dir) if f.endswith('.gz')]
    all_records = []
    for file in files:
        user_id, ingestion_date = extract_user_and_date_from_filename(file)
        records = read_gzipped_json(file)
        if isinstance(records, list):
            for rec in records:
                rec['user_id'] = user_id
                rec['ingestion_date'] = ingestion_date
            all_records.extend(records)
        else:
            records['user_id'] = user_id
            records['ingestion_date'] = ingestion_date
            all_records.append(records)
    df = pd.DataFrame(all_records)

    # Flatten dict columns
    df = flatten_dict_column(df, 'deviceInfo', 'device_')
    df = flatten_dict_column(df, 'metadata', 'meta_')

    # Write to bronze and all silver tables
    table_paths = {
        'bronze': os.path.join(BASE_DIR, 'delta_tables', 'bronze'),
        'silver_rrbucket': os.path.join(BASE_DIR, 'delta_tables', 'silver_rrbucket'),
        'silver_vitalsbaseline': os.path.join(BASE_DIR, 'delta_tables', 'silver_vitalsbaseline'),
        'silver_vitalsswt': os.path.join(BASE_DIR, 'delta_tables', 'silver_vitalsswt'),
    }
    for name, path in table_paths.items():
        if os.path.exists(path):
            shutil.rmtree(path)
        os.makedirs(path, exist_ok=True)
        write_deltalake(path, df, mode='overwrite')
        print(f"[SUCCESS] Data loaded into Delta table: {name}")

if __name__ == "__main__":
    load_bronze_and_silver_from_gz()
