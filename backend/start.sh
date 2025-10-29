#!/usr/bin/env bash
set -o errexit

# Update and install FFmpeg
apt-get update && apt-get install -y ffmpeg

# Upgrade build tools
pip install --upgrade pip setuptools wheel build

# Install Python dependencies
pip install -r requirement.txt
