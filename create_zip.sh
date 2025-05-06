#!/bin/bash

# Create a temporary directory for the clean project
TEMP_DIR="./temp_export"
mkdir -p "$TEMP_DIR"

# Copy all project files except node_modules, .git, temp_export, etc.
echo "Copying project files..."
find . -type f -not -path "*/node_modules/*" -not -path "*/\.*" -not -path "*/temp_export/*" -not -path "*/public/uploads/profiles/*" -not -path "*/public/uploads/foods/*" | while read -r file; do
  # Create the directory structure in the temp directory
  mkdir -p "$TEMP_DIR/$(dirname "$file")"
  # Copy the file
  cp "$file" "$TEMP_DIR/$file"
done

# Copy .gitignore, .env.example, and other important dot files
cp .gitignore "$TEMP_DIR/"
cp .env.example "$TEMP_DIR/"

# Create placeholder directories for uploads
mkdir -p "$TEMP_DIR/public/uploads/profiles"
mkdir -p "$TEMP_DIR/public/uploads/foods"
touch "$TEMP_DIR/public/uploads/profiles/.gitkeep"
touch "$TEMP_DIR/public/uploads/foods/.gitkeep"

# Create the tar.gz file
tar_filename="food_waste_management_system.tar.gz"
echo "Creating compressed archive: $tar_filename"
cd "$TEMP_DIR" && tar -czf "../$tar_filename" . && cd ..

# Clean up the temporary directory
echo "Cleaning up..."
rm -rf "$TEMP_DIR"

echo "Archive created: $tar_filename"
echo "You can download this file from the Replit interface."
