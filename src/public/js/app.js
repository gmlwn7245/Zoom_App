// http(X) ws(O) || window.location.host == localhost:3000 (server.js에 설정한 포트)
const socket = new WebSocket(`ws://${window.location.host}`);

/*
 socket.send() 한거 FE에서 받기
 1. socket 열기
 2. message 열기
 3. Disconnect 감지 
*/

socket.addEventListener("open", () => {
    console.log("Connected to Server!");
});

socket.addEventListener("message", (message) => {
    console.log("Just got this: ", message.data , " From the Server~");
});

socket.addEventListener("close", () => {
    console.log("DisConnected From Server ㅠㅠ ");
});