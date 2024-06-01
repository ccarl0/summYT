# app.py
import os
import logging
from flask import Flask, request, jsonify
from yt_dlp import YoutubeDL
import requests

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# yt-dlp options
YDL_OPTS = {
    'format': 'bestaudio/best',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }],
    'outtmpl': 'downloads/%(id)s.%(ext)s',
    'ffmpeg_location': '/usr/bin/ffmpeg'  # Specify the ffmpeg location
}

@app.route('/download', methods=['GET'])
def download():
    video_url = request.args.get('url')
    if not video_url:
        logger.error("No URL provided")
        return jsonify({"error": "No URL provided"}), 400

    try:
        with YoutubeDL(YDL_OPTS) as ydl:
            result = ydl.extract_info(video_url, download=True)
            file_path = ydl.prepare_filename(result).replace('.webm', '.mp3').replace('.m4a', '.mp3')
        
        logger.info(f"Downloaded video and converted to MP3: {file_path}")

        # Send MP3 to specified endpoint
        url = "https://smyt.openai.azure.com/openai/deployments/summyt-deploy/audio/transcriptions?api-version=2024-02-01"
        files = [
            ('file', (os.path.basename(file_path), open(file_path, 'rb'), 'application/octet-stream'))
        ]
        headers = {
            'api-key': 'd4d23c1f87784aa0992d6dbd1a0ccca1'
        }
        
        response = requests.post(url, headers=headers, files=files)
        logger.info(f"Response from server: {response.text}")

        # Clean up the downloaded file
        os.remove(file_path)
        logger.info(f"Removed file: {file_path}")

        return jsonify({"status": "success", "response": response.text})

    except Exception as e:
        logger.error(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    if not os.path.exists('downloads'):
        os.makedirs('downloads')
    app.run(host='0.0.0.0', port=8080)
