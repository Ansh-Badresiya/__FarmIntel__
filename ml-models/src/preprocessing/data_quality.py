"""Utilities for inspection, missing values, and outlier handling."""

from __future__ import annotations

from typing import Dict, Iterable, Tuple

import numpy as np
import pandas as pd
from scipy.stats import zscore


def quick_profile(df: pd.DataFrame) -> pd.DataFrame:
    """Return data types, null counts, and null percentages."""
    profile = pd.DataFrame(
        {
            "dtype": df.dtypes.astype(str),
            "null_count": df.isna().sum(),
            "null_pct": (df.isna().sum() / len(df) * 100).round(2),
            "n_unique": df.nunique(dropna=True),
        }
    )
    return profile.sort_values(["null_pct", "n_unique"], ascending=[False, False])


def enforce_numeric_ranges(df: pd.DataFrame, ranges: Dict[str, Tuple[float, float]]) -> pd.DataFrame:
    """Set values outside min/max range to NaN for later imputation."""
    out = df.copy()
    for col, (minimum, maximum) in ranges.items():
        if col in out.columns:
            mask = (out[col] < minimum) | (out[col] > maximum)
            out.loc[mask, col] = np.nan
    return out


def zscore_outlier_counts(df: pd.DataFrame, cols: Iterable[str], threshold: float = 3.0) -> pd.Series:
    """Count z-score outliers for each numeric column."""
    counts = {}
    for col in cols:
        if col not in df.columns:
            continue
        series = pd.to_numeric(df[col], errors="coerce")
        if series.notna().sum() < 3 or series.nunique(dropna=True) < 3:
            counts[col] = 0
            continue
        z_values = np.abs(zscore(series.dropna(), nan_policy="omit"))
        counts[col] = int((z_values > threshold).sum())
    return pd.Series(counts).sort_values(ascending=False)


def winsorize_iqr(df: pd.DataFrame, cols: Iterable[str], whisker_width: float = 1.5) -> pd.DataFrame:
    """Cap outliers to IQR whiskers per column."""
    out = df.copy()
    for col in cols:
        if col not in out.columns:
            continue
        q1 = out[col].quantile(0.25)
        q3 = out[col].quantile(0.75)
        iqr = q3 - q1
        low = q1 - whisker_width * iqr
        high = q3 + whisker_width * iqr
        out[col] = out[col].clip(lower=low, upper=high)
    return out
