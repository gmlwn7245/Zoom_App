const socket = io();

// 해당 브라우저 화면 정보
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

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
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

/* Welcome - Room 선택 */

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    /* emit으로 보내지 않고, join 전에 실행 */
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);


// Socket

// 누군가 특정 룸에 입장했을 경우 (입장한 본인 제외 실행)
socket.on("welcome", async () => {
    /* 참조 : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer */
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);

    /* 입장한 사람에게 보내기 */
    console.log("sent the offer")
    socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);

    socket.emit("answer", answer);
});

socket.on("answer", (answer)=>{
    myPeerConnection.setRemoteDescription(answer);
})

// RTC

function makeConnection(){
    // Server.js 에서 callback으로 실행하면 너무 빠르게 일어나서 offer의 setRemoteDescription때 에러가 발생
    myPeerConnection = new RTCPeerConnection();

    /* myStream 데이터 저장하기 - P2P 로 데이터 보내기 위함 */
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}

