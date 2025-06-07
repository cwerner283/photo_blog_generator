# run.py

from app import create_app
import os

app = create_app()

if __name__ == "__main__":
    # Determine debug mode from environment variable
    debug_mode = os.environ.get("FLASK_DEBUG", "False").lower() in ("1", "true", "yes")
    app.run(host="0.0.0.0", port=5001, debug=debug_mode)
