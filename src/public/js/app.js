const socket = io();

// 해당 브라우저 화면 정보
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

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
        

        console.log(cameras);
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

        console.log(myStream.getVideoTracks());
    } catch(e) {
        /* 오류 처리 */
        console.log(e);
    }
}

getMedia();

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

