const express = require("express");
const cors = require("cors"); // corsポリシーに抵触するため、その対策としてcorsを利用する
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");

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
// app.use("/public", express.static("public"));
console.log(path.join(__dirname, "public"));
app.use("/public", express.static(path.join(__dirname, "public")));

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
app.use((req, res, next) => {
  res.status(404);
  res.end("Not found! : " + req.path);
});

app.use((err, req, res, next) => {
  res.status(500);
  res.end("my 500 error! : " + err);
});

io.on("connection", (socket) => {
  socket.on("message", (msg) => {
    console.log("message: " + msg);
    io.emit("message", msg);
  });
});

http.listen(PORT, () => {
  console.log("server listening. Port:" + PORT);
});
