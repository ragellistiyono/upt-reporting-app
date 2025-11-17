#!/bin/bash

# Helper script to run Node.js scripts with environment variables from .env.local

# Load environment variables from .env.local
export $(grep -v '^#' .env.local | grep -E '^(APPWRITE_ENDPOINT|APPWRITE_PROJECT_ID|APPWRITE_API_KEY)=' | xargs)

# Run the command passed as argument
"$@"
