from huggingface_hub import HfApi
from pathlib import Path

# ==========================================
# IMPORTANT: Put your Hugging Face Token Here!
# You can get it from: https://huggingface.co/settings/tokens
# Make sure the token has "WRITE" permissions.
# ==========================================
HF_TOKEN = "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"

# Put your Hugging Face username and the name of the repository you want to create
# Example: "Ansh-Badresiya/FarmIntel-Models"
REPO_ID = "AnshBadresiya/FarmIntel-Models"

api = HfApi()

print(f"Creating repository {REPO_ID} on Hugging Face...")
try:
    api.create_repo(repo_id=REPO_ID, token=HF_TOKEN, repo_type="model", exist_ok=True)
    print("Repository created (or already exists)!")
except Exception as e:
    print(f"Error creating repository: {e}")
    exit(1)

models_dir = Path("models").resolve()

print("\nUploading the models/ folder to Hugging Face...")
print("This may take several minutes depending on your internet upload speed because the crop model is 3.9 GB.")

try:
    # Upload the entire models directory
    api.upload_folder(
        folder_path=str(models_dir),
        repo_id=REPO_ID,
        repo_type="model",
        token=HF_TOKEN
    )
    print("\nSUCCESS! Models uploaded to Hugging Face!")
    print(f"You can view them here: https://huggingface.co/{REPO_ID}")
except Exception as e:
    print(f"\nError during upload: {e}")
