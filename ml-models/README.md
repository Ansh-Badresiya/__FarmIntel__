# FarmIntel ML Models

This folder contains the notebooks, model artifacts, and documentation for the crop recommendation and yield prediction workflows used by FarmIntel.

## Contents

- `data/raw/` - source CSV files used for analysis and training
- `notebooks/` - EDA and model-selection notebooks
- `models/` - saved `.pkl` model and preprocessing artifacts, plus JSON metadata
- `src/` - optional code for reusable preprocessing and training helpers

## Datasets

The raw inputs are expected in `data/raw/`:

- `crop_recomandation.csv`
- `crop_yield.csv`

## Notebooks

The analysis is split into one notebook per task:

- `notebooks/01_crop_recommendation_eda.ipynb`
- `notebooks/02_yield_prediction_eda.ipynb`
- `notebooks/03_model_selection_crop.ipynb`
- `notebooks/04_model_selection_yield.ipynb`

Each notebook is written to be run top-to-bottom in order.

## Reproduce The Environment

Use Python 3.11 or newer, then install the dependencies:

```bash
pip install -r requirements.txt
```

If you want to run notebooks interactively, also install and register the kernel:

```bash
python -m ipykernel install --user --name farmintel-ml --display-name "FarmIntel ML"
```

## Run The Notebooks

Recommended order:

1. Open `01_crop_recommendation_eda.ipynb` and inspect the crop recommendation dataset.
2. Open `02_yield_prediction_eda.ipynb` and inspect the yield dataset.
3. Open `03_model_selection_crop.ipynb` to compare classification models and save the crop artifacts.
4. Open `04_model_selection_yield.ipynb` to compare regression models and save the yield artifacts.

## Preprocessing Decisions

### Crop recommendation

- Core feature set: `N`, `P`, `K`, `temperature`, `humidity`, `pH`, `rainfall`
- Target: `Crop`
- Missing values: none in the supplied file
- Scaling: `StandardScaler` for model comparison and the final pipeline
- Encoding: classification target is label-encoded for XGBoost compatibility
- Split: 80/20 train-test split with stratification

### Yield prediction

- Feature set: `Crop`, `Crop_Year`, `Season`, `State`, `Area`, `Production`, `Annual_Rainfall`, `Fertilizer`, `Pesticide`
- Target: `Yield`
- Missing values: none in the supplied file
- Scaling: `StandardScaler` for numeric features
- Encoding: one-hot encoding for `Crop`, `Season`, and `State`
- Split: 80/20 train-test split

## EDA Summary

The notebooks are intended to record these findings after execution:

- Crop recommendation data has no missing values and a strong class distribution skew, so class balance should be reviewed before final model choice.
- Yield prediction data also has no missing values, but several numeric columns have heavy tails, so outlier inspection is important before regression tuning.
- The crop notebook focuses on pairwise feature structure, correlation, and class separability.
- The yield notebook focuses on target relationships, categorical grouping effects, correlation with yield, and leverage-point review.

## Model Artifacts

The current saved artifacts are:

- `models/crop_recommender.pkl`
- `models/crop_scaler.pkl`
- `models/crop_metadata.json`
- `models/yield_predictor.pkl`
- `models/yield_scaler.pkl`
- `models/yield_metadata.json`

The metadata files contain the input feature order, the selected model, and the evaluation summary.

## Final Model Notes

The crop notebook is designed to compare:

- Logistic Regression
- Random Forest
- XGBoost
- SVM
- K-Nearest Neighbours

The yield notebook is designed to compare:

- Linear Regression
- Random Forest Regressor
- XGBoost Regressor
- SVR
- Extra Trees Regressor

The exported artifacts in `models/` must keep the input feature order from the metadata files because the backend prediction code expects the same order at inference time.

## Backend Usage

Load the saved pipeline and metadata from `models/`, then pass inputs in the same feature order documented in each JSON file.

Example for the crop recommender:

```python
import joblib
import json
from pathlib import Path

base = Path('ml-models') / 'models'
model = joblib.load(base / 'crop_recommender.pkl')
metadata = json.loads((base / 'crop_metadata.json').read_text())

row = [[90, 42, 43, 20.5, 80.0, 6.5, 120.0]]
prediction = model.predict(row)
```

Example for the yield predictor:

```python
import joblib
import json
import pandas as pd
from pathlib import Path

base = Path('ml-models') / 'models'
model = joblib.load(base / 'yield_predictor.pkl')
metadata = json.loads((base / 'yield_metadata.json').read_text())

sample = pd.DataFrame([{
	'Crop': 'Rice',
	'Crop_Year': 2019,
	'Season': 'Kharif',
	'State': 'Assam',
	'Area': 12000,
	'Production': 9500,
	'Annual_Rainfall': 1800,
	'Fertilizer': 4500,
	'Pesticide': 120,
}])
prediction = model.predict(sample)
```

## Notes

- The notebooks are intentionally verbose so the analysis decisions are documented in place.
- The crop notebook currently saves the final model under the `crop_recommender.pkl` name and the fitted scaler as `crop_scaler.pkl`.
- The yield artifact set is saved as `yield_predictor.pkl`, `yield_scaler.pkl`, and `yield_metadata.json`.