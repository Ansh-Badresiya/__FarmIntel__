import json
from pathlib import Path
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class LocationService:
    _instance = None
    _locations_data = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LocationService, cls).__new__(cls)
            cls._instance._load_data()
        return cls._instance

    def _load_data(self):
        if self._locations_data is not None:
            return
        
        data_path = Path(__file__).resolve().parent.parent / "data" / "india_locations.json"
        try:
            with open(data_path, "r", encoding="utf-8") as f:
                self._locations_data = json.load(f)
            logger.info(f"Loaded location data from {data_path}")
        except Exception as e:
            logger.error(f"Failed to load location data from {data_path}: {e}")
            self._locations_data = {"states": []}

    def get_states(self) -> List[Dict[str, str]]:
        """Return a list of states."""
        states = [st["name"] for st in self._locations_data.get("states", [])]
        states.sort()
        return [{"id": s, "name": s} for s in states]

    def get_districts(self, state_name: str) -> List[Dict[str, str]]:
        """Return a list of districts for a given state."""
        for st in self._locations_data.get("states", []):
            if st["name"].lower() == state_name.lower():
                districts = [d["name"] for d in st.get("districts", [])]
                districts.sort()
                return [{"id": d, "name": d} for d in districts]
        return []

    def get_villages(self, district_name: str) -> List[Dict[str, str]]:
        """Return a list of villages for a given district."""
        for st in self._locations_data.get("states", []):
            for d in st.get("districts", []):
                if d["name"].lower() == district_name.lower():
                    villages = d.get("villages", [])
                    villages.sort()
                    return [{"id": v, "name": v} for v in villages]
        return []

