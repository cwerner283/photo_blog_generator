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
                {
                    "role": "system",
                    "content": (
                        "You are a master travel storyteller who crafts deeply "
                        "moving, authentic narratives from travel experiences. "
                        "Your writing should capture not just what happened, "
                        "but how it felt\u2014the emotions, transformations, and "
                        "human connections that make travel meaningful. "
                        "Create content that resonates on a visceral level, "
                        "making readers feel like they were there."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.85,
            max_tokens=1200,
            top_p=0.95,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        current_app.logger.error(f"Error calling OpenAI Text Generation API: {e}", exc_info=True)
        return "Error generating blog post: Could not connect to AI writing service or an internal error occurred."


def analyze_blog_post_openai(blog_post, persona):
    """Analyze the generated blog post for emotional resonance and other metrics."""
    oai_client = _get_openai_client()
    analysis_prompt = (
        "Evaluate the following blog post and provide a short JSON report with "
        "the following fields: emotional_impact (1-10), authenticity (1-10), "
        "persona_consistency (1-10), sensory_detail_richness (1-10), "
        "story_arc_completeness (1-10). Focus on how heartfelt and resonant "
        "the writing is."
    )
    try:
        response = oai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert writing coach."},
                {
                    "role": "user",
                    "content": (
                        analysis_prompt
                        + f"\n\nPersona: {persona}\n\nBlog Post:\n{blog_post}"
                    ),
                },
            ],
            temperature=0.3,
            max_tokens=150,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        current_app.logger.error(
            f"Error calling OpenAI Analysis API: {e}", exc_info=True
        )
        return "Error analyzing blog post."
