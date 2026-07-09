"""
ml_service.py
=============
FarmIntel — Production ML inference service.

Connects to the ml-models-v2 pipeline:
  Stage 1 : XGBoostClassifier  → Top-3 Crop Categories
  Stage 2 : Historical lookup  → Top-3 Crops per Category
  Stage 3 : RandomForestRegressor → Yield (kg/ha)

All artifacts are resolved relative to this file so the service
works regardless of where uvicorn is launched from.
"""

from __future__ import annotations

import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
import pandas as pd

from app.services.model_downloader import ModelDownloader

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Paths  (backend/app/services/ → backend/ → FarmIntel/ → ml-models-v2/)
# ─────────────────────────────────────────────────────────────────────────────
_SERVICE_DIR = Path(__file__).resolve().parent          # .../backend/app/services
_PROJECT_ROOT = _SERVICE_DIR.parents[2]                 # .../FarmIntel
_CACHE_DIR    = ModelDownloader.get_cache_dir()         # backend/ml-models-cache
_MODELS_DIR   = _CACHE_DIR / "models"
_DATA_DIR     = _CACHE_DIR / "data" / "processed"


# ─────────────────────────────────────────────────────────────────────────────
# Lazy-loaded artifact registry
# ─────────────────────────────────────────────────────────────────────────────

import threading

class _ArtifactStore:
    """
    Singleton that loads ML artifacts lazily in stages to minimize memory usage.
    """
    _instance: Optional[_ArtifactStore] = None
    _lock = threading.Lock()

    def __new__(cls) -> _ArtifactStore:
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    obj = super().__new__(cls)
                    obj._stage1_loaded = False
                    obj._history_loaded = False
                    obj._stage3_loaded = False
                    cls._instance = obj
        return cls._instance

    def load_stage1(self) -> None:
        if self._stage1_loaded:
            return

        with self._lock:
            if self._stage1_loaded:
                return

            ModelDownloader().ensure_downloaded("stage1")

            logger.info("Loading Stage 1 artifacts...")
            self.s1_model   = joblib.load(_MODELS_DIR / "crop_category_xgboost.pkl")
            self.s1_ord_enc = joblib.load(_MODELS_DIR / "ordinal_encoder.pkl")
            self.s1_lbl_enc = joblib.load(_MODELS_DIR / "label_encoder.pkl")

            with open(_MODELS_DIR / "crop_categories.json", encoding="utf-8") as f:
                self.s1_classes: List[str] = json.load(f)

            with open(_MODELS_DIR / "feature_columns.json", encoding="utf-8") as f:
                raw = json.load(f)
                self.s1_features: List[str] = raw if isinstance(raw, list) else raw["feature_order"]

            self._stage1_loaded = True
            logger.info("Stage 1 artifacts loaded.")

    def load_history(self) -> None:
        if self._history_loaded:
            return

        with self._lock:
            if self._history_loaded:
                return

            ModelDownloader().ensure_downloaded("history")

            logger.info("Loading historical dataset...")
            train_csv = _DATA_DIR / "crop_train.csv"
            self.history_df: pd.DataFrame = pd.read_csv(
                train_csv,
                usecols=["State", "District", "Season", "Crop", "Crop_Category"],
            )
            for col in ["State", "District", "Season", "Crop", "Crop_Category"]:
                self.history_df[col] = self.history_df[col].astype(str).str.strip()

            self._history_loaded = True
            logger.info("Historical dataset loaded.")

    def load_stage3(self) -> None:
        if self._stage3_loaded:
            return

        with self._lock:
            if self._stage3_loaded:
                return
            
            ModelDownloader().ensure_downloaded("stage3")

            logger.info("Loading Stage 3 artifacts...")
            self.s3_model   = joblib.load(_MODELS_DIR / "yield_random_forest.pkl")
            self.s3_ord_enc = joblib.load(_MODELS_DIR / "yield_ordinal_encoder.pkl")

            with open(_MODELS_DIR / "yield_feature_columns.json", encoding="utf-8") as f:
                yfc = json.load(f)
            self.s3_cat_features: List[str] = yfc["categorical_features"]
            self.s3_num_features: List[str] = yfc["numerical_features"]
            self.s3_feature_order: List[str] = yfc["feature_order"]

            self._stage3_loaded = True
            logger.info("Stage 3 artifacts loaded.")


# Module-level singleton
_store = _ArtifactStore()


# ─────────────────────────────────────────────────────────────────────────────
# Public ML service
# ─────────────────────────────────────────────────────────────────────────────

