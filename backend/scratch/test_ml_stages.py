from app.services.ml_service import MLService, _store

# Load all artifacts
_store.ensure_loaded()
print("=== Artifacts Loaded ===")
print("S1 classes :", _store.s1_classes)
print("S1 features:", _store.s1_features)
print("S3 features:", _store.s3_feature_order)
print("History df :", _store.history_df.shape)
print()

# Stage 1
r1 = MLService.predict_crop_categories("Punjab", "Ludhiana", "Rabi", 2015)
print("=== Stage 1 — Crop Category Prediction ===")
for c in r1["top_categories"]:
    print(f"  #{c['rank']} {c['category']}  ({c['probability']:.4f})")
print()

# Stage 2
top_category = r1["top_categories"][0]["category"]
r2 = MLService.get_top_crops_for_category("Punjab", "Ludhiana", "Rabi", top_category)
print(f"=== Stage 2 — Top Crops for '{top_category}' (scope: {r2['lookup_scope']}) ===")
for c in r2["top_crops"]:
    print(f"  #{c['rank']} {c['crop']}  freq={c['frequency']}  prob={c['probability']}")
print()

# Stage 3
top_crop = r2["top_crops"][0]["crop"]
r3 = MLService.predict_yield("Punjab", "Ludhiana", "Rabi", 2015, top_crop, top_category)
print("=== Stage 3 — Yield Prediction ===")
print(f"  Crop   : {r3['crop']}")
print(f"  Yield  : {r3['predicted_yield_kg_per_ha']:,.1f} kg/ha")
print()
print("ALL STAGES OK")
