import express from "express";
import SocketIO from "socket.io";
import http from "http";

const app = express();

/* HTTP 방식 */
// views에 있는 pug 템플릿 보여줌
app.set("view engine","pug");
app.set("views", __dirname + "/views");
app.get("/", (_, res)=> res.render("home"));      // root 경로로 들어가면 home을 보여줌 (-> ./views/home.pug)
app.use("/public", express.static(__dirname + "/public"));
app.get("/*", (_, res) => res.redirect("/"));     // 전부 Home으로 돌려보내기

// SocektIO Server 생성시 HTTP Server 보내줌; 
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", socket => {
    /* room 입장 - (App.js) 유저들로부터 offer 받기 */
    socket.on("join_room", (roomName)=> {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");    // to => sender 제외
    });

    /* offer 받음 - (App.js) offer remote 등록 후 answer 제공해줌 */
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });

    /* answer 받음 - (App.js) answer remote 등록 */
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });

    /* ICE 받음 - (App.js) ice 넣어줌 */
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    });

    /* Message 전송 */
    socket.on("chat", (msg, roomName)=> {
        socket.to(roomName).emit("show_message", msg);
    });
})

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);