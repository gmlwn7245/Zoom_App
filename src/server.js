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

// 임시용 데이터베이스 
const sockets = [];

// socket -> 연결된(접속) 사람의 정보 담김 
function handleConnection(socket) {
    sockets.push(socket);       // 연결된 소켓 모두 저장 
    socket["nickname"] = "Anonymous";   // 첫 별명은 익명으로 설정
    console.log("Connected to Browser!");

    // Server Side 알림 
    socket.on("message", (msg) => {
        // message.toString() 작업 필요
        const message = JSON.parse(msg);

        switch(message.type){
            case "new_message":{
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}:${message.payload}`));   // 연결중인 소켓에게 모두 전송 
                break;
            }
            case "nickname":{
                socket["nickname"]=message.payload;
                break;
            }
        }
        
    }); 
    socket.on("close", () => {console.log("Disconnected from the Browser");});
}

// http 접속 -> connection event 발생 -> ws으로 넘어감  
// Disconnect 전까지는 State 유지
wss.on("connection", handleConnection);

server.listen(3000, handleListen);