# win32comをインポートするだけでは上手くいかないので注意！！
import os
from pathlib import Path
from win32com.client import Dispatch
import pythoncom

class Excel():
    def __init__(self, visible=False):
        """ Excel機能を提供するクラス """
        pythoncom.CoInitialize()  # Excelを起動する前にこれを呼び出す
        self._app = Dispatch("Excel.Application")
        self._app.Visible = visible
        
    @property
    def app(self):
        return self._app

    def quit(self):
        self.app.Quit()
        pythoncom.CoUninitialize()

def convertExcel2Pdf(path):
    print(path)
    excel = Excel().app
    abspath = str(Path(path).resolve())

    # ファイルが存在するか
    print(abspath)
    isfile = os.path.isfile(abspath)
    print(isfile)

    file = excel.Workbooks.Open(abspath)
    # 全てのシートをループ
    paths = []
    for sh in file.Sheets:
        name = sh.Name
        file.WorkSheets(name).Select()
        index = abspath.find(".xlsx")
        path = abspath[:index]+"_"+name+abspath[index:]
        abspath1 = path.replace(".xlsx", ".pdf")
        print(abspath1)
        file.ActiveSheet.ExportAsFixedFormat(0, abspath1)
        paths.append(abspath1)
    file.Close()
    excel.Quit()
    return paths[0]