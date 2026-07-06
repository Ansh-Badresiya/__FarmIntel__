from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

STATES = [
    {
        "id": "AN",
        "name": "Andaman and Nicobar Islands"
    },
    {
        "id": "AN",
        "name": "Andhra Pradesh"
    },
    {
        "id": "AR",
        "name": "Arunachal Pradesh"
    },
    {
        "id": "AS",
        "name": "Assam"
    },
    {
        "id": "BI",
        "name": "Bihar"
    },
    {
        "id": "CH",
        "name": "Chandigarh"
    },
    {
        "id": "CH",
        "name": "Chhattisgarh"
    },
    {
        "id": "DA",
        "name": "Dadra and Nagar Haveli"
    },
    {
        "id": "DE",
        "name": "Delhi"
    },
    {
        "id": "GO",
        "name": "Goa"
    },
    {
        "id": "GU",
        "name": "Gujarat"
    },
    {
        "id": "HA",
        "name": "Haryana"
    },
    {
        "id": "HI",
        "name": "Himachal Pradesh"
    },
    {
        "id": "JA",
        "name": "Jammu and Kashmir"
    },
    {
        "id": "JH",
        "name": "Jharkhand"
    },
    {
        "id": "KA",
        "name": "Karnataka"
    },
    {
        "id": "KE",
        "name": "Kerala"
    },
    {
        "id": "MA",
        "name": "Madhya Pradesh"
    },
    {
        "id": "MA",
        "name": "Maharashtra"
    },
    {
        "id": "MA",
        "name": "Manipur"
    },
    {
        "id": "ME",
        "name": "Meghalaya"
    },
    {
        "id": "MI",
        "name": "Mizoram"
    },
    {
        "id": "NA",
        "name": "Nagaland"
    },
    {
        "id": "OD",
        "name": "Odisha"
    },
    {
        "id": "PU",
        "name": "Puducherry"
    },
    {
        "id": "PU",
        "name": "Punjab"
    },
    {
        "id": "RA",
        "name": "Rajasthan"
    },
    {
        "id": "SI",
        "name": "Sikkim"
    },
    {
        "id": "TA",
        "name": "Tamil Nadu"
    },
    {
        "id": "TE",
        "name": "Telangana"
    },
    {
        "id": "TR",
        "name": "Tripura"
    },
    {
        "id": "UT",
        "name": "Uttar Pradesh"
    },
    {
        "id": "UT",
        "name": "Uttarakhand"
    },
    {
        "id": "WE",
        "name": "West Bengal"
    }
]

