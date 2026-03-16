#!/bin/bash
# Migration Cleanup Script
# This shell script safely archives the old Python environment and promotes the new Node.js backend.

echo "Starting Office SaaS Backend Migration Cleanup..."

# 1. Ensure we are in the root directory (d:/office)
cd "$(dirname "$0")"

# 2. Prevent accidental destruction if express-backend doesn't exist
if [ ! -d "express-backend" ]; then
    echo "ERROR: express-backend/ directory not found. Aborting."
    exit 1
fi

# 3. Create a backups directory
mkdir -p backups
echo "Created backups/ directory."

# 4. Safely archive the old backend
if [ -d "backend" ]; then
    echo "Archiving old Python backend..."
    # Copy instead of move for extra safety first, or just move. We'll move here.
    mv backend backups/backend_python_old
    echo "Successfully moved backend/ to backups/backend_python_old/"
else
    echo "WARNING: Old backend/ folder not found. Skipping archive."
fi

# 5. Clean up Python specific root files if any
if [ -f "main.py" ]; then
    mv main.py backups/
    echo "Moved root main.py to backups."
fi

# 6. Promote the new Express backend
echo "Promoting express-backend to backend..."
mv express-backend backend
echo "Successfully renamed express-backend/ to backend/"

# 7. Update .gitignore (Optional clean up)
# Removing Python specific ignores and ensuring Node ignores are present
sed -i '/\/backend\/.venv/d' .gitignore
grep -qxF '/backend/node_modules' .gitignore || echo '/backend/node_modules' >> .gitignore

echo "Cleanup Complete! 🚀"
echo "Your new Node.js production backend is officially promoted."
