import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_session import Session
from dotenv import load_dotenv
from config import Config
from datetime import datetime
from script import BlogAgent
from flask_cors import CORS



load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})




app.config.from_object(Config)

Session(app)

@app.route('/generate', methods=['POST'])
async def generate_blog():
    try:
        data = request.get_json()
        topic = data.get('topic')
        tone = data.get('tone', 'educational')
        
        if not topic:
            return jsonify({'error': 'Topic is required'}), 400
        
        async with BlogAgent(topic, tone) as agent:
            research_data = await agent.research_topic()
            await agent.generate_content(research_data)
            await agent.optimize_seo()
            
            response = {
                'content': agent.content,
                'metadata': {
                    'title': agent.metadata.get('title', ''),
                    'description': agent.metadata.get('description', ''),
                    'tags': agent.metadata.get('keywords', []),
                    'readingTime': f"{agent.metadata.get('reading_time', 1)} "
                                   f"min read",
                    'slug': agent.metadata.get('slug', ''),
                }
            }
            
            return jsonify(response)
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
def generate_slug(text):
    return text.lower() \
        .replace(' ', '-') \
        .replace("'", '') \
        .replace('"', '') \
        .replace(',', '') \
        .replace('.', '')[:50]

@app.errorhandler(404)
def not_found_error(error):
    return {"error": {"status": 404, "message": "Page Not Found!"}}, 404

@app.errorhandler(500)
def internal_server_error(error):
    return {"error": {"status": 500, "message": "Internal Server Error!"}}, 500
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
    app.run(debug=True, host='0.0.0.0', port=8080)