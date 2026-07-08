"""
Unified /recommend endpoint — orchestrates Stage 1 → Stage 2 → Stage 3
in a single backend call so the frontend never needs to chain requests.

Response shape:
{
  "state": "...",
  "district": "...",
  "season": "...",
  "year": 2015,
  "categories": [
    {
      "rank": 1,
      "category": "Cereals",
      "probability": 0.42,
      "crops": [
        {
          "rank": 1,
          "crop": "Wheat",
          "frequency": 358,
          "probability": 0.68,
          "predicted_yield_kg_per_ha": 4.52
        }, ...
      ]
    }, ...
  ],
  "top_crops": [           // globally top-ranked crops across all categories
    {
      "rank": 1,
      "crop": "Wheat",
      "category": "Cereals",
      "category_probability": 0.42,
      "predicted_yield_kg_per_ha": 4.52
    }, ...
  ]
}
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List, Optional
from pydantic import BaseModel
import traceback

from app.db.session import get_db
from app.models.user import User, UserRole
from app.api.dependencies import get_current_user, require_role
from app.services.farmer_service import FarmerService
from app.services.ml_service import MLService

router = APIRouter(
    dependencies=[Depends(get_current_user), Depends(require_role(UserRole.farmer))]
)


def get_farmer_service(db: Session = Depends(get_db)):
    return FarmerService(db)


class RecommendRequest(BaseModel):
    """Unified recommendation input — single call that runs Stage 1 + 2 + 3."""
    state:    Optional[str] = None
    district: Optional[str] = None
    season:   str
    year:     int
    top_k_categories: int = 3
    top_k_crops:      int = 3


@router.post("/recommend")
def unified_recommend(
    req: RecommendRequest,
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
) -> Any:
    """
    Unified crop decision support endpoint.

    Runs Stage 1 → Stage 2 → Stage 3 in sequence and returns a single
    complete JSON response containing:
    - Top-K crop categories (Stage 1 — XGBoost)
    - Top-K crops per category (Stage 2 — historical lookup)
    - Predicted yield for each crop (Stage 3 — Random Forest)
    - A globally sorted top-crops list across all categories
    """
    profile = service.get_profile(current_user.id)

    loc_state    = req.state    or (profile.state    if profile else None)
    loc_district = req.district or (profile.district if profile else None)

    if not loc_state:
        traceback.print_exc()
        raise HTTPException(
            status_code=400,
            detail="State is required. Set it in your profile or pass it in the request.",
        )
    if not loc_district:
        traceback.print_exc()
        raise HTTPException(
            status_code=400,
            detail="District is required. Set it in your profile or pass it in the request.",
        )

    # ── Stage 1: Top-K Crop Categories ────────────────────────────────────────
    try:
        s1_result = MLService.predict_crop_categories(
            state    = loc_state,
            district = loc_district,
            season   = req.season,
            year     = req.year,
            top_k    = req.top_k_categories,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Stage 1 failed: {exc}")

    categories = []
    all_crops_flat: list = []

    for cat_entry in s1_result["top_categories"]:
        category     = cat_entry["category"]
        cat_prob     = cat_entry["probability"]
        cat_rank     = cat_entry["rank"]

        # ── Stage 2: Top-K Crops for this Category ─────────────────────────
        try:
            s2_result = MLService.get_top_crops_for_category(
                state    = loc_state,
                district = loc_district,
                season   = req.season,
                category = category,
                top_k    = req.top_k_crops,
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Stage 2 failed ({category}): {exc}")

        enriched_crops = []
        for crop_entry in s2_result.get("top_crops", []):
            crop_name = crop_entry["crop"]

            # ── Stage 3: Predicted Yield for this Crop ──────────────────────
            try:
                s3_result = MLService.predict_yield(
                    state         = loc_state,
                    district      = loc_district,
                    season        = req.season,
                    year          = req.year,
                    crop          = crop_name,
                    crop_category = category,
                )
                predicted_yield = s3_result["predicted_yield_kg_per_ha"]
            except Exception:
                predicted_yield = None

            enriched = {
                "rank":                     crop_entry["rank"],
                "crop":                     crop_name,
                "frequency":                crop_entry["frequency"],
                "probability":              crop_entry["probability"],
                "predicted_yield_kg_per_ha": predicted_yield,
            }
            enriched_crops.append(enriched)

            # Collect for global ranking (weight by cat_prob × crop_prob)
            all_crops_flat.append({
                "crop":                     crop_name,
                "category":                 category,
                "category_probability":     cat_prob,
                "crop_probability":         crop_entry["probability"],
                "predicted_yield_kg_per_ha": predicted_yield,
                # Score used for global ranking
                "_score": cat_prob * crop_entry["probability"],
            })

        categories.append({
            "rank":        cat_rank,
            "category":    category,
            "probability": cat_prob,
            "lookup_scope": s2_result.get("lookup_scope", "district"),
            "crops":       enriched_crops,
        })

    # ── Build global top-crops list ────────────────────────────────────────────
    all_crops_flat.sort(key=lambda x: x["_score"], reverse=True)

    top_crops = []
    seen_crops: set = set()
    global_rank = 1
    for entry in all_crops_flat:
        if entry["crop"] in seen_crops:
            continue
        seen_crops.add(entry["crop"])
        top_crops.append({
            "rank":                     global_rank,
            "crop":                     entry["crop"],
            "category":                 entry["category"],
            "category_probability":     entry["category_probability"],
            "predicted_yield_kg_per_ha": entry["predicted_yield_kg_per_ha"],
        })
        global_rank += 1

    return {
        "state":      loc_state,
        "district":   loc_district,
        "season":     req.season,
        "year":       req.year,
        "categories": categories,
        "top_crops":  top_crops,
    }
