from typing import Dict
from flask import Blueprint
from flask_restful import Resource, Api

from modules.xlsx2pdf import hello

hello = Blueprint('hello', __name__)
api = Api(hello)


@api.resource('/hello')
class HelloResource(Resource):
    def get(self) -> Dict[str, str]:
        return {
            'hello': 'world',
        }
