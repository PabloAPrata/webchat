let roomName = "test";
const user_video = document.getElementById("user_video");
const peer_video = document.getElementById("peer_video");
const join_button = document.getElementById("developer_button");
const mic_button = document.getElementById("mic_button");
const videocam_button = document.getElementById("videocam_button");
const hangup_button = document.getElementById("hangup_button");
const container_incall = document.getElementById("container_incall");
let timer = 0;

let mute_flag = false;
let videocamera_flag = false;

let creator = false;
let rtcPeerConnection;
let userStream;

let iceServers = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

join_button.addEventListener("click", () => {
  if (!roomName) {
    alert("Please enter a room name");
    return;
  }
  roomName = "test";
  socket.emit("join", roomName);
  container_incall.style.zIndex = "5";
});

socket.on("created", () => {
  creator = true;

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then(function (stream) {
      userStream = stream;
      user_video.style.width = "100%";
      user_video.style.height = "100%";
      user_video.srcObject = stream;
      user_video.onloadedmetadata = function (e) {
        user_video.play();
      };
    })
    .catch(function (err) {
      console.log("An error occurred: " + err);
    });
});

socket.on("joined", () => {
  creator = false;

  navigator.mediaDevices
    .getUserMedia({ audio: true, video: true })
    .then(function (stream) {
      userStream = stream;
      user_video.style.width = "100%";
      user_video.style.height = "100%";
      user_video.srcObject = stream;
      user_video.onloadedmetadata = function (e) {
        user_video.play();
      };
      socket.emit("ready", roomName);
    })
    .catch(function (err) {
      console.log("An error occurred: " + err);
      alert("Couldn't Access User Media");
    });
});

socket.on("full", () => {
  alert("Não é possivel entrar nesta sala. A sala está cheia!");
});

socket.on("ready", () => {
  if (creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
    rtcPeerConnection.ontrack = OnTrackFunction;

    // userStream.getTracks().forEach((track) => {
    //   rtcPeerConnection.addTrack(track, userStream);
    // });
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);

    rtcPeerConnection
      .createOffer()
      .then((offer) => {
        rtcPeerConnection.setLocalDescription(offer);
        socket.emit("offer", offer, roomName);
      })

      .catch((error) => {
        console.log(error);
      });
  }
});

socket.on("candidate", (candidate) => {
  let iceCandidate = new RTCIceCandidate(candidate);
  rtcPeerConnection.addIceCandidate(iceCandidate);
});

socket.on("offer", (offer) => {
  if (!creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
    rtcPeerConnection.ontrack = OnTrackFunction;
    // console.log(userStream.getTracks());
    // userStream.getTracks().forEach((track) => {
    //   rtcPeerConnection.addTrack(track, userStream);
    // });
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);

    rtcPeerConnection.setRemoteDescription(offer);
    rtcPeerConnection
      .createAnswer()
      .then((answer) => {
        rtcPeerConnection.setLocalDescription(answer);
        socket.emit("answer", answer, roomName);
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

socket.on("answer", (answer) => {
  rtcPeerConnection.setRemoteDescription(answer);
});

function OnIceCandidateFunction(event) {
  if (event.candidate) {
    socket.emit("candidate", event.candidate, roomName);
  }
}

function OnTrackFunction(event) {
  peer_video.style.objectFit = "cover";
  peer_video.style.width = "100%";
  peer_video.style.height = "100%";
  peer_video.srcObject = event.streams[0];

  peer_video.onloadedmetadata = function (e) {
    peer_video.play();
  };

  stopwatch();
}

// FUNÇÕES DOS BOTÕES

// BOTÃO MICROFONE
mic_button.addEventListener("click", () => {
  mute_flag = !mute_flag;

  if (mute_flag) {
    userStream.getTracks()[0].enabled = false;
    mic_button.innerHTML = "";
    const icon_button = document.createElement("span");
    icon_button.className = "material-icons";
    icon_button.textContent = "mic_off";
    mic_button.appendChild(icon_button);
  }

  if (!mute_flag) {
    userStream.getTracks()[0].enabled = true;
    mic_button.innerHTML = "";
    const icon_button = document.createElement("span");
    icon_button.className = "material-icons";
    icon_button.textContent = "mic";
    mic_button.appendChild(icon_button);
  }
});

// BOTÃO DA CÂMERA
videocam_button.addEventListener("click", () => {
  videocamera_flag = !videocamera_flag;

  if (videocamera_flag) {
    userStream.getTracks()[1].enabled = false;
    videocam_button.innerHTML = "";
    const icon_button = document.createElement("span");
    icon_button.className = "material-icons";
    icon_button.textContent = "videocam_off";
    videocam_button.appendChild(icon_button);
  }

  if (!videocamera_flag) {
    userStream.getTracks()[1].enabled = true;
    videocam_button.innerHTML = "";
    const icon_button = document.createElement("span");
    icon_button.className = "material-icons";
    icon_button.textContent = "videocam";
    videocam_button.appendChild(icon_button);
  }
});

// BOTÃO DESLIGAR A CHAMADA

hangup_button.addEventListener("click", () => {
  socket.emit("leave", roomName);

  if (user_video.srcObject) {
    user_video.srcObject.getTracks()[0].stop();
    user_video.srcObject.getTracks()[1].stop();
  }

  if (peer_video.srcObject) {
    peer_video.srcObject.getTracks()[0].stop();
    peer_video.srcObject.getTracks()[1].stop();
  }

  if (rtcPeerConnection) {
    rtcPeerConnection.ontrack = null;
    rtcPeerConnection.onicecandidate = null;
    rtcPeerConnection.close();
    rtcPeerConnection = null;
  }

  container_incall.style.zIndex = "3";
});

socket.on("leave", (roomName) => {
  creator = true; // Agora a pessoa se torna a dona da sala pois só restou ela.
  if (rtcPeerConnection) {
    rtcPeerConnection.ontrack = null;
    rtcPeerConnection.onicecandidate = null;
    rtcPeerConnection.close();
    rtcPeerConnection = null;
  }

  if (peer_video.srcObject) {
    peer_video.srcObject.getTracks()[0].stop();
    peer_video.srcObject.getTracks()[1].stop();
  }
});

function stopwatch() {
  const display = document.querySelector("#stopwatch_incall");
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  setInterval(() => {
    seconds++;
    if (seconds === 60) {
      minutes++;
      seconds = 0;
    }
    if (minutes === 60) {
      hours++;
      minutes = 0;
    }
    timer = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    display.textContent = timer;
  }, 1000);
}
