#!/bin/bash
cd "$(dirname "$0")/atomic-poker"

# Kill any existing server on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null

# Open Browser (Mac)
open "http://localhost:8000"

# Start Python Server
python3 -m http.server 8000
