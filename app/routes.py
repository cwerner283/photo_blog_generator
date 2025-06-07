# app/routes.py
from flask import Blueprint, render_template, request, jsonify, current_app
from .utils.exif_utils import get_exif_data
from .services.openai_service import (
    get_image_description_openai,
    generate_blog_post_openai,
    analyze_blog_post_openai,
)

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return render_template('index.html', app_debug=current_app.debug)

@bp.route('/generate-blog', methods=['POST'])
def generate_blog_api():
    current_app.logger.info("Received request for /generate-blog")

    # Validate uploaded files
    if 'photos' not in request.files:
        return jsonify({"error": "No photo part in request."}), 400

    files = request.files.getlist('photos')
    if not files or all(f.filename == '' for f in files):
        return jsonify({"error": "No photos selected."}), 400

    # Read form inputs
    business_desc_input = request.form.get('businessDescription', '').strip()
    tone_selected = request.form.get('tone', '').strip()
    persona_selected = request.form.get('persona', '').strip()

    photo_contexts = []
    processed_files_count = 0
    MAX_FILE_SIZE = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

    for idx, file in enumerate(files, start=1):
        if file and file.filename:
            filename = file.filename
            ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
            if ext not in ALLOWED_EXTENSIONS:
                photo_contexts.append(f"Photo {idx} (Filename: {filename}): Skipped – Invalid file type.")
                continue

            image_bytes = file.read()
            if len(image_bytes) > MAX_FILE_SIZE:
                photo_contexts.append(f"Photo {idx} (Filename: {filename}): Skipped – File too large.")
                continue

            current_app.logger.info(f"Processing '{filename}'")
            try:
                exif_info = get_exif_data(image_bytes)
                ai_desc = get_image_description_openai(image_bytes, filename)
                photo_contexts.append(
                    f"Photo {idx} (Filename: {filename}):\n"
                    f"  - Date/Time Taken: {exif_info.get('date_time', 'N/A')}\n"
                    f"  - Location Details: {exif_info.get('location_details', 'N/A')}\n"
                    f"  - Camera Model: {exif_info.get('camera_model', 'N/A')}\n"
                    f"  - AI Vision Description: {ai_desc}\n"
                )
                processed_files_count += 1
            except Exception as e:
                current_app.logger.error(f"Error processing '{filename}': {e}", exc_info=True)
                photo_contexts.append(f"Photo {idx} (Filename: {filename}): Error – {str(e)}")

    if processed_files_count == 0:
        return jsonify({"error": "No photos could be processed."}), 500

    # Tone logic based on photo count
    if processed_files_count == 1:
        audience = "general readers interested in stories behind photos"
        focus = "the unique story, mood, and specific details of the image"
        length = "400-600"
    else:
        audience = "readers looking for a richer narrative built from multiple photos"
        focus = "a cohesive story or theme that connects all photos"
        length = "600-900"

    # Assemble prompt
    blog_context = f'The blog is about: "{business_desc_input}".' if business_desc_input else \
                   'The blog aims to share engaging stories and visual narratives.'

    persona_instructions = ""
    persona_lower = persona_selected.lower()
    if persona_lower == "anthony bourdain":
        persona_instructions = (
            "Channel raw honesty, cultural curiosity, and profound observations "
            "about human nature. Include moments of vulnerability and authentic "
            "cultural encounters."
        )
    elif persona_lower == "nomadic matt":
        persona_instructions = (
            "Focus on personal growth through budget travel, authentic local "
            "interactions, and life lessons learned from stepping outside "
            "comfort zones."
        )
    elif persona_lower == "the blonde abroad":
        persona_instructions = (
            "Emphasize empowerment, solo female travel insights, and "
            "inspirational moments of self-discovery and confidence building."
        )

    base_prompt = (
        "Based on the photo information provided below, craft a heartfelt travel blog post.\n"
        "The blog post MUST start with a catchy and relevant title (e.g., '## My Awesome Title').\n"
        f"Follow these stylistic instructions:\n"
        f"  - Tone: {tone_selected or 'engaging and descriptive'}\n"
        f"  - Persona: {persona_selected or 'Default AI Writer'}\n"
        f"  - Target Audience: {audience}\n"
        f"  - Primary Focus/Angle: {focus}\n"
        f"  - Desired Length: Approximately {length} words.\n"
        "Before writing, identify the emotional undertones in each photo description. "
        "Consider feelings these moments might evoke: wonder, solitude, connection, challenge, or peace. "
        "Include sensory details like sounds, smells, textures, and temperatures. "
        "Describe physical sensations and emotional responses. "
        "Use metaphors and imagery that connect to universal human experiences. "
        "Begin with a moment of tension or anticipation, build to an emotional climax, "
        "and end with reflection on how the experience changed you. "
        f"{persona_instructions}\n"
        "Structure the post with clear paragraphs. Integrate details from all photos into a cohesive narrative. "
        "Conclude with a thoughtful closing remark or call to action if appropriate."
    )

    photo_section = (
        "PHOTO INFORMATION (Use details from ALL photos below):\n"
        + "-" * 74 + "\n"
        + "\n\n".join(photo_contexts)
    )

    final_prompt = (
        "You are an expert AI Blog Post Writer. Your task is to create a compelling and well-structured blog post.\n\n"
        f"BLOG CONTEXT:\n{blog_context}\n\n"
        f"TASK & STYLE INSTRUCTIONS:\n{base_prompt}\n\n"
        f"{photo_section}\n\n"
        "IMPORTANT FINAL INSTRUCTION: Generate the complete blog post now, beginning with the title as a heading."
    )

    current_app.logger.info(f"Final prompt length: {len(final_prompt)} characters.")

    blog_post = generate_blog_post_openai(final_prompt)
    analysis = analyze_blog_post_openai(blog_post, persona_selected or "Default AI Writer")

    if blog_post.startswith("Error generating"):
        return jsonify({
            "error": blog_post,
            "debug_prompt": final_prompt if current_app.debug else None
        }), 500

    return jsonify({
        "blog_post": blog_post,
        "persona": persona_selected,
        "analysis": analysis,
        "debug_prompt": final_prompt if current_app.debug else None,
    })
