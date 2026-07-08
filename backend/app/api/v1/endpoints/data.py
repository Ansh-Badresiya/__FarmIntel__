from fastapi import APIRouter
from typing import List, Dict, Any
from app.services.ml_service import _store

router = APIRouter()

from app.services.location_service import LocationService

location_service = LocationService()
CROPS = [
    {
        "id": "arecanut",
        "name": "Arecanut",
        "season": "Kharif"
    },
    {
        "id": "arhar/tur",
        "name": "Arhar/Tur",
        "season": "Kharif"
    },
    {
        "id": "ash_gourd",
        "name": "Ash Gourd",
        "season": "Kharif"
    },
    {
        "id": "bajra",
        "name": "Bajra",
        "season": "Kharif"
    },
    {
        "id": "banana",
        "name": "Banana",
        "season": "Kharif"
    },
    {
        "id": "barley",
        "name": "Barley",
        "season": "Kharif"
    },
    {
        "id": "bean",
        "name": "Bean",
        "season": "Kharif"
    },
    {
        "id": "beans_&_mutter(vegetable)",
        "name": "Beans & Mutter(Vegetable)",
        "season": "Kharif"
    },
    {
        "id": "beet_root",
        "name": "Beet Root",
        "season": "Kharif"
    },
    {
        "id": "ber",
        "name": "Ber",
        "season": "Kharif"
    },
    {
        "id": "bhindi",
        "name": "Bhindi",
        "season": "Kharif"
    },
    {
        "id": "bitter_gourd",
        "name": "Bitter Gourd",
        "season": "Kharif"
    },
    {
        "id": "black_pepper",
        "name": "Black pepper",
        "season": "Kharif"
    },
    {
        "id": "blackgram",
        "name": "Blackgram",
        "season": "Kharif"
    },
    {
        "id": "bottle_gourd",
        "name": "Bottle Gourd",
        "season": "Kharif"
    },
    {
        "id": "brinjal",
        "name": "Brinjal",
        "season": "Kharif"
    },
    {
        "id": "cabbage",
        "name": "Cabbage",
        "season": "Kharif"
    },
    {
        "id": "cardamom",
        "name": "Cardamom",
        "season": "Kharif"
    },
    {
        "id": "carrot",
        "name": "Carrot",
        "season": "Kharif"
    },
    {
        "id": "cashewnut",
        "name": "Cashewnut",
        "season": "Kharif"
    },
    {
        "id": "castor_seed",
        "name": "Castor seed",
        "season": "Kharif"
    },
    {
        "id": "cauliflower",
        "name": "Cauliflower",
        "season": "Kharif"
    },
    {
        "id": "citrus_fruit",
        "name": "Citrus Fruit",
        "season": "Kharif"
    },
    {
        "id": "coconut",
        "name": "Coconut",
        "season": "Kharif"
    },
    {
        "id": "colocosia",
        "name": "Colocosia",
        "season": "Kharif"
    },
    {
        "id": "cond-spcs_other",
        "name": "Cond-spcs other",
        "season": "Kharif"
    },
    {
        "id": "coriander",
        "name": "Coriander",
        "season": "Kharif"
    },
    {
        "id": "cotton(lint)",
        "name": "Cotton(lint)",
        "season": "Kharif"
    },
    {
        "id": "cowpea(lobia)",
        "name": "Cowpea(Lobia)",
        "season": "Kharif"
    },
    {
        "id": "cucumber",
        "name": "Cucumber",
        "season": "Kharif"
    },
    {
        "id": "drum_stick",
        "name": "Drum Stick",
        "season": "Kharif"
    },
    {
        "id": "dry_chillies",
        "name": "Dry chillies",
        "season": "Kharif"
    },
    {
        "id": "dry_ginger",
        "name": "Dry ginger",
        "season": "Kharif"
    },
    {
        "id": "garlic",
        "name": "Garlic",
        "season": "Kharif"
    },
    {
        "id": "ginger",
        "name": "Ginger",
        "season": "Kharif"
    },
    {
        "id": "gram",
        "name": "Gram",
        "season": "Kharif"
    },
    {
        "id": "grapes",
        "name": "Grapes",
        "season": "Kharif"
    },
    {
        "id": "groundnut",
        "name": "Groundnut",
        "season": "Kharif"
    },
    {
        "id": "guar_seed",
        "name": "Guar seed",
        "season": "Kharif"
    },
    {
        "id": "horse-gram",
        "name": "Horse-gram",
        "season": "Kharif"
    },
    {
        "id": "jack_fruit",
        "name": "Jack Fruit",
        "season": "Kharif"
    },
    {
        "id": "jobster",
        "name": "Jobster",
        "season": "Kharif"
    },
    {
        "id": "jowar",
        "name": "Jowar",
        "season": "Kharif"
    },
    {
        "id": "jute",
        "name": "Jute",
        "season": "Kharif"
    },
    {
        "id": "kapas",
        "name": "Kapas",
        "season": "Kharif"
    },
    {
        "id": "khesari",
        "name": "Khesari",
        "season": "Kharif"
    },
    {
        "id": "korra",
        "name": "Korra",
        "season": "Kharif"
    },
    {
        "id": "lab-lab",
        "name": "Lab-Lab",
        "season": "Kharif"
    },
    {
        "id": "lemon",
        "name": "Lemon",
        "season": "Kharif"
    },
    {
        "id": "lentil",
        "name": "Lentil",
        "season": "Kharif"
    },
    {
        "id": "linseed",
        "name": "Linseed",
        "season": "Kharif"
    },
    {
        "id": "maize",
        "name": "Maize",
        "season": "Kharif"
    },
    {
        "id": "mango",
        "name": "Mango",
        "season": "Kharif"
    },
    {
        "id": "masoor",
        "name": "Masoor",
        "season": "Kharif"
    },
    {
        "id": "mesta",
        "name": "Mesta",
        "season": "Kharif"
    },
    {
        "id": "moong(green_gram)",
        "name": "Moong(Green Gram)",
        "season": "Kharif"
    },
    {
        "id": "moth",
        "name": "Moth",
        "season": "Kharif"
    },
    {
        "id": "niger_seed",
        "name": "Niger seed",
        "season": "Kharif"
    },
    {
        "id": "oilseeds_total",
        "name": "Oilseeds total",
        "season": "Kharif"
    },
    {
        "id": "onion",
        "name": "Onion",
        "season": "Kharif"
    },
    {
        "id": "orange",
        "name": "Orange",
        "season": "Kharif"
    },
    {
        "id": "other__rabi_pulses",
        "name": "Other  Rabi pulses",
        "season": "Kharif"
    },
    {
        "id": "other_cereals",
        "name": "Other Cereals",
        "season": "Kharif"
    },
    {
        "id": "other_cereals_&_millets",
        "name": "Other Cereals & Millets",
        "season": "Kharif"
    },
    {
        "id": "other_citrus_fruit",
        "name": "Other Citrus Fruit",
        "season": "Kharif"
    },
    {
        "id": "other_dry_fruit",
        "name": "Other Dry Fruit",
        "season": "Kharif"
    },
    {
        "id": "other_fibres",
        "name": "Other Fibres",
        "season": "Kharif"
    },
    {
        "id": "other_fresh_fruits",
        "name": "Other Fresh Fruits",
        "season": "Kharif"
    },
    {
        "id": "other_kharif_pulses",
        "name": "Other Kharif pulses",
        "season": "Kharif"
    },
    {
        "id": "other_pulses",
        "name": "Other Pulses",
        "season": "Kharif"
    },
    {
        "id": "other_summer_pulses",
        "name": "Other Summer Pulses",
        "season": "Kharif"
    },
    {
        "id": "other_vegetables",
        "name": "Other Vegetables",
        "season": "Kharif"
    },
    {
        "id": "paddy",
        "name": "Paddy",
        "season": "Kharif"
    },
    {
        "id": "papaya",
        "name": "Papaya",
        "season": "Kharif"
    },
    {
        "id": "peas_&_beans_(pulses)",
        "name": "Peas & beans (Pulses)",
        "season": "Kharif"
    },
    {
        "id": "perilla",
        "name": "Perilla",
        "season": "Kharif"
    },
    {
        "id": "pineapple",
        "name": "Pineapple",
        "season": "Kharif"
    },
    {
        "id": "pome_fruit",
        "name": "Pome Fruit",
        "season": "Kharif"
    },
    {
        "id": "pome_granet",
        "name": "Pome Granet",
        "season": "Kharif"
    },
    {
        "id": "potato",
        "name": "Potato",
        "season": "Kharif"
    },
    {
        "id": "pulses_total",
        "name": "Pulses total",
        "season": "Kharif"
    },
    {
        "id": "pump_kin",
        "name": "Pump Kin",
        "season": "Kharif"
    },
    {
        "id": "ragi",
        "name": "Ragi",
        "season": "Kharif"
    },
    {
        "id": "rajmash_kholar",
        "name": "Rajmash Kholar",
        "season": "Kharif"
    },
    {
        "id": "rapeseed_&mustard",
        "name": "Rapeseed &Mustard",
        "season": "Kharif"
    },
    {
        "id": "redish",
        "name": "Redish",
        "season": "Kharif"
    },
    {
        "id": "ribed_guard",
        "name": "Ribed Guard",
        "season": "Kharif"
    },
    {
        "id": "rice",
        "name": "Rice",
        "season": "Kharif"
    },
    {
        "id": "ricebean_(nagadal)",
        "name": "Ricebean (nagadal)",
        "season": "Kharif"
    },
    {
        "id": "rubber",
        "name": "Rubber",
        "season": "Kharif"
    },
    {
        "id": "safflower",
        "name": "Safflower",
        "season": "Kharif"
    },
    {
        "id": "samai",
        "name": "Samai",
        "season": "Kharif"
    },
    {
        "id": "sannhamp",
        "name": "Sannhamp",
        "season": "Kharif"
    },
    {
        "id": "sapota",
        "name": "Sapota",
        "season": "Kharif"
    },
    {
        "id": "sesamum",
        "name": "Sesamum",
        "season": "Kharif"
    },
    {
        "id": "small_millets",
        "name": "Small millets",
        "season": "Kharif"
    },
    {
        "id": "snak_guard",
        "name": "Snak Guard",
        "season": "Kharif"
    },
    {
        "id": "soyabean",
        "name": "Soyabean",
        "season": "Kharif"
    },
    {
        "id": "sugarcane",
        "name": "Sugarcane",
        "season": "Kharif"
    },
    {
        "id": "sunflower",
        "name": "Sunflower",
        "season": "Kharif"
    },
    {
        "id": "sweet_potato",
        "name": "Sweet potato",
        "season": "Kharif"
    },
    {
        "id": "tapioca",
        "name": "Tapioca",
        "season": "Kharif"
    },
    {
        "id": "tea",
        "name": "Tea",
        "season": "Kharif"
    },
    {
        "id": "tobacco",
        "name": "Tobacco",
        "season": "Kharif"
    },
    {
        "id": "tomato",
        "name": "Tomato",
        "season": "Kharif"
    },
    {
        "id": "total_foodgrain",
        "name": "Total foodgrain",
        "season": "Kharif"
    },
    {
        "id": "turmeric",
        "name": "Turmeric",
        "season": "Kharif"
    },
    {
        "id": "urad",
        "name": "Urad",
        "season": "Kharif"
    },
    {
        "id": "varagu",
        "name": "Varagu",
        "season": "Kharif"
    },
    {
        "id": "water_melon",
        "name": "Water Melon",
        "season": "Kharif"
    },
    {
        "id": "wheat",
        "name": "Wheat",
        "season": "Kharif"
    },
    {
        "id": "yam",
        "name": "Yam",
        "season": "Kharif"
    },
    {
        "id": "other_oilseeds",
        "name": "other oilseeds",
        "season": "Kharif"
    }
]

IRRIGATION_TYPES = [
    {
        "id": "drip",
        "name": "Drip"
    },
    {
        "id": "flood",
        "name": "Flood"
    },
    {
        "id": "rainfed",
        "name": "Rainfed"
    },
    {
        "id": "sprinkler",
        "name": "Sprinkler"
    }
]

@router.get("/locations/states")
def get_states() -> Dict[str, Any]:
    states = location_service.get_states()
    return {"states": states}

@router.get("/locations/districts")
def get_districts(state: str) -> Dict[str, Any]:
    districts = location_service.get_districts(state)
    return {"districts": districts}

@router.get("/locations/villages")
def get_villages(district: str) -> Dict[str, Any]:
    villages = location_service.get_villages(district)
    return {"villages": villages}

@router.get("/crops")
def get_crops(season: str = None) -> Dict[str, Any]:
    return {"crops": CROPS}

@router.get("/irrigation-types")
def get_irrigation_types() -> Dict[str, Any]:
    return {"irrigation_types": IRRIGATION_TYPES}
