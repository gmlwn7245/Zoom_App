const socket = io();

// 해당 브라우저 화면 정보
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let myStream;
let muted = false;
let cameraOff = false;

// 참조 : https://developer.mozilla.org/ko/docs/Web/API/MediaDevices/getUserMedia
async function getMedia(){
    try {
        /* 스트림 사용 */
        myStream = await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true
        });

        /* 화면에 비디오 화면 띄우기 */
        myFace.srcObject = myStream;
        console.log(myStream);
    } catch(e) {
        /* 오류 처리 */
        console.log(e);
    }
}

getMedia();

function handleMuteClick(){
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
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    }else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
    console.log("click Camera BTN");
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);

