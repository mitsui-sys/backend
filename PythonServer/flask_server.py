# Flaskクラスのインポート
from flask import Flask, request, make_response, jsonify, send_file, redirect
import os
import werkzeug
from datetime import datetime
from flask_cors import CORS
from modules import xlsx2pdf

app = Flask(__name__)  # appという名前のFlaskクラスのインスタンスを作成
CORS(
    app,
    supports_credentials=True
) 

# ★ポイント1
# limit upload file size : 1MB
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

# ★ポイント2
# ex) set UPLOAD_DIR_PATH=C:/tmp/flaskUploadDir
UPLOAD_DIR = "upload"

@app.route('/')
def index():
    resp = make_response("Record not found", 400)
    resp.headers['X-Something'] = 'A value'
    return resp

# ルーティング(URLの設定）
@app.route("/hello")
def hello():  # "/hello"のURLで呼び出される関数
    return "Hello World!"

@app.route("/excel", methods=['POST', 'GET'])
def excel():
    if request.method == 'POST':
        return make_response(jsonify({'result':'upload OK.'}))
        
@app.route('/data/upload', methods=['GET', 'POST'])
def upload_multipart():
    print(request)
    if request.method == 'POST':
        # print(request.form)
        # upload_file = request.form.get('uploaded_file')
        # print(upload_file)
        # file = request.files['uploaded_file']
        # ★ポイント3
        if 'uploaded_file' not in request.files:
            make_response(jsonify({'result':'uploadFile is required.'}))
        file = request.files['uploaded_file']
        fileName = file.filename
        if '' == fileName:
            make_response(jsonify({'result':'filename must not empty.'}))
        saveFileName = datetime.now().strftime("%Y%m%d_%H%M%S_") + fileName
        savePath = os.path.join(UPLOAD_DIR, saveFileName)
        file.save(savePath)
        # excelからpdfに変換
        pdfpath = xlsx2pdf.convertExcel2Pdf(savePath)
        pdfname = os.path.basename(pdfpath)
        # pdfデータを送信する
        response = make_response()
        response.data = open(pdfpath, 'rb').read()
        response.headers['Content-Disposition'] = f'attachment; filename={pdfname}"'
        response.mimetype = "application/pdf"
        return response
    else:
        return make_response(jsonify({'result':'upload OK.'}))
    
@app.errorhandler(werkzeug.exceptions.RequestEntityTooLarge)
def handle_over_max_file_size(error):
    print("werkzeug.exceptions.RequestEntityTooLarge")
    return 'result : file size is overed.'


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)