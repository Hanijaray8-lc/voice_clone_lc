#!/usr/bin/env bash
set -o errexit

# Install ffmpeg + dependencies
apt-get update && apt-get install -y \
    ffmpeg \
    libavformat-dev \
    libavcodec-dev \
    libavdevice-dev \
    libavutil-dev \
    libavfilter-dev \
    libswscale-dev \
    libswresample-dev \
    pkg-config

# Upgrade core build tools
pip install --upgrade pip setuptools wheel build

# Install Python dependencies
pip install -r requirement.txt
