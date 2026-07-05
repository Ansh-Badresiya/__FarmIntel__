import datetime
import json
import joblib
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (accuracy_score, classification_report,
                             confusion_matrix, mean_absolute_error,
                             mean_squared_error, r2_score)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from xgboost import XGBRegressor

# Directories
ROOT = Path('.').resolve()
DATA_DIR = ROOT / 'data' / 'processed'
MODELS_DIR = ROOT / 'models'
OUTPUTS_DIR = ROOT / 'outputs'

MODELS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

# -------------------------------------------------------------------------
# Part 1: Crop Recommender (Classification)
# -------------------------------------------------------------------------
print("--- Training Crop Recommender ---")

# Data Loading
crop_X_train = pd.read_csv(DATA_DIR / 'crop_X_train.csv')
crop_y_train = pd.read_csv(DATA_DIR / 'crop_y_train.csv').squeeze()
crop_X_test = pd.read_csv(DATA_DIR / 'crop_X_test.csv')
crop_y_test = pd.read_csv(DATA_DIR / 'crop_y_test.csv').squeeze()

# For Classification, RandomForest was best with these params
crop_params = {'n_estimators': 600, 'max_depth': None, 'min_samples_leaf': 1, 'max_leaf_nodes': None}
crop_model = RandomForestClassifier(**crop_params, random_state=42, n_jobs=1)

# Training on entire train set
print("Fitting Crop Recommender...")
crop_model.fit(crop_X_train, crop_y_train)

# Evaluation
print("Evaluating Crop Recommender on test set...")
crop_y_pred = crop_model.predict(crop_X_test)
acc = accuracy_score(crop_y_test, crop_y_pred)
print(f"Test Accuracy: {acc:.4f}")
print("Classification Report:")
cr = classification_report(crop_y_test, crop_y_pred, output_dict=True)
print(classification_report(crop_y_test, crop_y_pred))

# Confusion Matrix Plot
cm = confusion_matrix(crop_y_test, crop_y_pred, labels=crop_model.classes_)
plt.figure(figsize=(24, 20))
sns.heatmap(cm, annot=False, cmap='Blues', 
            xticklabels=False, yticklabels=False)
plt.title('Crop Recommender - Confusion Matrix')
plt.ylabel('Actual')
plt.xlabel('Predicted')
plt.tight_layout()
crop_cm_path = OUTPUTS_DIR / 'crop_confusion_matrix.png'
plt.savefig(crop_cm_path)
plt.close()
print(f"Saved Confusion Matrix to {crop_cm_path}")

# Feature Importance
importances = crop_model.feature_importances_
feature_imp = sorted(zip(crop_model.feature_names_in_, importances), key=lambda x: x[1], reverse=True)

# Serialization
crop_model_path = MODELS_DIR / 'crop_recommender.pkl'
joblib.dump(crop_model, crop_model_path)
print(f"Saved Crop Recommender Model to {crop_model_path}")

# Note: The crop recommender in our selection didn't use a scaler in the pipeline.
# No scaler to save for crop model.

crop_metadata = {
    "model_name": "crop_recommender",
    "model_type": "RandomForestClassifier",
    "date_trained": datetime.datetime.now().isoformat(),
    "input_features": list(crop_X_train.columns),
    "output_classes": [int(x) for x in crop_model.classes_],
    "hyperparameters": crop_params,
    "test_metrics": {
        "accuracy": acc,
        "macro_avg_precision": cr['macro avg']['precision'],
        "macro_avg_recall": cr['macro avg']['recall'],
        "macro_avg_f1": cr['macro avg']['f1-score']
    },
    "feature_importances": {feat: float(imp) for feat, imp in feature_imp}
}

with open(MODELS_DIR / 'crop_metadata.json', 'w') as f:
    json.dump(crop_metadata, f, indent=4)
print("Saved crop metadata.")

# -------------------------------------------------------------------------
# Part 2: Yield Predictor (Regression)
# -------------------------------------------------------------------------
print("\n--- Training Yield Predictor ---")

# Data Loading
yield_train = pd.read_csv(DATA_DIR / 'yield_train_raw.csv')
yield_test = pd.read_csv(DATA_DIR / 'yield_test_raw.csv')

