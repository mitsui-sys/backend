const express = require("express");
const knex = require("knex");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const glob = require("glob");

// 追加 1
const multer = require("multer");
const upload_dir = "public";
// const updir = path.dirname(__dirname).replace(/\\/g, "/") + "/public"; // アプリケーションフォルダのサブディレクトリ "./tmp" をアップロード先にしている。
// const upload = multer({ dest: upload_dir });
// const upload = multer({dest: '/public/data/uploads'});
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      let path = "public";
      cb(null, path);
    },
    filename: function (req, file, cb) {
      //日付を追加
      // cb(null, new Date().valueOf() + "_" + file.originalname);
      //ファイル名そのまま
      cb(null, file.originalname);
    },
  }),
});

const sampleDate = (date, format) => {
  format = format.replace(/YYYY/, date.getFullYear());
  format = format.replace(/MM/, date.getMonth() + 1);
  format = format.replace(/DD/, date.getDate());

  return format;
};

const getFiles = (dirpath, callback) => {
  const showFiles = (dirpath, callback) => {
    fs.readdir(dirpath, (err, files) => {
      if (err) {
        console.error(err);
        return;
      }
      for (const file of files) {
        const fp = path.join(dirpath, file);
        fs.stat(fp, (err, stats) => {
          if (err) {
            console.error(err);
            return;
          }
          if (stats.isDirectory()) {
            showFiles(fp, callback);
          } else {
            filelist.push(fp);
            callback(fp);
          }
        });
      }
    });
  };
  showFiles(upload_dir, console.log);
};

let db = require("../modules/postgre");
let db1 = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "test",
  },
});

router.get("/", (req, res) => {
  // res.sendFile("index.html", { root: "." });
  // res.json({ info: 'Node.js, Express, and Postgres API' })
  // res.send('hello world');
});

router.get("/upload", (req, res) => {
  try {
    const path = req.query.path;
    console.log(path);
    const dirList = glob.sync(`${path}/`);
    const fileList = glob.sync(`${path}`, { nodir: true });
    let dList = [];
    for (const i in dirList) {
      let test = {};
      const path = dirList[i];
      const folder = path.split("/").reverse().slice(1).reverse().join("/");
      const name = folder.split("/").reverse()[0];
      test["name"] = name;
      test["title"] = name;
      test["path"] = folder;
      test["folder"] = folder;
      test["date"] = sampleDate(new Date(), "YYYY年MM月DD日");
      test["color"] = "amber";
      test["icon"] = "mdi-folder";
      dList.push(test);
    }
    let fList = [];
    for (const i in fileList) {
      let test = {};
      const path = fileList[i];
      const folder = path.split("/").reverse().slice(1).reverse().join("/");
      const filename = path.split("/").reverse()[0].split(".")[0];
      const extend = path.split("/").reverse()[0].split(".")[1];
      const name = [filename, extend].join(".");
      test["name"] = name;
      test["title"] = name;
      test["path"] = path;
      test["folder"] = folder;
      test["filename"] = filename;
      test["extend"] = extend;
      test["date"] = sampleDate(new Date(), "YYYY年MM月DD日");
      test["color"] = "amber";
      test["icon"] = "mdi-clipboard-text";
      fList.push(test);
    }
    const result = { dirs: dList, files: fList };
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json(e);
  }
});

router.get("/upload/test", (req, res) => {
  //ファイルとディレクトリのリストが格納される(配列)
  const path = req.query.path || "*";
  const allList = glob.sync(path);
  const result = {
    data: { test: allList },
  };
  res.status(200).json(result);
});

router.get("/upload/directory", (req, res) => {
  //ファイルとディレクトリのリストが格納される(配列)
  const dirList = glob.sync("付属図書/**/");
  const result = {
    data: { dir: dirList },
  };
  res.status(200).json(result);
});

router.get("/upload/file", (req, res) => {
  const fileList = glob.sync("付属図書/**", { nodir: true });
  const result = {
    data: { file: fileList },
  };
  res.status(200).json(result);
});

router.get("/upload/detail", (req, res) => {
  //ファイルとディレクトリのリストが格納される(配列)
  const statList = new glob.Glob(path, { sync: true, stat: true });
  const result = {
    data: { detail: statList },
  };
  res.status(200).json(result);
});

router.get("/upload/dirent", (req, res) => {
  const readdirRecursively = async (dir, files = []) => {
    const dirents = await fsPromises.readdir(dir, { withFileTypes: true });
    const dirs = [];
    for (const dirent of dirents) {
      if (dirent.isDirectory()) dirs.push(`${dir}/${dirent.name}`);
      if (dirent.isFile()) files.push(`${dir}/${dirent.name}`);
      // let test = {};
      // const isDir = dirent.isDirectory();
      // test["name"] = file;
      // test["path"] = `${dir}/${dirent.name}`;
      // test["dir"] = isDir;
      // test["getdate"] = sampleDate(new Date(), "YYYY年MM月DD日");
      // test["color"] = isDir ? "amber" : "blue";
      // test["icon"] = isDir ? "mdi-folder" : "mdi-clipboard-text";
      // test["dirent"] = dirent;
      // dirs.push(`${dir}/${dirent.name}`);
    }
    for (const d of dirs) {
      files = await readdirRecursively(d, files);
    }
    return Promise.resolve(files);
  };
  (async () => {
    const result = await readdirRecursively("public/").catch((err) => {
      console.error("Error:", err);
    });
    console.log(result);
    res.status(200).json({ files: result });
  })();
});

