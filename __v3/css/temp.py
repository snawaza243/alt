import os

# Root directory
root = "css"

# Directory structure and files
structure = {
    "components": [
        "_buttons.css",
        "_cards.css",
        "_flashcards.css",
        "_forms.css",
        "_navigation.css",
        "_notifications.css",
        "_progress.css",
        "_writing-practice.css",
        "_dashboard.css"
    ],
    "themes": [
        "_light.css",
        "_dark.css",
        "_desert.css"
    ],
    "base": [
        "_reset.css",
        "_typography.css",
        "_variables.css"
    ]
}

# Create main css directory
os.makedirs(root, exist_ok=True)

# Create subdirectories and files
for folder, files in structure.items():
    folder_path = os.path.join(root, folder)
    os.makedirs(folder_path, exist_ok=True)
    for file in files:
        file_path = os.path.join(folder_path, file)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(f"/* {file} */\n")

# Create main style.css in root
with open(os.path.join(root, "style.css"), 'w', encoding='utf-8') as f:
    f.write("/* Main stylesheet */\n")

print("✅ Folder and CSS files created successfully!")
