from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.regional_soil_data import RegionalSoilData

class SoilDataService:
    def __init__(self, db: Session):
        self.db = db

    def get_soil_data_by_location(
        self, state: str, district: str, village: str = None, season: str = None
    ) -> Optional[Dict[str, float]]:
        """
        Fetch average soil nutrients and weather data for a given location.
        Falls back to district-level averages if village is not available, or even state level.
        Here we query by state and district primarily.
        """
        query = self.db.query(RegionalSoilData).filter(
            RegionalSoilData.state.ilike(state),
            RegionalSoilData.district.ilike(district)
        )
        
        if season:
            query = query.filter(RegionalSoilData.season.ilike(season))
            
        data = query.first()
        
        if not data:
            # Fallback to just state if district not found
            query = self.db.query(RegionalSoilData).filter(
                RegionalSoilData.state.ilike(state)
            )
            if season:
                query = query.filter(RegionalSoilData.season.ilike(season))
            data = query.first()
            
        if not data:
            return None

        return {
            "nitrogen": data.avg_nitrogen,
            "phosphorus": data.avg_phosphorus,
            "potassium": data.avg_potassium,
            "ph": data.avg_ph,
            "temperature": data.avg_temperature,
            "humidity": data.avg_humidity,
            "rainfall": data.avg_rainfall,
            "data_source": f"Regional Average ({data.district} District)"
        }
