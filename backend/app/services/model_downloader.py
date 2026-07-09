"""
model_downloader.py
===================
FarmIntel — Lazy downloader for Hugging Face ML artifacts.
Downloads models only on first request to minimize startup memory and time.
"""
import os
import threading
import logging
from pathlib import Path
from huggingface_hub import hf_hub_download
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load env in case this runs standalone or HF_TOKEN is not in env yet
load_dotenv()

_SERVICE_DIR = Path(__file__).resolve().parent          # .../backend/app/services
_PROJECT_ROOT = _SERVICE_DIR.parents[2]                 # .../FarmIntel
_CACHE_DIR = _PROJECT_ROOT / "backend" / "ml-models-cache"

# Define the exact files needed per stage based on ml_service.py
_STAGE_FILES = {
    "stage1": [
        "models/crop_category_xgboost.pkl",
        "models/ordinal_encoder.pkl",
        "models/label_encoder.pkl",
        "models/crop_categories.json",
        "models/feature_columns.json",
    ],
    "history": [
        "data/processed/crop_train.csv",
    ],
    "stage3": [
        "models/yield_random_forest.pkl",
        "models/yield_ordinal_encoder.pkl",
        "models/yield_feature_columns.json",
    ]
}

class ModelDownloader:
    """
    Singleton class to manage thread-safe downloads of ML artifacts from Hugging Face.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    obj = super().__new__(cls)
                    obj._downloaded_stages = set()
                    obj._repo_id = os.environ.get("HF_REPO_ID")
                    obj._token = os.environ.get("HF_TOKEN")
                    
                    if not obj._repo_id:
                        logger.warning("HF_REPO_ID is not set in environment variables! Model downloads will fail.")
                        
                    cls._instance = obj
        return cls._instance

    def ensure_downloaded(self, stage: str) -> None:
        """
        Ensures all files for a given stage are downloaded locally.
        If already downloaded in this session, returns immediately.
        """
        if stage in self._downloaded_stages:
            return

        with self._lock:
            if stage in self._downloaded_stages:
                return

            if not self._repo_id:
                raise ValueError("HF_REPO_ID is missing! Please set HF_REPO_ID in your .env file to your Hugging Face model repository (e.g., 'username/repo-name').")

            logger.info(f"Checking local cache for {stage} artifacts...")
            
            files = _STAGE_FILES.get(stage, [])
            for file_path in files:
                local_path = _CACHE_DIR / file_path
                
                # Check if it physically exists first so we can log a cache hit
                if local_path.exists():
                    logger.info(f"[CACHE HIT] {file_path} already exists locally.")
                else:
                    logger.info(f"[DOWNLOADING] {file_path} from Hugging Face ({self._repo_id})...")
                    try:
                        hf_hub_download(
                            repo_id=self._repo_id,
                            filename=file_path,
                            local_dir=str(_CACHE_DIR),
                            local_dir_use_symlinks=False,
                            token=self._token
                        )
                        logger.info(f"[DOWNLOAD COMPLETE] {file_path}")
                    except Exception as e:
                        logger.error(f"[DOWNLOAD FAILED] Failed to download {file_path}: {e}")
                        raise e

            self._downloaded_stages.add(stage)
            logger.info(f"All {stage} artifacts are ready.")

    @classmethod
    def get_cache_dir(cls) -> Path:
        return _CACHE_DIR
