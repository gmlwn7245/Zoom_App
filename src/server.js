import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

/* HTTP 방식 */
// views에 있는 pug 템플릿 보여줌
app.set("view engine","pug");
app.set("views", __dirname + "/views");

// root 경로로 들어가면 home을 보여줌 (-> ./views/home.pug)
app.get("/", (req, res)=> res.render("home"));

// public 경로로 들어가면 public 하위 경로의 JS 실행 (static으로 설정해야 보임)
app.use("/public", express.static(__dirname + "/public"));

// 전부 Home으로 돌려보내기
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// Server Port Number
// app.listen(3000);


/* WS 방식 */

// http 서버 및 WS 생성 -> http 서버 위에서 webSocket 서버 생성 (개발의 효율성을 위함 이렇게 할 필요까지 없음)
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// socket -> 연결된(접속) 사람의 정보 담김 
function handleConnection(socket) {
    console.log(socket)
}

// http 접속 -> connection event 발생 -> ws으로 넘어감
wss.on("connection", handleConnection);

server.listen(3000, handleListen);