class MLService:
    """
    Stateless service class — all methods are @staticmethod so callers
    can use ``MLService.predict_crop_categories(...)`` without instantiation.
    """

    # ── Stage 1 ───────────────────────────────────────────────────────────────

    @staticmethod
    def predict_crop_categories(
        state: str,
        district: str,
        season: str,
        year: int,
        top_k: int = 3,
    ) -> Dict[str, Any]:
        """
        Stage 1 — XGBoost crop-category classifier.

        Parameters
        ----------
        state, district, season : str
        year                    : int
        top_k                   : number of categories to return (default 3)

        Returns
        -------
        {
            "state": ..., "district": ..., "season": ..., "year": ...,
            "top_categories": [
                {"rank": 1, "category": "Cereals", "probability": 0.42},
                ...
            ]
        }
        """
        _store.load_stage1()

        # Build input DataFrame with the exact feature order the encoder expects
        row = {
            "State":    state.strip(),
            "District": district.strip(),
            "Season":   season.strip(),
            "Year":     float(year),
        }

        # Separate cat / num according to feature_columns.json order
        cat_cols = [c for c in _store.s1_features if c != "Year"]
        num_cols = ["Year"]

        input_df = pd.DataFrame([row])
        X_cat = _store.s1_ord_enc.transform(input_df[cat_cols])
        X_num = input_df[num_cols].values.astype(float)
        X = np.hstack([X_cat, X_num])

        
        proba = _store.s1_model.predict_proba(X)[0]

        top_idx   = np.argsort(proba)[::-1][:top_k]
        top_names = _store.s1_lbl_enc.inverse_transform(top_idx)

        return {
            "state":    state,
            "district": district,
            "season":   season,
            "year":     year,
            "top_categories": [
                {
                    "rank":        int(r + 1),
                    "category":    str(cat),
                    "probability": round(float(proba[idx]), 4),
                }
                for r, (cat, idx) in enumerate(zip(top_names, top_idx))
            ],
        }

    # ── Stage 2 ───────────────────────────────────────────────────────────────

    @staticmethod
    def get_top_crops_for_category(
        state: str,
        district: str,
        season: str,
        category: str,
        top_k: int = 3,
    ) -> Dict[str, Any]:
        """
        Stage 2 — Historical-frequency lookup.

        Filters crop_train.csv by State + District + Season + Crop_Category,
        counts crop occurrences, and returns the Top-K most frequent crops.

        Falls back to State + Season + Crop_Category if the District filter
        returns fewer than top_k distinct crops.

        Returns
        -------
        {
            "state": ..., "district": ..., "season": ..., "category": ...,
            "lookup_scope": "district" | "state",
            "top_crops": [
                {"rank": 1, "crop": "Rice", "frequency": 120, "probability": 0.45},
                ...
            ]
        }
        """
        _store.load_history()

        df = _store.history_df

        state    = state.strip()
        district = district.strip()
        season   = season.strip()
        category = category.strip()

        # ── Narrow filter: State + District + Season + Crop_Category ──────
        mask = (
            (df["State"]         == state)
            & (df["District"]    == district)
            & (df["Season"]      == season)
            & (df["Crop_Category"] == category)
        )
        filtered = df[mask]

        scope = "district"

        # ── Fallback: State + Season + Crop_Category ──────────────────────
        if filtered["Crop"].nunique() < top_k:
            mask_fallback = (
                (df["State"]           == state)
                & (df["Season"]        == season)
                & (df["Crop_Category"] == category)
            )
            filtered = df[mask_fallback]
            scope = "state"

        if filtered.empty:
            return {
                "state":        state,
                "district":     district,
                "season":       season,
                "category":     category,
                "lookup_scope": scope,
                "top_crops":    [],
                "message":      "No historical data found for this combination.",
            }

        counts = (
            filtered["Crop"]
            .value_counts()
            .head(top_k)
            .reset_index()
        )
        counts.columns = ["crop", "frequency"]
        total = counts["frequency"].sum()

        return {
            "state":        state,
            "district":     district,
            "season":       season,
            "category":     category,
            "lookup_scope": scope,
            "top_crops": [
                {
                    "rank":        int(i + 1),
                    "crop":        str(row["crop"]),
                    "frequency":   int(row["frequency"]),
                    "probability": round(float(row["frequency"] / total), 4),
                }
                for i, row in counts.iterrows()
            ],
        }

    # ── Stage 3 ───────────────────────────────────────────────────────────────

    @staticmethod
    def predict_yield(
        state: str,
        district: str,
        season: str,
        year: int,
        crop: str,
        crop_category: str,
    ) -> Dict[str, Any]:
        """
        Stage 3 — RandomForestRegressor yield prediction.

        The model was trained on log1p(Yield); predictions are
        back-transformed with expm1 before returning.

        Returns
        -------
        {
            "state": ..., "district": ..., "season": ..., "year": ...,
            "crop": ..., "crop_category": ...,
            "predicted_yield_kg_per_ha": 1234.5,
            "unit": "kg/ha"
        }
        """
        _store.load_stage3()

        row = {
            "State":         state.strip(),
            "District":      district.strip(),
            "Crop":          crop.strip(),
            "Crop_Category": crop_category.strip(),
            "Season":        season.strip(),
            "Year":          float(year),
        }

        input_df = pd.DataFrame([row])

        X_cat = _store.s3_ord_enc.transform(input_df[_store.s3_cat_features])
        X_num = input_df[_store.s3_num_features].values.astype(float)
        X = np.hstack([X_cat, X_num])

        y_log = _store.s3_model.predict(X)[0]
        y_kg_ha = float(np.expm1(np.clip(y_log, None, 15)))

        return {
            "state":                    state,
            "district":                 district,
            "season":                   season,
            "year":                     year,
            "crop":                     crop,
            "crop_category":            crop_category,
            "predicted_yield_kg_per_ha": round(y_kg_ha, 2),
            "unit":                     "kg/ha",
        }

    # ── Legacy-compatible helpers (kept for any internal callers) ──────────────

    @staticmethod
    def predict_crop(
        nitrogen: float, phosphorus: float, potassium: float, ph: float,
        temperature: float, humidity: float, rainfall: float,
        source: str,
    ) -> Dict[str, Any]:
        """Deprecated — retained only for backward-compatibility."""
        raise NotImplementedError(
            "predict_crop() has been replaced by predict_crop_categories(). "
            "Use POST /farmer/crop-recommend instead."
        )

    @staticmethod
    def predict_yield_legacy(
        crop: str, season: str, state: str, area: float,
        rainfall: float, temperature: float, irrigation: str,
    ) -> Dict[str, Any]:
        """Deprecated — retained only for backward-compatibility."""
        raise NotImplementedError(
            "predict_yield_legacy() has been replaced by predict_yield(). "
            "Use POST /farmer/yield-predict instead."
        )
