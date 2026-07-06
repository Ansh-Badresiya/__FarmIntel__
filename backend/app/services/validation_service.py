from typing import Dict, Any, Tuple, Optional

class ValidationService:
    @staticmethod
    def validate_manual_soil_data(data: Dict[str, Any]) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Validate manual soil entries based on predefined ranges.
        Returns (is_valid, error_dict_if_invalid)
        """
        rules = {
            "nitrogen": {"min": 0, "max": 500, "message": "Nitrogen value must be between 0 and 500"},
            "phosphorus": {"min": 0, "max": 100, "message": "Phosphorus value must be between 0 and 100"},
            "potassium": {"min": 0, "max": 500, "message": "Potassium value must be between 0 and 500"},
            "ph": {"min": 0, "max": 14, "message": "pH value must be between 0 and 14"},
            "temperature": {"min": -10, "max": 55, "message": "Temperature value must be between -10 and 55"},
            "humidity": {"min": 0, "max": 100, "message": "Humidity value must be between 0 and 100"},
            "rainfall": {"min": 0, "max": 5000, "message": "Rainfall value must be between 0 and 5000"}
        }

        for field, rule in rules.items():
            if field in data and data[field] is not None:
                val = data[field]
                if not isinstance(val, (int, float)):
                    return False, {
                        "status": "error",
                        "field": field,
                        "message": f"{field.capitalize()} must be a number",
                        "provided_value": val
                    }
                if val < rule["min"] or val > rule["max"]:
                    return False, {
                        "status": "error",
                        "field": field,
                        "message": rule["message"],
                        "provided_value": val
                    }

        return True, None
