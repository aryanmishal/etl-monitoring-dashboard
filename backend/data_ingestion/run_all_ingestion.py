import subprocess
import logging
import sys
import os
from pathlib import Path

# Set environment variables to handle Unicode output
os.environ["PYTHONIOENCODING"] = "utf-8"

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

def run_script(script_name):
    """Run a Python script and handle its execution."""
    try:
        logging.info(f"Starting execution of {script_name}")
        # Set environment variables for the subprocess
        env = os.environ.copy()
        env["PYTHONIOENCODING"] = "utf-8"
        
        result = subprocess.run(
            [sys.executable, script_name],
            check=True,
            capture_output=True,
            text=True,
            encoding='utf-8',
            env=env
        )
        logging.info(f"Successfully completed {script_name}")
        if result.stdout:
            logging.info(f"Output from {script_name}:\n{result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"Error running {script_name}:")
        logging.error(f"Exit code: {e.returncode}")
        logging.error(f"Error output: {e.stderr}")
        return False
    except Exception as e:
        logging.error(f"Unexpected error running {script_name}: {str(e)}")
        return False

def main():
    # Get the directory where this script is located
    current_dir = Path(__file__).parent
    
    # List of scripts to run in order
    scripts = [
        "load_bronze.py",
        "load_silver_vitalsswt.py",
        "load_silver_vitalsbaseline.py",
        "load_silver_rrbucket.py"
    ]
    
    # Run each script
    success = True
    for script in scripts:
        script_path = current_dir / script
        if not script_path.exists():
            logging.error(f"Script not found: {script}")
            success = False
            continue
            
        if not run_script(str(script_path)):
            success = False
            logging.error(f"Stopping execution due to error in {script}")
            break
    
    if success:
        logging.info("All data ingestion scripts completed successfully!")
    else:
        logging.error("Data ingestion process completed with errors")
        sys.exit(1)

if __name__ == "__main__":
    main() 