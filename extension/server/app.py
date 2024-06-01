import os
import logging
from flask import Flask, request, jsonify
from yt_dlp import YoutubeDL
import assemblyai as aai
from transformers import pipeline

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# AssemblyAI API key
aai.settings.api_key = "0bb28ce27bba4ebb9775f02b965c58cd"
transcriber = aai.Transcriber()

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

# T5 summarization model
summarizer = pipeline("summarization", model="t5-base", tokenizer="t5-base")

@app.route('/download', methods=['GET'])
def download():
    video_url = request.args.get('url')
    if not video_url:
        logger.error("No URL provided")
        return jsonify({"error": "No URL provided"}), 400

    try:
        # Download and convert video to MP3
        with YoutubeDL(YDL_OPTS) as ydl:
            result = ydl.extract_info(video_url, download=True)
            file_path = ydl.prepare_filename(result).replace('.webm', '.mp3').replace('.m4a', '.mp3')
        
        logger.info(f"Downloaded video and converted to MP3: {file_path}")

        # Transcribe the audio from the downloaded MP3 file
        transcript = transcriber.transcribe(file_path)
        transcript_text = transcript.text

        logger.info(f"Transcription completed: {transcript_text}")

        logger.inf0(f"Summarizing...")

        # Use the T5 model for summarization
        summary = summarizer(transcript_text, max_length=1000, min_length=30, do_sample=False)

        logger.info(f"Summary: {summary}")

        return jsonify({"status": "success", "transcription": transcript_text, "summary": summary[0]['summary_text']})

    except Exception as e:
        logger.error(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up the downloaded file
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Removed file: {file_path}")

if __name__ == '__main__':
    if not os.path.exists('downloads'):
        os.makedirs('downloads')
    app.run(host='0.0.0.0', port=8080)
