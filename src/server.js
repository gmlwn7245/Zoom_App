import express from "express";
import SocketIO from "socket.io";
import http from "http";
// import WebSocket from "ws";


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


/* WS 방식 */

// SocektIO Server 생성시 HTTP Server 보내줌; 
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
    socket.on("enter_room", (roomName, done) => {
        console.log(roomName);
        setTimeout(()=>{
            done("Fin!!");     // FE함수로, FE에서만 실행됨!!!!! (중요) - 보안 문제도 있기 때문(DB 조작 등)
        }, 1000);
    });
})

httpServer.listen(3000, handleListen);