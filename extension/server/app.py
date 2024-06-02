import os
import logging
from flask import Flask, request, jsonify
from yt_dlp import YoutubeDL
import requests
from openai import AzureOpenAI

app = Flask(__name__)

oai_key = "13cf4b63805044468161b60b42293570"

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
        # Download the video and convert it to MP3
        with YoutubeDL(YDL_OPTS) as ydl:
            result = ydl.extract_info(video_url, download=True)
            file_path = ydl.prepare_filename(result).replace('.webm', '.mp3').replace('.m4a', '.mp3')
        
        logger.info(f"Downloaded video and converted to MP3: {file_path}")

        # Send MP3 to Whisper endpoint
        whisper_url = "https://smyt-ncus.openai.azure.com/openai/deployments/smyt-whisper/audio/transcriptions?api-version=2024-02-01"
        files = [
            ('file', (os.path.basename(file_path), open(file_path, 'rb'), 'application/octet-stream'))
        ]
        headers = {
            'api-key': oai_key
        }
        
        response = requests.post(whisper_url, headers=headers, files=files)
        response.raise_for_status()

        # transcription = response.text
       
        transcription_data = response.json()
        transcription = transcription_data.get("text", "")

        logger.info(f"Transcription response: {transcription}")

        

        client = AzureOpenAI(
            azure_endpoint = "https://smyt-ncus.openai.azure.com/",
            api_key= "13cf4b63805044468161b60b42293570",
            api_version="2024-02-01"
        )

        summary_response = client.chat.completions.create(
            model="smyt-35t16k",
            messages=[
                {"role": "system", "content": "You are a useful YT videos text summarizer."},
                {"role": "user", "content": f"Summarize the following text: {transcription}"}
            ]
        )

        logger.info(summary_response.choices[0].message.content)

        # Clean up the downloaded file
        os.remove(file_path)
        logger.info(f"Removed file: {file_path}")

        return jsonify({"status": "success", "transcription": transcription, "summary": summary_response.choices[0].message.content})

    except Exception as e:
        logger.error(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    if not os.path.exists('downloads'):
        os.makedirs('downloads')
    app.run(host='0.0.0.0', port=8080)