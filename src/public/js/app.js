// http(X) ws(O) || window.location.host == localhost:3000 (server.js에 설정한 포트)

const socket = new WebSocket(`ws://${window.location.host}`);

const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#msg");
const nickForm = document.querySelector("#nick");

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

function makeMessage(type, payload){
    const msg = {type, payload};

    // message는 StringType 이어야 함 -> JS 서버가 아닐수도 있기 때문임
    // (후에 BE에서 parse 이용해서 다시 JSON으로 변경)
    return JSON.stringify(msg);
}


function handleMsgSubmit(event) {
    // 기본 동작 방지 
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    input.value = "";   // 전송 후 공백으로 변경 
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname",input.value));
    alert(`NickName changed : ${input.value}`);
}


messageForm.addEventListener("submit", handleMsgSubmit);
nickForm.addEventListener("submit", handleNickSubmit)