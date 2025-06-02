# app/services/openai_service.py
import base64
import hashlib
import mimetypes
from openai import OpenAI
from flask import current_app

def _get_openai_client():
    api_key = current_app.config.get('OPENAI_API_KEY')
    if not api_key:
        current_app.logger.error("OpenAI API key not configured.")
        raise ValueError("OpenAI API key not configured.")
    return OpenAI(api_key=api_key)

def get_image_description_openai(image_bytes, filename="uploaded_image"):
    """Get a vision-based description using OpenAI, with simple in-memory caching."""
    oai_client = _get_openai_client()
    image_cache = current_app.image_description_cache

    image_hash = hashlib.sha256(image_bytes).hexdigest()
    cache_key = f"img_desc_openai_v1_{image_hash}"

    if cache_key in image_cache:
        current_app.logger.info(f"CACHE HIT (Vision): Returning cached description for '{filename}'.")
        return image_cache[cache_key]

    current_app.logger.info(f"CACHE MISS (Vision): Sending '{filename}' to OpenAI Vision.")
    try:
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        mime_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
        vision_prompt_text = (
            "Analyze this image in detail. Describe its key elements, subjects, setting, "
            "colors, mood, and any notable features or activities. Provide a comprehensive "
            "description (around 100-150 words) suitable for incorporation into a blog post."
        )
        response = oai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": vision_prompt_text},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{base64_image}"},
                        },
                    ],
                }
            ],
            max_tokens=300
        )
        description = response.choices[0].message.content.strip()
        image_cache[cache_key] = description
        return description
    except Exception as e:
        current_app.logger.error(f"Error calling OpenAI Vision API for {filename}: {e}", exc_info=True)
        return "Error generating image description: Could not connect to AI service or an internal error occurred."

def generate_blog_post_openai(prompt):
    """Generate the blog post via OpenAI text model."""
    oai_client = _get_openai_client()
    current_app.logger.info(f"Calling OpenAI Text Generation. Prompt length: {len(prompt)} chars.")
    try:
        response = oai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert blog writer, skilled in creating engaging and well-structured content based on provided information."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.75,
            max_tokens=1200,
            top_p=0.95,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        current_app.logger.error(f"Error calling OpenAI Text Generation API: {e}", exc_info=True)
        return "Error generating blog post: Could not connect to AI writing service or an internal error occurred."
