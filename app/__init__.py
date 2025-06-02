# app/__init__.py
from flask import Flask
from dotenv import load_dotenv
import os
import logging

# In-memory cache for image descriptions
image_description_cache = {}

def create_app():
    app = Flask(__name__)

    # Load environment variables
    load_dotenv()
    app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', os.urandom(24))
    app.config['OPENAI_API_KEY'] = os.environ.get('OPENAI_API_KEY')

    if not app.config['OPENAI_API_KEY']:
        raise ValueError("No OPENAI_API_KEY set for Flask application. Please check your .env file.")

    # Expose cache globally if needed
    app.image_description_cache = image_description_cache

    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    )
    app.logger.setLevel(logging.INFO)
    app.logger.info("Flask app created and configured.")

    from . import routes
    app.register_blueprint(routes.bp)

    return app