import http from "http";
import express from "express";

const app = express();
app.set("view engine","pug");
app.set("views", __dirname + "/views");
app.get("/", (_, res)=> res.render("login"));      // root 경로로 들어가면 home을 보여줌 (-> ./views/home.pug)

const httpServer = http.createServer(app);

//const handleListen = () => console.log(`Listening on http://localhost:3000`);
//httpServer.listen(3000, handleListen);