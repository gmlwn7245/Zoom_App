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
    socket.on("join_room", (roomName)=> {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");    // to => sender 제외
    })

    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });

    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    })
})

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);