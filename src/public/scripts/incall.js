const roomName = "test";
const user_video = document.getElementById("user_video");
const peer_video = document.getElementById("peer_video");
const join_button = document.getElementById("developer_button");
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
  socket.emit("join", roomName);
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
    // console.log(userStream.getTracks());
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
}
