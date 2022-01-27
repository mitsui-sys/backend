from flask import Flask, Blueprint

from app.api import hello
from app.view import html

flask_app = Flask(__name__)

# REST API を定義
flask_app.register_blueprint(hello, url_prefix='/api')

# 静的ファイル（画像、JSON）
json = Blueprint('json', __name__, static_url_path='/json', static_folder='../static/json')
images = Blueprint('images', __name__, static_url_path='/images', static_folder='../static/images')
flask_app.register_blueprint(json)
flask_app.register_blueprint(images)

# 静的ファイル（HTML/JavaScript/CSS）
flask_app.register_blueprint(html)

if __name__ == '__main__':
    flask_app.run(host='0.0.0.0', port=8000)