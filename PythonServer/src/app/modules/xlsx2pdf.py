# win32comをインポートするだけでは上手くいかないので注意！！
import os
from pathlib import Path
import win32com.client

def excel2pdf(path):
    excel = win32com.client.Dispatch("Excel.Application")
    abspath = str(Path(path).resolve())

    # ファイルが存在するか
    print(abspath)
    isfile = os.path.isfile(abspath)
    print(isfile)

    file = excel.Workbooks.Open(abspath)
    # 全てのシートをループ
    paths = []
    for sh in file.Sheets:
        print(sh.Name)
        file.WorkSheets(sh.Name).Select()
        abspath1 = str(abspath).replace(".xlsx",".pdf").insert(-4, sh.Name)
        print(abspath1)
        file.ActiveSheet.ExportAsFixedFormat(0, abspath1)
        paths.append(abspath1)
    file.Close()
    excel.Quit()
    return paths[0]