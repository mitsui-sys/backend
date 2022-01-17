const express = require("express");
const knex = require("knex");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const glob = require("glob");

// 追加 1
const multer = require("multer");
const upload_dir = "public/data/uploads";
const updir = path.dirname(__dirname).replace(/\\/g, "/") + "/public"; // アプリケーションフォルダのサブディレクトリ "./tmp" をアップロード先にしている。
const upload = multer({ dest: updir });
// const upload = multer({dest: '/public/data/uploads'});
// const upload = multer({
//   storage: multer.diskStorage({
//     destination: function (req, file, cb) {
//       let path = "public";
//       if (req.params.path) path += req.params.path;
//       cb(null, path);
//     },
//     filename: function (req, file, cb) {
//       //日付を追加
//       // cb(null, new Date().valueOf() + "_" + file.originalname);
//       //ファイル名そのまま
//       cb(null, file.originalname);
//     },
//   }),
// });

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

router.get("/upload/directory", (req, res) => {
  //ファイルとディレクトリのリストが格納される(配列)
  const dirList = glob.sync("public/*/");
  res.status(200).json({ dirs: dirList });
});

router.get("/upload", (req, res) => {
  fs.readdir(upload_dir, (err, files) => {
    let filelist = [];
    if (err) {
      console.error(err);
      return;
    }
    for (const file of files) {
      let test = {};
      const fp = path.join(upload_dir, file);
      test["name"] = file;
      test["title"] = file;
      test["subtitle"] = sampleDate(new Date(), "YYYY年MM月DD日");
      test["path"] = fp;
      test["color"] = "amber";
      test["icon"] = "mdi-clipboard-text";
      filelist.push(test);
    }
    const result = { files: filelist };
    res.status(200).json(result);
  });
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
  db.get(req, res);
});
router.get("/db/:name", (req, res) => {
  console.log("SELECT ID");
  db.get(req, res);
});

router.post("/db", (req, res) => {
  console.log("INSERT");
  db.insertOne(req, res);
});
router.post("/db/:name", (req, res) => {
  console.log("INSERT");
  db.insertOne(req, res);
});
router.put("/db", (req, res) => {
  console.log("UPDATE");
  db.updateOne(req, res);
});
router.put("/db/:name", (req, res) => {
  console.log("UPDATE");
  db.updateOne(req, res);
});
router.delete("/db", (req, res) => {
  console.log("DELETE");
  db.deleteOne(req, res);
});
router.delete("/db/:name", (req, res) => {
  console.log("DELETE");
  db.deleteOne(req, res);
});

router.get("/system/user", (req, res) => {
  console.log("get user");
  db.getUser(req, res);
});

router.get("/system/user/search/:user", (req, res) => {
  console.log("get user");
  db.getUser(req, res);
});

router.get("/system/user/login", (req, res) => {
  console.log("login");
  db.login(req, res);
});

router.post("/system/user/register", (req, res) => {
  console.log("Register User ");
  db.registerUser(req, res);
});

router.post("/system/search/register", (req, res) => {
  console.log("Register Search");
  db.registerSearch(req, res);
});

router.get("/system/search/:user", (req, res) => {
  console.log("Get Search List");
  db.getSearch(req, res);
});

router.get("/system/file", (req, res) => {
  console.log("Get File List");
  db.getFile(req.res);
});

router.post("/system/file/register", (req, res) => {
  console.log("Register File");
  console.log(req);
  db.registerFile(req, res);
});

router.get("/system/current", (req, res) => {
  console.log("Current File");
  db.getCurrentFiles(req, res);
});

router.get("/system/log", (req, res) => {
  console.log("Get File");
  db.getLog(req, res);
});

router.post("/system/log/register", (req, res) => {
  console.log("Register Log");
  db.registerLog(req, res);
});

//表示情報の設定
router.get("/display/:table", (req, res) => {
  console.log("SELECT display");
  db.getDisplay(req, res);
});
router.post("/display/:table", (req, res) => {
  console.log("INSERT DISPLAY");
  db.registerDisplay(req, res);
});
router.put("/display/:table", (req, res) => {
  console.log("UPDATE DISPLAY");
  db.updateDisplay(req, res);
});
router.delete("/display/:table", (req, res) => {
  console.log("DELETE DISPLAY");
  db.deleteDisplay(req, res);
});

module.exports = router;
