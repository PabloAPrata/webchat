let roomName = "test";
const user_video = document.getElementById("user_video");
const peer_video = document.getElementById("peer_video");
const join_button = document.getElementById("developer_button");
const mic_button = document.getElementById("mic_button");
const videocam_button = document.getElementById("videocam_button");
const hangup_button = document.getElementById("hangup_button");
const container_incall = document.getElementById("container_incall");

window.current_call = {
  type: null,
  duration: null,
  number: null,
  video: null,
  date: null,
  roomName: null,
};

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

function join_video_room(id_room) {
  console.log("join_video_room");
  if (!id_room) {
    alert("Please enter a room name");
    return;
  }

  openVideoApp();

  roomName = id_room;
  socket.emit("join", roomName);
  container_incall.style.zIndex = "5";
}

function join_audio_room(id_room) {
  console.log("join_audio_room");
  if (!id_room) {
    alert("Please enter a room name");
    return;
  }

  openVideoApp();

  roomName = id_room;
  socket.emit("join", roomName);
  container_incall.style.zIndex = "5";

  videocamera_flag = false;
  muteVideo();
}

function join_call_event(number, type, room) {
  console.log("Join call event");
  if (!room) {
    alert("Please enter a room name");
    return;
  }

  const name = get_name_user_by_number(number);
  const contact_name_incall = document.getElementById("contact_name_incall");
  contact_name_incall.textContent = name;
  peer_video.setAttribute("metadata", number);

  roomName = room;
  socket.emit("join", roomName);
  container_incall.style.zIndex = "5";

  if (type === "audio") {
    videocamera_flag = true;
    muteVideo();
  }
}

async function getCameraAccess() {
  return navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .catch((error) => {
      alert("Não foi possível acessar a câmera. Erro: " + error.message);
      return Promise.reject(error);
    });
}

socket.on("created", () => {
  creator = true;
  //-------------------------------------------------------------------

  getCameraAccess()
    .then((stream) => {
      userStream = stream;
      user_video.style.width = "100%";
      user_video.style.height = "100%";
      user_video.srcObject = stream;
      user_video.onloadedmetadata = function (e) {
        user_video.play();
      };
    })
    .catch((error) => {
      // trate o erro aqui, se necessário
      alert(error);
    });
});

socket.on("joined", () => {
  creator = false;

  getCameraAccess()
    .then((stream) => {
      userStream = stream;
      user_video.style.width = "100%";
      user_video.style.height = "100%";
      user_video.srcObject = stream;
      user_video.onloadedmetadata = function (e) {
        user_video.play();
      };
      socket.emit("ready", roomName);
    })
    .catch((error) => {
      // trate o erro aqui, se necessário
      alert(error);
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

socket.on("video", (data) => {
  if (data.type === "mute") {
    const video = document.querySelectorAll("[metadata]");
    video.forEach((e) => {
      const number = e.getAttribute("metadata");

      if (data.from === number) {
        e.style.display = "none";
      }
    });
  }

  if (data.type === "unmute") {
    const video = document.querySelectorAll("[metadata]");
    video.forEach((e) => {
      const number = e.getAttribute("metadata");

      if (data.from === number) {
        e.style.display = "block";
      }
    });
  }
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
    muteVideo();
  }

  if (!videocamera_flag) {
    enableVideo();
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

  videocamera_flag = false;
  userStream = undefined;
});

socket.on("leave", (roomName) => {
  console.log("leave", roomName);
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

  let interval = setInterval(() => {
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
    window.current_call.time = timer;
  }, 1000);

  hangup_button.addEventListener("click", () => {
    display.innerHTML = "00:00:00";
    clearInterval(interval);
  });
}

function muteVideo() {
  if (!userStream) {
    setTimeout(muteVideo, 100);
  } else {
    userStream.getTracks()[1].enabled = false;

    videocam_button.innerHTML = "";
    const icon_button = document.createElement("span");
    icon_button.className = "material-icons";
    icon_button.textContent = "videocam_off";
    videocam_button.appendChild(icon_button);
    user_video.style.display = "none";
    console.log(roomName);
    const data = {
      roomName: roomName,
      type: "mute",
      from: window.account_info.number,
    };
    socket.emit("video", data);
  }
}

function enableVideo() {
  userStream.getTracks()[1].enabled = true;

  videocam_button.innerHTML = "";
  const icon_button = document.createElement("span");
  icon_button.className = "material-icons";
  icon_button.textContent = "videocam";
  videocam_button.appendChild(icon_button);
  user_video.style.display = "block";
  const data = {
    roomName: roomName,
    type: "unmute",
    from: window.account_info.number,
  };
  socket.emit("video", data);
}
