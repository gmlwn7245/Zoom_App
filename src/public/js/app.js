const socket = io();

/** 
 * Mobile 에서 사용하기
 * > 서버 run 
 * > npm i -g localtunnel
 * > lt --port 3000
 * > link 방문
 */

// 해당 브라우저 화면 정보
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const call = document.getElementById("call");

const chat = document.getElementById("chat");
const chatForm = chat.querySelector("form");

const stream = call.querySelector("div");

call.style.display='none';
chat.style.display='none';

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

async function getCameras() {
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];

        /* 카메라 선택 옵션 생성 코드 */
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;     // 선택 후 카메라 출력 변경을 위함
            option.innerText = camera.label;
            if(currentCamera.labe === camera.label){
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        });
        

        //console.log(cameras);
    }catch(e){
        console.log(e);
    }
}

// 참조 : https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
async function getMedia(deviceId){
    const initalConstraints = {
        audio:true,  
        video: { 
            facingMode : "user"     // 후면카메라 - facingMode : "environment"
        }
    }

    const cameraConstraints = {
        audio:true,  
        deviceId: {
            exact : deviceId        // 특정 deviceId로 카메라 설정
        }
    }
    try {
        /* 스트림 사용 */
        myStream = await navigator.mediaDevices.getUserMedia({
            audio : true,
            video : deviceId ? cameraConstraints : initalConstraints
        });

        if(!deviceId){
            await getCameras();
        }

        /* 화면에 비디오 화면 띄우기 */
        myFace.srcObject = myStream;

        //console.log(myStream.getVideoTracks());
    } catch(e) {
        /* 오류 처리 */
        console.log(e);
    }
}

function handleMuteClick(){
    /* 오디오 트랙 정보 getAudioTracks() - enable 필드로 활성화 여부 변경 */
    myStream.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
    if(!muted){
        muteBtn.innerText = "UnMute";
        muted = true;
    }else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
    console.log("click Mute BTN");
}

function handleCameraClick(){
    /* 비디오 트랙 정보 getVideoTracks() - enable 필드로 활성화 여부 변경 */
    myStream.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    }else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
    console.log("click Camera BTN");
}

async function handleCameraChange(){
    await getMedia(camerasSelect.value);

    /* 다른 Peer에 있는 my track 바꾸기 */
    if(myPeerConnection){
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find((sender) => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }
}


muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);





/* Welcome - Room 선택 */

async function initCall(){
    welcome.hidden = true;
    call.style.display='inline-flex';
    chat.style.display='block';
    await getMedia();
    makeConnection();
}

async function isFulled(isFull){
    if(isFull){
        console.log("fulled");
        swal('입장 불가',"방의 인원이 모두 찼습니다.",'warning');
    } else {
        const input = welcomeForm.querySelector("input");
        console.log("not fulled");
        /* emit으로 보내지 않고, join 전에 실행 */
        await initCall();

        const header = document.querySelector("header");
        const h1 = header.querySelector("h1");
        h1.textContent = "ROOM - "+input.value;

        socket.emit("join_room", input.value);
        roomName = input.value;
        input.value = "";
    }
    
}

async function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    socket.emit("check", input.value, isFulled);
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);


/* Chat - Message 전송 */
function handleChatSubmit(event){
    event.preventDefault();
    const input = chatForm.querySelector("input");

    message = input.value;
    socket.emit("chat", message, roomName);
    addMessage("나 : " +message);
    input.value="";
}
socket.on("show_message", (message) => {
    console.log(message);
    addMessage("상대 : "+message);
});

function addMessage(message){
    const ul = chat.querySelector("ul");
    const li = document.createElement("li");
    const showChat = chat.querySelector("div");
    li.innerText = message;
    ul.appendChild(li);
    showChat.scrollTop = showChat.scrollHeight;
}



chatForm.addEventListener("submit", handleChatSubmit);

// Socket

// 누군가 특정 룸에 입장했을 경우 (입장한 본인 제외 실행)
socket.on("welcome", async () => {
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", console.log);
    console.log("made Data Channel");

    /* 참조 : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer */
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);

    /* 입장한 사람에게 보내기 */
    console.log("sent the offer")
    socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
    myPeerConnection.addEventListener("datachannel", (event) => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message", console.log);
    });

    console.log("received the offer");

    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);

    console.log("sent the answer");
    socket.emit("answer", answer, roomName);
});

socket.on("answer", (answer)=>{
    console.log("Received the Answer");
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
    console.log("Received Candidate");
    myPeerConnection.addIceCandidate(ice);
});

// RTC

function makeConnection(){
    // Server.js 에서 callback으로 실행하면 너무 빠르게 일어나서 offer의 setRemoteDescription때 에러가 발생
    myPeerConnection = new RTCPeerConnection(

    /*    STUN Server
    {
        // GOOGLE STUN Server Ref : https://gist.github.com/zziuni/3741933
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302"
                ]
            }
        ]
    } 
    // Doesn't Work
    */
    );
    
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("track", handleTrack);

    /* myStream 데이터 저장하기 - P2P 로 데이터 보내기 위함 */
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}

function handleTrack(data) {
    console.log("got an event from my peer");
    //console.log("Peer's Stream", data.streams[0]);
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.streams[0];
    //console.log("My Stream", myStream);
}

function handleIce(data) {
    console.log("Sent Candidate");
    socket.emit("ice", data.candidate, roomName);
}
