// http(X) ws(O) || window.location.host == localhost:3000 (server.js에 설정한 포트)

const socket = new WebSocket(`ws://${window.location.host}`);

const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

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
    // console.log("New Message : ", message.data);
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

socket.addEventListener("close", () => {
    console.log("DisConnected From Server ㅠㅠ ");
});


function handleSubmit(event) {
    // 기본 동작 방지 
    event.preventDefault();
    const input = messageForm.querySelector("input");
    // console.log(input.value);
    socket.send(input.value);
    input.value = "";   // 전송 후 공백으로 변경 
}


messageForm.addEventListener("submit", handleSubmit);