yield_X_train = yield_train.drop(columns=['Yield'])
yield_y_train = yield_train['Yield']
yield_X_test = yield_test.drop(columns=['Yield'])
yield_y_test = yield_test['Yield']

# Rebuilding Preprocessor
categorical_features = ['Crop', 'Season', 'State']
numeric_features = [col for col in yield_X_train.columns if col not in categorical_features]

numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler()),
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False)),
])

yield_preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features),
    ]
)

# For Regression, XGBoost was best with these params
yield_params = {
    'subsample': 0.75, 'reg_lambda': 1.0, 'reg_alpha': 0.5, 
    'n_estimators': 300, 'min_child_weight': 1, 'max_depth': 10, 
    'learning_rate': 0.08, 'colsample_bytree': 0.75
}
yield_model_step = XGBRegressor(**yield_params, objective='reg:squarederror', random_state=42, n_jobs=1)

yield_pipeline = Pipeline([
    ('preprocessor', yield_preprocessor),
    ('model', yield_model_step)
])

# Training
print("Fitting Yield Predictor...")
yield_pipeline.fit(yield_X_train, yield_y_train)

# Evaluation
print("Evaluating Yield Predictor on test set...")
yield_y_pred = yield_pipeline.predict(yield_X_test)
r2 = r2_score(yield_y_test, yield_y_pred)
mae = mean_absolute_error(yield_y_test, yield_y_pred)
rmse = mean_squared_error(yield_y_test, yield_y_pred) ** 0.5
print(f"Test R2: {r2:.4f}, MAE: {mae:.4f}, RMSE: {rmse:.4f}")

# Residual Plot
residuals = yield_y_test - yield_y_pred
plt.figure(figsize=(10, 6))
sns.scatterplot(x=yield_y_pred, y=residuals, alpha=0.45)
plt.axhline(y=0, color='r', linestyle='--')
plt.title('Yield Predictor - Residual Plot')
plt.xlabel('Predicted Yield')
plt.ylabel('Residuals')
plt.tight_layout()
yield_rp_path = OUTPUTS_DIR / 'yield_residual_plot.png'
plt.savefig(yield_rp_path)
plt.close()
print(f"Saved Residual Plot to {yield_rp_path}")

# Serialization
yield_model_path = MODELS_DIR / 'yield_predictor.pkl'
joblib.dump(yield_pipeline, yield_model_path)
print(f"Saved Yield Predictor Pipeline to {yield_model_path}")

# Save the fitted scaler (extracted from the pipeline's ColumnTransformer -> numeric_transformer -> scaler)
fitted_scaler = yield_pipeline.named_steps['preprocessor'].named_transformers_['num'].named_steps['scaler']
yield_scaler_path = MODELS_DIR / 'yield_scaler.pkl'
joblib.dump(fitted_scaler, yield_scaler_path)
print(f"Saved Yield Scaler to {yield_scaler_path}")

# Extract features names out of the ColumnTransformer (rough extraction for metadata)
cat_encoder = yield_pipeline.named_steps['preprocessor'].named_transformers_['cat'].named_steps['onehot']
cat_feature_names = cat_encoder.get_feature_names_out(categorical_features)
all_feature_names = numeric_features + list(cat_feature_names)

# Feature Importance
importances_yield = yield_model_step.feature_importances_
feature_imp_yield = sorted(zip(all_feature_names, importances_yield), key=lambda x: x[1], reverse=True)

yield_metadata = {
    "model_name": "yield_predictor",
    "model_type": "Pipeline[ColumnTransformer, XGBRegressor]",
    "date_trained": datetime.datetime.now().isoformat(),
    "input_features": list(yield_X_train.columns),
    "processed_features": all_feature_names,
    "target_name": "Yield",
    "hyperparameters": yield_params,
    "test_metrics": {
        "r2": r2,
        "mae": mae,
        "rmse": rmse
    },
    "feature_importances": {feat: float(imp) for feat, imp in feature_imp_yield[:20]} # Top 20
}

with open(MODELS_DIR / 'yield_metadata.json', 'w') as f:
    json.dump(yield_metadata, f, indent=4)
print("Saved yield metadata.")
print("All tasks completed successfully!")
