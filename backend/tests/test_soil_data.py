import pytest
from app.services.validation_service import ValidationService
from app.services.ml_service import MLService

def test_validation_service_valid():
    valid_data = {
        "nitrogen": 250,
        "phosphorus": 45.5,
        "potassium": 300,
        "ph": 7.0,
        "temperature": 25.5,
        "humidity": 60,
        "rainfall": 1000
    }
    is_valid, error = ValidationService.validate_manual_soil_data(valid_data)
    assert is_valid is True
    assert error is None

def test_validation_service_invalid_ph():
    invalid_data = {
        "nitrogen": 250,
        "ph": 15.0 # Invalid
    }
    is_valid, error = ValidationService.validate_manual_soil_data(invalid_data)
    assert is_valid is False
    assert error is not None
    assert error["field"] == "ph"

def test_validation_service_invalid_nitrogen_type():
    invalid_data = {
        "nitrogen": "high"
    }
    is_valid, error = ValidationService.validate_manual_soil_data(invalid_data)
    assert is_valid is False
    assert error["field"] == "nitrogen"
    assert "number" in error["message"]

def test_ml_service_crop_recommend():
    res = MLService.predict_crop(
        nitrogen=100, phosphorus=20, potassium=30, ph=6.5,
        temperature=25, humidity=50, rainfall=500, source="manual"
    )
    assert res["recommended_crop"] == "Cotton"
    assert res["soil_data_used"]["source"] == "manual"
    assert "all_recommendations" in res

def test_ml_service_yield_predict():
    res = MLService.predict_yield(
        crop="Wheat", season="Rabi", state="Punjab", area=2.0,
        rainfall=300, temperature=20, irrigation="Canal"
    )
    assert res["predicted_yield"] == 7.0 # 3.5 * 2.0
    assert res["features_used"]["crop"] == "Wheat"
    assert res["features_used"]["area"] == 2.0
