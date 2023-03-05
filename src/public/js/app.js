// BackEnd와 socket.io를 자동적으로 연결해주는 Function
// 자동으로 BE로 socket 전송 
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function backEndDone(msg) {
    console.log(`The BackEnd says : ${msg}`);
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");

    // emit(이벤트명, BE로 전달할 객체, FE에서 호출될 함수) => 이벤트명 이하 파라미터는 개수, 형식 관계없이 마음대로 작성
    // 다만 Server에서 작업이 끝난 후 실행되었으면 하는 함수는 마지막 파라미터로 넣어주기!
    socket.emit("enter_room", { payload : input.value }, backEndDone); 
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);