#!/usr/bin/env bash
set -o errexit

# Upgrade pip and setuptools
pip install --upgrade pip setuptools wheel

# Install Python dependencies
pip install -r requirement.txt

# Start the FastAPI app
uvicorn app.main:app --host 0.0.0.0 --port $PORT
