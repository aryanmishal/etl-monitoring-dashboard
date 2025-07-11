import sys
import gzip
import json


def read_gzipped_json(filename):
    with gzip.open(filename, 'rt', encoding='utf-8') as f:
        data = json.load(f)
    return data


def print_summary(data):
    print(f"Type: {type(data)}")
    if isinstance(data, dict):
        print(f"Keys: {list(data.keys())}")
    elif isinstance(data, list):
        print(f"Length: {len(data)}")
        print(f"Sample item: {data[0] if data else '[]'}")
    else:
        print(f"Value: {data}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python read_test_data.py <path_to_gzipped_json>")
        sys.exit(1)
    filename = sys.argv[1]
    data = read_gzipped_json(filename)
    print_summary(data)

if __name__ == "__main__":
    main() 