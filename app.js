const express = require("express");
const cors = require("cors"); // corsポリシーに抵触するため、その対策としてcorsを利用する
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");

// const log4js = require("log4js");

// log4js.configure({
//   appenders: {
//     system: { type: "file", filename: "./logs/system.log" },
//   },
//   categories: {
//     default: { appenders: ["system"], level: "debug" },
//   },
// });
// const logger = log4js.getLogger("cheese");

// logger.trace("trace msg");
// logger.debug("debug msg");
// logger.info("info msg");
// logger.warn("warn msg");
// logger.error("error msg");
// logger.fatal("fatal msg");

var indexRouter = require("./routes/index");
var app = express();
var http = require("http").Server(app);

//io通信
var io = require("socket.io")(http);
const PORT = process.env.PORT || 50001;

//すべてのAPIをCORS許可したい場合
app.use(cors());

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/public", express.static("public"));
// app.use(express.static('public'));
// app.use(express.static('files'));

//セッション情報
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxage: 1000 * 60 * 1, //タイムアウト1分
    },
  })
);

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404);
  res.end("Not found! : " + req.path);
});

app.use(function (err, req, res, next) {
  res.status(500);
  res.end("my 500 error! : " + err);
});

io.on("connection", function (socket) {
  socket.on("message", function (msg) {
    console.log("message: " + msg);
    io.emit("message", msg);
  });
});

http.listen(PORT, function () {
  console.log("server listening. Port:" + PORT);
});
