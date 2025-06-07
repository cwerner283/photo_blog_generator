#!/usr/bin/env bash
#
# generate_secret.sh
# 
# Generates a 24-byte random Flask SECRET_KEY (hex-encoded),
# writes it to .env (overwriting any existing FLASK_SECRET_KEY),
# and preserves any other lines in .env (like OPENAI_API_KEY).

ENV_FILE=".env"

# 1. Generate a new 24-byte hex string
NEW_KEY=$(python3 - <<EOF
import os
print(os.urandom(24).hex())
EOF
)

# 2. If .env doesn’t exist yet, create it
if [ ! -f "$ENV_FILE" ]; then
  touch "$ENV_FILE"
fi

# 3. Preserve all lines in .env except any existing FLASK_SECRET_KEY
#    Then append the new FLASK_SECRET_KEY line at the bottom
grep -v '^FLASK_SECRET_KEY=' "$ENV_FILE" > "${ENV_FILE}.tmp"
echo "FLASK_SECRET_KEY=\"$NEW_KEY\"" >> "${ENV_FILE}.tmp"

# 4. Replace .env with the updated file
mv "${ENV_FILE}.tmp" "$ENV_FILE"

echo "Generated new FLASK_SECRET_KEY and wrote to $ENV_FILE"
