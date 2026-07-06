from typing import Dict, Any, List

class MLService:
    @staticmethod
    def predict_crop(
        nitrogen: float, phosphorus: float, potassium: float, ph: float,
        temperature: float, humidity: float, rainfall: float,
        source: str
    ) -> Dict[str, Any]:
        """
        Mock crop recommendation prediction
        """
        # A real implementation would invoke a model. We'll return mock data.
        return {
            "recommended_crop": "Cotton",
            "confidence": 0.94,
            "soil_data_used": {
                "nitrogen": nitrogen,
                "phosphorus": phosphorus,
                "potassium": potassium,
                "ph": ph,
                "temperature": temperature,
                "humidity": humidity,
                "rainfall": rainfall,
                "source": source
            },
            "all_recommendations": [
                {"crop": "Cotton", "confidence": 0.94},
                {"crop": "Sugarcane", "confidence": 0.87},
                {"crop": "Wheat", "confidence": 0.72}
            ]
        }

    @staticmethod
    def predict_yield(
        crop: str, season: str, state: str, area: float,
        rainfall: float, temperature: float, irrigation: str
    ) -> Dict[str, Any]:
        """
        Mock yield prediction
        """
        base_yield = 4.2
        if crop.lower() == "wheat":
            base_yield = 3.5
        elif crop.lower() == "sugarcane":
            base_yield = 70.0

        predicted = base_yield * (area if area > 0 else 1.0)
        
        return {
            "predicted_yield": round(predicted, 2),
            "unit": "tons/hectare" if area == 1 else "tons",
            "confidence_interval": {
                "lower": round(predicted * 0.9, 2),
                "upper": round(predicted * 1.1, 2)
            },
            "features_used": {
                "crop": crop,
                "season": season,
                "state": state,
                "area": area,
                "rainfall": rainfall,
                "temperature": temperature,
                "irrigation": irrigation or "Unknown"
            }
        }
