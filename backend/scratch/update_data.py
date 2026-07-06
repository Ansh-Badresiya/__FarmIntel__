import pandas as pd
import json

df1 = pd.read_csv('ml-models/data/raw/crop_recomandation.csv')
df2 = pd.read_csv('ml-models/data/raw/crop_yield.csv')

states = sorted(list(set(df1['State_Name'].dropna().unique()) | set(df2['State'].dropna().unique())))
states = [s.strip() for s in states]
states = sorted(list(set(states)))

crops = sorted(list(set(df1['Crop'].dropna().unique()) | set(df2['Crop'].dropna().unique())))
crops = [c.strip() for c in crops]
crops = sorted(list(set(crops)))

seasons = sorted(list(set(df1['Season'].dropna().unique()) | set(df2['Season'].dropna().unique())))
seasons = [s.strip() for s in seasons]
seasons = sorted(list(set(seasons)))

irrigation = sorted(list(df1['Irrigation_Method'].dropna().unique()))

states_json = [{'id': s[:2].upper(), 'name': s} for s in states]

# Mock districts for each state
districts_json = {
    s: [
        {'id': f'{s[:2].upper()}1', 'name': f'{s} District 1'},
        {'id': f'{s[:2].upper()}2', 'name': f'{s} District 2'}
    ] for s in states
}

crops_json = [{'id': c.lower().replace(' ', '_'), 'name': c, 'season': 'Kharif'} for c in crops]
irrig_json = [{'id': i.lower().replace(' ', '_'), 'name': i} for i in irrigation]

out = f"""from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

STATES = {json.dumps(states_json, indent=4)}

DISTRICTS = {json.dumps(districts_json, indent=4)}

# Note: Villages are strictly mock
VILLAGES = {{
    d["name"]: [{{"id": "V1", "name": "Village 1"}}, {{"id": "V2", "name": "Village 2"}}]
    for state_dists in DISTRICTS.values() for d in state_dists
}}

CROPS = {json.dumps(crops_json, indent=4)}

IRRIGATION_TYPES = {json.dumps(irrig_json, indent=4)}

@router.get("/locations/states")
def get_states() -> Dict[str, Any]:
    return {{"states": STATES}}

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
    return {{"districts": found_districts or [{{"id": "unknown", "name": "Default District"}}]}}

@router.get("/locations/villages")
def get_villages(district: str) -> Dict[str, Any]:
    found_villages = VILLAGES.get(district, [])
    return {{"villages": found_villages or [{{"id": "unknown", "name": "Default Village"}}]}}

@router.get("/crops")
def get_crops(season: str = None) -> Dict[str, Any]:
    return {{"crops": CROPS}}

@router.get("/irrigation-types")
def get_irrigation_types() -> Dict[str, Any]:
    return {{"irrigation_types": IRRIGATION_TYPES}}
"""

with open('backend/app/api/v1/endpoints/data.py', 'w') as f:
    f.write(out)
print('Updated data.py!')
