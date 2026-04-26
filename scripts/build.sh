#!/bin/bash
# Copy frontend files to backend public directory
cp -r empower-frontend/public empower-backend/public || true

cd empower-backend
npm install
