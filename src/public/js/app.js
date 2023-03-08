// BackEnd와 socket.io를 자동적으로 연결해주는 Function
// 자동으로 BE로 socket 전송 
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

// 화면에 안보이게 하기
room.hidden = true;

let roomName;

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    roomName = input.value;

    // emit(이벤트명, BE로 전달할 객체, FE에서 호출될 함수) => 이벤트명 이하 파라미터는 개수, 형식 관계없이 마음대로 작성
    // 다만 Server에서 작업이 끝난 후 실행되었으면 하는 함수는 마지막 파라미터로 넣어주기!
    socket.emit("enter_room", { payload : input.value }, showRoom); 
    input.value = "";
}

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

form.addEventListener("submit", handleRoomSubmit);


// 입장시 메세지
socket.on("welcome", () => {
    console.log("welcome");
    addMessage("Someone Joined!");
})