router.post("/download", function (req, res, next) {
  console.log("/download");
  const body = req.body;
  console.log(body);
  const path = body.path;
  res.status(200).download(path);
  // const file = fs.readFileSync(path);
  // res.header("Content-Type", "application/json; charset=utf-8");
  // res.status(200).json(infos);
});
router.post("/api/download", function (req, res, next) {
  console.log("/api/download");
  const body = req.body;
  const path = body.path;
  res.status(200).download(path);
  // const file = fs.readFileSync(path);
  // res.header("Content-Type", "application/json; charset=utf-8");
  // res.status(200).json(infos);
});

router.post("/upload", upload.single("uploaded_file"), (req, res) => {
  const { filename, mimetype, size } = req.file;
  const filepath = req.file.path;
  const blob = [fs.readFileSync(filepath, { encoding: "hex" })];
  console.log(filename, filepath, mimetype, size);
  const result = { file: req.file.originalname, upload: "success" };
  res.status(200).json(result);
});

/*
データベースAPI
*/
router.post("/init", (req, res) => {
  db.init(req, res);
});
router.get("/table", (req, res) => {
  db.getTables(req, res);
});
router.post("/create", (req, res) => {
  db.createTable(req, res);
});
router.get("/columns/:name", (req, res) => {
  console.log("GET COLUMN");
  db.getColumns(req, res);
});

router.get("/db", (req, res) => {
  console.log("SELECT");
  db.selectDatabase(req, res);
});
router.get("/db/:table", (req, res) => {
  console.log("SELECT ID");
  db.selectDatabase(req, res);
});
router.post("/db/:table", (req, res) => {
  console.log("INSERT");
  db.insertDatabase(req, res);
});
router.put("/db/:table", (req, res) => {
  console.log("UPDATE");
  db.updateDatabase(req, res);
});
router.delete("/db/:table", (req, res) => {
  console.log("DELETE");
  db.deleteDatabase(req, res);
});

router.get("/system/user", (req, res) => {
  console.log("get user");
  req.params.table = "tbl_001_user";
  db.selectSystem(req, res);
});

router.post("/system/user", (req, res) => {
  console.log("register user");
  req.params.table = "tbl_001_user";
  db.insertSystem(req, res);
});

router.put("/system/user", (req, res) => {
  console.log("get user");
  req.params.table = "tbl_001_user";
  db.updateSystem(req, res);
});

router.delete("/system/user", (req, res) => {
  console.log("delete user");
  req.params.table = "tbl_001_user";
  db.deleteSystem(req, res);
});

router.get("/system/user/login", (req, res) => {
  console.log("get user");
  req.params.table = "tbl_001_user";
  db.selectSystem(req, res);
});

router.get("/system/file", (req, res) => {
  console.log("Get File List");
  db.getFile(req.res);
});

router.get("/system/log", (req, res) => {
  req.params.table = "tbl_008_log";
  db.selectSystem(req, res);
});

router.post("/system/log/register", (req, res) => {
  req.params.table = "tbl_008_log";
  db.insertSystem(req, res);
});

//表示情報の設定
router.get("/display", (req, res) => {
  console.log("SELECT display");
  req.params.table = "tbl_009_display";
  db.selectSystem(req, res);
});
router.get("/display/:table", (req, res) => {
  console.log("SELECT display");
  req.params.table = "tbl_009_display";
  db.selectSystem(req, res);
});
router.post("/display", (req, res) => {
  console.log("INSERT DISPLAY");
  req.params.table = "tbl_009_display";
  db.insertSystem(req, res);
});
router.put("/display", (req, res) => {
  console.log("UPDATE DISPLAY");
  req.params.table = "tbl_009_display";
  db.updateSystem(req, res);
});
router.delete("/display", (req, res) => {
  console.log("DELETE DISPLAY");
  req.params.table = "tbl_009_display";
  db.deleteSystem(req, res);
});

//表示情報の設定
router.get("/document", (req, res) => {
  console.log("SELECT display");
  req.params.table = "tbl_010_document";
  db.selectSystem(req, res);
});
router.get("/document/:table", (req, res) => {
  console.log("SELECT display");
  req.params.table = "tbl_010_document";
  db.selectSystem(req, res);
});
router.post("/document", (req, res) => {
  console.log("INSERT DISPLAY");
  req.params.table = "tbl_010_document";
  db.insertSystem(req, res);
});
router.put("/document", (req, res) => {
  console.log("UPDATE DISPLAY");
  req.params.table = "tbl_010_document";
  db.updateSyetem(req, res);
});
router.delete("/document", (req, res) => {
  console.log("DELETE DISPLAY");
  req.params.table = "tbl_010_document";
  db.deleteSystem(req, res);
});

//置換用データ
router.get("/system/replace", (req, res) => {
  console.log("SELECT display");
  req.params.table = "tbl_011_replace";
  db.selectSystem(req, res);
});

router.get("/replace", (req, res) => {
  console.log("SELECT display");
  req.params.table = "tbl_011_replace";
  db.selectSystem(req, res);
});

//確認用コマンド
router.get("/comment/:table", (req, res) => {
  console.log("SELECT comment");
  db.getColumnComment(req, res);
});

router.get("/test/:table", (req, res) => {
  console.log("get system data");
  db.selectSystem(req, res);
});

router.get("/api/system/user/login", (req, res) => {
  console.log("confirm API");
});

module.exports = router;
