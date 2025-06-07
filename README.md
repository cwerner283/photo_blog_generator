# AI Photo Blog Generator

An intelligent web application that transforms your photos into engaging blog posts using AI-powered image analysis and content generation.

## Overview

The AI Photo Blog Generator combines computer vision and natural language processing to create compelling blog content from your photographs. Simply upload your images, optionally customize the writing style, and let AI craft a professional blog post complete with contextual details extracted from your photos' metadata.
With its enhanced storytelling engine, the app focuses on heartfelt travel narratives that capture the emotions and transformative moments behind each image.

## Features

- **Multi-Photo Processing**: Upload multiple images to create cohesive narratives [1](#0-0) 
- **AI Image Analysis**: Powered by OpenAI's GPT-4o vision model for detailed image descriptions [2](#0-1)
- **EXIF Data Extraction**: Automatically extracts camera settings, timestamps, and GPS coordinates [3](#0-2)
- **Voice Profile Selection**: Choose from curated writing styles (Anthony Bourdain, Nomadic Matt, The Blonde Abroad) or create custom tones [4](#0-3)
- **Emotional Storytelling Engine**: Generates heartfelt travel narratives with sensory detail and authentic persona voices
- **Content Quality Metrics**: Analyzes each post for emotional impact, authenticity, persona consistency, and story arc completeness
- **Rich Text Editor**: Built-in Quill.js editor for post-generation editing [5](#0-4)
- **Multiple Export Formats**: Download or copy content as HTML or Markdown [6](#0-5) 
- **Intelligent Caching**: Reduces API costs by caching image descriptions [7](#0-6) 

## Technology Stack

- **Backend**: Flask web framework with Python
- **AI Services**: OpenAI GPT-4o for vision and text generation
- **Frontend**: Vanilla JavaScript frontend (Flask templates) and a new React+Next.js app in `frontend/`
- **Styling**: Tailwind CSS for responsive design
- **Image Processing**: PIL (Python Imaging Library) for EXIF extraction

## Installation

### Prerequisites

- Python 3.7+
- OpenAI API key
- Node.js (for Tailwind CSS compilation)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/cwerner283/photo_blog_generator.git
   cd photo_blog_generator
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Generate Flask secret key** [8](#0-7) 
   ```bash
   chmod +x generate_secret.sh
   ./generate_secret.sh
   ```

5. **Install and build frontend assets**
   ```bash
   npm install
   npm run build-css
   ```

6. **Run Next.js frontend**
```bash
cd frontend
npm install
npm run dev
```

## Usage

1. **Start the application** [9](#0-8) 
   ```bash
   python run.py
   ```

2. **Access the web interface**
   Open your browser to `http://localhost:5001`

3. **Generate blog posts**
   - Upload one or more photos (PNG, JPG, JPEG formats supported)
   - Optionally describe your blog theme
   - Choose a voice profile or create a custom tone
   - Click "Generate Blog Post"
   - Edit the generated content in the rich text editor
   - Export as HTML or Markdown

## API Endpoints

### `POST /generate-blog`

Processes uploaded photos and generates blog content.

**Request Format**: Multipart form data with:
- `photos`: Image files (max 10MB each) [10](#0-9) 
- `businessDescription`: Optional blog theme description
- `tone`: Writing style/voice
- `persona`: Selected voice profile

**Response**: JSON with generated blog post content [11](#0-10) 

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API authentication key | Yes |
| `FLASK_SECRET_KEY` | Flask session security key | No (auto-generated) |

### Application Settings

- **File Size Limit**: 10MB per image [12](#0-11) 
- **Supported Formats**: PNG, JPG, JPEG [13](#0-12) 
- **AI Model**: GPT-4o for both vision and text generation [14](#0-13) 
- **Server Port**: 5001 (configurable in `run.py`)

## Architecture

The application follows a modular Flask architecture:

- **Application Factory**: `app/__init__.py` handles configuration and initialization [15](#0-14) 
- **Routing Layer**: `app/routes.py` manages HTTP endpoints and request processing [16](#0-15) 
- **AI Services**: `app/services/openai_service.py` handles OpenAI API integration [17](#0-16) 
- **Image Processing**: `app/utils/exif_utils.py` extracts photo metadata [3](#0-2) 
- **Frontend**: Templates and JavaScript for user interface [18](#0-17) 

## Development

### Running in Development Mode

The application runs in debug mode by default [19](#0-18) :
```bash
python run.py
```

### Building CSS

To rebuild Tailwind CSS:
```bash
npm run build-css
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open a GitHub issue or contact the maintainer.

---

**Notes**: This application requires an active OpenAI API key and will incur costs based on usage. The caching system helps minimize redundant API calls for identical images. All uploaded images are processed in memory and not permanently stored on the server.

Wiki pages you might want to explore:
- [Backend Services (cwerner283/photo_blog_generator)](/wiki/cwerner283/photo_blog_generator#4)
- [Flask Application Core (cwerner283/photo_blog_generator)](/wiki/cwerner283/photo_blog_generator#4.1)
- [Frontend Components (cwerner283/photo_blog_generator)](/wiki/cwerner283/photo_blog_generator#5)