DISTRICTS = {
    "Andaman and Nicobar Islands": [
        {
            "id": "AN1",
            "name": "Andaman and Nicobar Islands District 1"
        },
        {
            "id": "AN2",
            "name": "Andaman and Nicobar Islands District 2"
        }
    ],
    "Andhra Pradesh": [
        {
            "id": "AN1",
            "name": "Andhra Pradesh District 1"
        },
        {
            "id": "AN2",
            "name": "Andhra Pradesh District 2"
        }
    ],
    "Arunachal Pradesh": [
        {
            "id": "AR1",
            "name": "Arunachal Pradesh District 1"
        },
        {
            "id": "AR2",
            "name": "Arunachal Pradesh District 2"
        }
    ],
    "Assam": [
        {
            "id": "AS1",
            "name": "Assam District 1"
        },
        {
            "id": "AS2",
            "name": "Assam District 2"
        }
    ],
    "Bihar": [
        {
            "id": "BI1",
            "name": "Bihar District 1"
        },
        {
            "id": "BI2",
            "name": "Bihar District 2"
        }
    ],
    "Chandigarh": [
        {
            "id": "CH1",
            "name": "Chandigarh District 1"
        },
        {
            "id": "CH2",
            "name": "Chandigarh District 2"
        }
    ],
    "Chhattisgarh": [
        {
            "id": "CH1",
            "name": "Chhattisgarh District 1"
        },
        {
            "id": "CH2",
            "name": "Chhattisgarh District 2"
        }
    ],
    "Dadra and Nagar Haveli": [
        {
            "id": "DA1",
            "name": "Dadra and Nagar Haveli District 1"
        },
        {
            "id": "DA2",
            "name": "Dadra and Nagar Haveli District 2"
        }
    ],
    "Delhi": [
        {
            "id": "DE1",
            "name": "Delhi District 1"
        },
        {
            "id": "DE2",
            "name": "Delhi District 2"
        }
    ],
    "Goa": [
        {
            "id": "GO1",
            "name": "Goa District 1"
        },
        {
            "id": "GO2",
            "name": "Goa District 2"
        }
    ],
    "Gujarat": [
        {
            "id": "GU1",
            "name": "Gujarat District 1"
        },
        {
            "id": "GU2",
            "name": "Gujarat District 2"
        }
    ],
    "Haryana": [
        {
            "id": "HA1",
            "name": "Haryana District 1"
        },
        {
            "id": "HA2",
            "name": "Haryana District 2"
        }
    ],
    "Himachal Pradesh": [
        {
            "id": "HI1",
            "name": "Himachal Pradesh District 1"
        },
        {
            "id": "HI2",
            "name": "Himachal Pradesh District 2"
        }
    ],
    "Jammu and Kashmir": [
        {
            "id": "JA1",
            "name": "Jammu and Kashmir District 1"
        },
        {
            "id": "JA2",
            "name": "Jammu and Kashmir District 2"
        }
    ],
    "Jharkhand": [
        {
            "id": "JH1",
            "name": "Jharkhand District 1"
        },
        {
            "id": "JH2",
            "name": "Jharkhand District 2"
        }
    ],
    "Karnataka": [
        {
            "id": "KA1",
            "name": "Karnataka District 1"
        },
        {
            "id": "KA2",
            "name": "Karnataka District 2"
        }
    ],
    "Kerala": [
        {
            "id": "KE1",
            "name": "Kerala District 1"
        },
        {
            "id": "KE2",
            "name": "Kerala District 2"
        }
    ],
    "Madhya Pradesh": [
        {
            "id": "MA1",
            "name": "Madhya Pradesh District 1"
        },
        {
            "id": "MA2",
            "name": "Madhya Pradesh District 2"
        }
    ],
    "Maharashtra": [
        {
            "id": "MA1",
            "name": "Maharashtra District 1"
        },
        {
            "id": "MA2",
            "name": "Maharashtra District 2"
        }
    ],
    "Manipur": [
        {
            "id": "MA1",
            "name": "Manipur District 1"
        },
        {
            "id": "MA2",
            "name": "Manipur District 2"
        }
    ],
    "Meghalaya": [
        {
            "id": "ME1",
            "name": "Meghalaya District 1"
        },
        {
            "id": "ME2",
            "name": "Meghalaya District 2"
        }
    ],
    "Mizoram": [
        {
            "id": "MI1",
            "name": "Mizoram District 1"
        },
        {
            "id": "MI2",
            "name": "Mizoram District 2"
        }
    ],
    "Nagaland": [
        {
            "id": "NA1",
            "name": "Nagaland District 1"
        },
        {
            "id": "NA2",
            "name": "Nagaland District 2"
        }
    ],
    "Odisha": [
        {
            "id": "OD1",
            "name": "Odisha District 1"
        },
        {
            "id": "OD2",
            "name": "Odisha District 2"
        }
    ],
    "Puducherry": [
        {
            "id": "PU1",
            "name": "Puducherry District 1"
        },
        {
            "id": "PU2",
            "name": "Puducherry District 2"
        }
    ],
    "Punjab": [
        {
            "id": "PU1",
            "name": "Punjab District 1"
        },
        {
            "id": "PU2",
            "name": "Punjab District 2"
        }
    ],
    "Rajasthan": [
        {
            "id": "RA1",
            "name": "Rajasthan District 1"
        },
        {
            "id": "RA2",
            "name": "Rajasthan District 2"
        }
    ],
    "Sikkim": [
        {
            "id": "SI1",
            "name": "Sikkim District 1"
        },
        {
            "id": "SI2",
            "name": "Sikkim District 2"
        }
    ],
    "Tamil Nadu": [
        {
            "id": "TA1",
            "name": "Tamil Nadu District 1"
        },
        {
            "id": "TA2",
            "name": "Tamil Nadu District 2"
        }
    ],
    "Telangana": [
        {
            "id": "TE1",
            "name": "Telangana District 1"
        },
        {
            "id": "TE2",
            "name": "Telangana District 2"
        }
    ],
    "Tripura": [
        {
            "id": "TR1",
            "name": "Tripura District 1"
        },
        {
            "id": "TR2",
            "name": "Tripura District 2"
        }
    ],
    "Uttar Pradesh": [
        {
            "id": "UT1",
            "name": "Uttar Pradesh District 1"
        },
        {
            "id": "UT2",
            "name": "Uttar Pradesh District 2"
        }
    ],
    "Uttarakhand": [
        {
            "id": "UT1",
            "name": "Uttarakhand District 1"
        },
        {
            "id": "UT2",
            "name": "Uttarakhand District 2"
        }
    ],
    "West Bengal": [
        {
            "id": "WE1",
            "name": "West Bengal District 1"
        },
        {
            "id": "WE2",
            "name": "West Bengal District 2"
        }
    ]
}

# Note: Villages are strictly mock
VILLAGES = {
    d["name"]: [{"id": "V1", "name": "Village 1"}, {"id": "V2", "name": "Village 2"}]
    for state_dists in DISTRICTS.values() for d in state_dists
}

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
    return {"states": STATES}

@router.get("/locations/districts")
def get_districts(state: str) -> Dict[str, Any]:
    found_districts = []
    for st_name, dists in DISTRICTS.items():
        if state.lower() == st_name.lower():
            found_districts = dists
            break
        for s in STATES:
            if s["id"].lower() == state.lower() and s["name"].lower() == st_name.lower():
                found_districts = dists
                break
    return {"districts": found_districts or [{"id": "unknown", "name": "Default District"}]}

@router.get("/locations/villages")
def get_villages(district: str) -> Dict[str, Any]:
    found_villages = VILLAGES.get(district, [])
    return {"villages": found_villages or [{"id": "unknown", "name": "Default Village"}]}

@router.get("/crops")
def get_crops(season: str = None) -> Dict[str, Any]:
    return {"crops": CROPS}

@router.get("/irrigation-types")
def get_irrigation_types() -> Dict[str, Any]:
    return {"irrigation_types": IRRIGATION_TYPES}
