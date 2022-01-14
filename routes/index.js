const express = require("express");
const knex = require("knex");
const fs = require("fs");
const router = express.Router();

// 追加 1
const multer = require("multer");
// const upload = multer({dest: '/public/data/uploads'});
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/data/uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, new Date().valueOf() + "_" + file.originalname);
    },
  }),
});

const upload1 = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, new Date().valueOf() + "_" + file.originalname);
    },
  }),
});

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
  res.sendFile("index.html", { root: "." });
  // res.json({ info: 'Node.js, Express, and Postgres API' })
  // res.send('hello world');
});

router.get("/file", (req, res) => {
  db1
    .select("*")
    .from("files")
    .then((files) => {
      console.log(files);
      for (let key in files) {
        let file = files[key];
        console.log(file.filename);
        if (file.blob != null) {
          console.log("writing...");
          fs.writeFileSync(file.name, file.blob);
        }
      }
      res.json(200, { success: true });
      // console.log(files)
    })
    .catch((err) =>
      res.status(404).json({
        success: false,
        message: "not found",
        stack: err.stack,
      })
    );
});

router.get("/file/:filename", (req, res) => {
  const { filename } = req.params;
  console.log(filename);
  db1
    .select("*")
    .from("files")
    .where({ filename })
    .then((images) => {
      if (images[0]) {
        const dirname = path.resolve();
        const fullfilepath = path.join(dirname, images[0].filepath);

        return res.type(images[0].mimetype).sendFile(fullfilepath);
      }
      return Promise.reject(new Error("Image does not exist"));
    })
    .catch((err) =>
      res.status(404).json({
        success: false,
        message: "not found",
        stack: err.stack,
      })
    );
});

router.post("/file", upload.single("uploaded_file"), (req, res) => {
  console.log(req);
  console.log(req.file);
  const { filename, mimetype, size } = req.file;
  const filepath = req.file.path;
  const blob = [fs.readFileSync(filepath, { encoding: "hex" })];
  console.log(filename, filepath, mimetype, size);
  db1
    .insert({
      filename,
      filepath,
      mimetype,
      size,
      blob,
    })
    .into("files")
    .then(() => res.json({ success: true, filename }))
    .catch((err) =>
      res.json({
        success: false,
        message: "upload failed",
        stack: err.stack,
      })
    );
  // res.json('/file api');
});

router.post("/test", (req, res) => {
  console.log(req);
  res.send(req);
});

router.post("/upload", upload1.single("file"), (req, res) => {
  res.send(req.file.originalname + "ファイルのアップロードが完了しました。");
});

/*
データベースAPI
*/
router.post("/init", (req, res) => {
  db.init(req, res);
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

module.exports = router;
