"""Project-wide configuration for reproducible ML workflows."""

from pathlib import Path

RANDOM_STATE = 42
TEST_SIZE = 0.2

ROOT_DIR = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = ROOT_DIR / "data" / "raw"
PROCESSED_DATA_DIR = ROOT_DIR / "data" / "processed"
MODELS_DIR = ROOT_DIR / "models"
OUTPUTS_DIR = ROOT_DIR / "outputs"


for required_dir in (PROCESSED_DATA_DIR, MODELS_DIR, OUTPUTS_DIR):
    required_dir.mkdir(parents=True, exist_ok=True)
