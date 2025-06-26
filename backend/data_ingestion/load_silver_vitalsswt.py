import pandas as pd
from deltalake.writer import write_deltalake
import os
import shutil


def load_silver_vitalsswt_csv():
    df = pd.read_csv('backend/data/silver_hv_vitalsswt_intern.csv')
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    table_path = os.path.join(BASE_DIR, 'delta_tables', 'silver_vitalsswt')

    if os.path.exists(table_path):
        shutil.rmtree(table_path)
    os.makedirs(table_path, exist_ok=True)

    write_deltalake(table_path, df, mode='overwrite')
    print("[SUCCESS] Silver VitalSWT data loaded into Delta table.")


if __name__ == "__main__":
    load_silver_vitalsswt_csv()
