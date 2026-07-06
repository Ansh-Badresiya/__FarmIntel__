from app.db.session import SessionLocal
from app.models.regional_soil_data import RegionalSoilData

SEED_DATA = [
    {
        "state": "Maharashtra",
        "district": "Pune",
        "avg_nitrogen": 240.0,
        "avg_phosphorus": 18.0,
        "avg_potassium": 280.0,
        "avg_ph": 7.2,
        "avg_temperature": 28.5,
        "avg_humidity": 65.0,
        "avg_rainfall": 1200.0,
        "season": "Kharif"
    },
    {
        "state": "Maharashtra",
        "district": "Pune",
        "avg_nitrogen": 220.0,
        "avg_phosphorus": 15.0,
        "avg_potassium": 260.0,
        "avg_ph": 7.1,
        "avg_temperature": 22.5,
        "avg_humidity": 45.0,
        "avg_rainfall": 100.0,
        "season": "Rabi"
    },
    {
        "state": "Punjab",
        "district": "Ludhiana",
        "avg_nitrogen": 280.0,
        "avg_phosphorus": 22.0,
        "avg_potassium": 300.0,
        "avg_ph": 7.5,
        "avg_temperature": 32.0,
        "avg_humidity": 55.0,
        "avg_rainfall": 800.0,
        "season": "Kharif"
    },
    {
        "state": "Gujarat",
        "district": "Ahmedabad",
        "avg_nitrogen": 210.0,
        "avg_phosphorus": 15.0,
        "avg_potassium": 250.0,
        "avg_ph": 7.8,
        "avg_temperature": 29.0,
        "avg_humidity": 50.0,
        "avg_rainfall": 700.0,
        "season": "Kharif"
    },
    {
        "state": "Gujarat",
        "district": "Ahmedabad",
        "avg_nitrogen": 190.0,
        "avg_phosphorus": 12.0,
        "avg_potassium": 230.0,
        "avg_ph": 7.7,
        "avg_temperature": 21.0,
        "avg_humidity": 40.0,
        "avg_rainfall": 50.0,
        "season": "Rabi"
    }
]

def seed_regional_soil_data():
    db = SessionLocal()
    try:
        # Clear existing data
        db.query(RegionalSoilData).delete()
        
        for data in SEED_DATA:
            record = RegionalSoilData(**data)
            db.add(record)
            
        db.commit()
        print("Successfully seeded RegionalSoilData")
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_regional_soil_data()
