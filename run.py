# run.py

from app import create_app

app = create_app()

if __name__ == "__main__":
    # debug=True for development; remove or set to False in production
    app.run(host="0.0.0.0", port=5001, debug=True)
