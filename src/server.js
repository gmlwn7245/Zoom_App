import express from "express";
import {Server} from "socket.io";
import http from "http";
import {instrument} from "@socket.io/admin-ui";
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
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
});

// http://localhost:3000/admin 관리자 페이지 위치
instrument(wsServer, {
    auth: false
});

// 생성된 ROOM LIST
function publicRooms() {
    // wsServer에 접속된 모든 Socket의 id와 roomName 가져옴
    const {sockets : {adapter : {sids, rooms}}} = wsServer;

    const publicRooms = [];

    // socket 생성시 같이 생성되는 Private Room이 아닌 새로 만들어진 public Room만 가져옴
    rooms.forEach((_, key)=>{
        if(sids.get(key)=== undefined){
            publicRooms.push(key);
        }
    });

    return publicRooms;
}

// Room에 참여한 인원수
function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}


wsServer.on("connection", (socket) => {
    // 초기 닉네임
    socket["nickname"] = "Anon";

    // Socket의 모든 이벤트를 살핌
    socket.onAny((event) => {
        console.log(`Socket Event : ${event}`);
    });

    // 입장시 처리
    socket.on("enter_room", (roomName, done) => {
        
        // socket.io에서 기본으로 제공하는 ROOM 기능 = join
        socket.join(roomName.payload);
        done();     // FE함수로, FE에서만 실행됨!!!!! (중요) - 보안 문제 있음(DB 조작 등)
        
        socket.to(roomName.payload).emit("welcome", socket.nickname, countRoom(roomName.payload));

        wsServer.sockets.emit("room_change", publicRooms());
    });

    // 퇴장시 socket 삭제 직전 처리
    socket.on("disconnecting", (room) => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room)-1));  // 아직 떠나지 않았기 때문
    });

    // 퇴장시 socket 삭제 직후 처리
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });

    // 채팅 메세지 전송
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
        done();
    });

    // 닉네임 변경
    socket.on("nickname", (nickname) => {socket["nickname"]=nickname});
})

httpServer.listen(3000, handleListen);