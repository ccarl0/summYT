from flask import Flask, request, send_file, jsonify
import yt_dlp
import os

app = Flask(__name__)

@app.route('/download', methods=['GET'])
def download_audio():
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "URL is required"}), 400

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': '/tmp/%(title)s.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            audio_file = ydl.prepare_filename(info).replace('.webm', '.mp3').replace('.m4a', '.mp3')

        return send_file(audio_file, as_attachment=True, download_name=os.path.basename(audio_file))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/index', methods=['GET'])
def index():
    return "<html><body><h1>Hello, World!</h1></body></html>"

if __name__ == '__main__':
    print("Server Started!")
    app.run(host='0.0.0.0', port=8080)
    print("Server Stopped!")

