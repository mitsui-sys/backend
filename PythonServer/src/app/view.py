from flask import Blueprint, send_from_directory
from flask.helpers import NotFound

html = Blueprint('html', __name__)


@html.route('/', defaults={'filename': ''})
@html.route('/<path:filename>')
def index(filename: str):
    try:
        return send_from_directory('../static/html', filename)
    except NotFound:
        return send_from_directory('../static/html', 'index.html')