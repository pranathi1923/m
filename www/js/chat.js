

"use strict"; // https://www.w3schools.com/js/js_strict.asp
const firebaseConfig = {
    apiKey: "AIzaSyCL2RZpwUJJ_Qw-xWc7VM878_pIrKzgkVM",
    authDomain: "teams-clone-bd331.firebaseapp.com",
    projectId: "teams-clone-bd331",
    databaseURL:"https://teams-clone-bd331-default-rtdb.firebaseio.com",
    storageBucket: "teams-clone-bd331.appspot.com",
    messagingSenderId: "668727795162",
    appId: "1:668727795162:web:b48e706667f3912dd674e3",
    measurementId: "G-QXRDEDV5YZ"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const firestore=firebase.firestore();

const welcomeImg = "../images/illustration-section-01.svg";
const shareUrlImg = "../images/illustration-section-01.svg";
const leaveRoomImg = "../images/illustration-section-01.svg";
const confirmImg = "../images/illustration-section-01.svg";
const fileSharingImg = "../images/illustration-section-01.svg";
const camOffImg = "../images/cam-off.png";
const audioOffImg = "../images/audio-off.png";
const kickedOutImg = "../images/kicked-out.png";
const aboutImg = "../images/about.png";
const peerLoockupUrl = "https://extreme-ip-lookup.com/json/";
const avatarApiUrl = "https://eu.ui-avatars.com/api";
const notifyBySound = false; // turn on - off sound notifications
const notifyAddPeer = "../audio/addPeer.mp3";
const notifyDownload = "../audio/download.mp3";
const notifyKickedOut = "../audio/kickedOut.mp3";
const notifyRemovePeer = "../audio/removePeer.mp3";
const notifyNewMessage = "../audio/newMessage.mp3";
const notifyChatMessage = "../audio/chatMessage.mp3";
const notifyRecStart = "../audio/recStart.mp3";
const notifyRecStop = "../audio/recStop.mp3";
const notifyRaiseHand = "../audio/raiseHand.mp3";
const notifyError = "../audio/error.mp3";
const fileSharingInput = "*"; // allow all file extensions
// "image/*,.mp3,.doc,.docs,.txt,.pdf,.xls,.xlsx,.csv,.pcap,.xml,.json,.md,.html,.js,.css,.php,.py,.sh,.zip,.rar,.tar"; // "*"

const isWebRTCSupported = DetectRTC.isWebRTCSupported;
const isMobileDevice = DetectRTC.isMobileDevice;
const myBrowserName = DetectRTC.browser.name;

// video cam - screen max frame rate
let videoMaxFrameRate = 30;
let screenMaxFrameRate = 30;

let leftChatAvatar;
let rightChatAvatar;


let mirotalkTheme = "neon"; // neon - dark - forest - ghost ...
let swalBackground = "rgba(0, 0, 0, 0.7)"; // black - #16171b - transparent ...
let signalingServerPort = 3000; // must be same of server PORT
let signalingServer = getServerUrl();
let roomId = getRoomId();
let peerInfo = getPeerInfo();
let peerGeo;
let peerConnection;
let myPeerName;


let isChatEmojiVisible = false;
let isButtonsVisible = false;


let signalingSocket; // socket.io connection to our webserver

let peerConnections = {}; // keep track of our peer connections, indexed by peer_id == socket.io id
let chatDataChannels = {}; // keep track of our peer chat data channels

let chatMessages = []; // collect chat messages to save it later if want
let iceServers = [{ urls: "stun:stun.l.google.com:19302" }]; // backup iceServers

let chatInputEmoji = {
  "<3": "\u2764\uFE0F",
  "</3": "\uD83D\uDC94",
  ":D": "\uD83D\uDE00",
  ":)": "\uD83D\uDE03",
  ";)": "\uD83D\uDE09",
  ":(": "\uD83D\uDE12",
  ":p": "\uD83D\uDE1B",
  ";p": "\uD83D\uDE1C",
  ":'(": "\uD83D\uDE22",
  ":+1:": "\uD83D\uDC4D",
}; // https://github.com/wooorm/gemoji/blob/main/support.md


// left buttons
let leftButtons;



let shareRoomBtn;
let callRoomBtn;
let leaveRoomBtn;
// chat room elements
let msgerDraggable;
let msgerHeader;
//let msgerTheme;

let msgerClean;
let msgerSaveBtn;

let msgerChat;
let msgerEmojiBtn;
let msgerInput;
let msgerSendBtn;

// chat room emoji picker
let msgerEmojiPicker;
let msgerEmojiHeader;
let msgerCloseEmojiBtn;
let emojiPicker;
// my settings






/**
 * Load all Html elements by Id
 */
function getHtmlElementsById() {
 
  // left buttons
   shareRoomBtn = getId("shareRoomBtn");
    callRoomBtn = getId("callRoomBtn");
  leftButtons = getId("leftButtons");
  
  
  
  leaveRoomBtn = getId("leaveRoomBtn");
  // chat Room elements
  msgerDraggable = getId("msgerDraggable");
  msgerHeader = getId("msgerHeader");
 
 
  msgerClean = getId("msgerClean");
  msgerSaveBtn = getId("msgerSaveBtn");
  
  msgerChat = getId("msgerChat");
  msgerEmojiBtn = getId("msgerEmojiBtn");
  msgerInput = getId("msgerInput");
  msgerSendBtn = getId("msgerSendBtn");
  
  // chat room emoji picker
  msgerEmojiPicker = getId("msgerEmojiPicker");
  msgerEmojiHeader = getId("msgerEmojiHeader");
  msgerCloseEmojiBtn = getId("msgerCloseEmojiBtn");
  emojiPicker = getSl("emoji-picker");
  
  
}

/**
 * Using tippy aka very nice tooltip!
 * https://atomiks.github.io/tippyjs/
 */
function setButtonsTitle() {
  // not need for mobile
  if (isMobileDevice) return;

  // left buttons
 tippy(shareRoomBtn, {
    content: "Invite people to join",
    placement: "right-start",
  });
 tippy(callRoomBtn, {
    content: "join call",
    placement: "right-start",
  });
  
  
  tippy(leaveRoomBtn, {
    content: "Leave this room",
    placement: "right-start",
  });

  // chat room buttons
  
  tippy(msgerClean, {
    content: "Clean messages",
  });
  tippy(msgerSaveBtn, {
    content: "Save messages",
  });
  
  tippy(msgerEmojiBtn, {
    content: "Emoji",
  });
  tippy(msgerSendBtn, {
    content: "Send",
  });

  // emoji picker
  tippy(msgerCloseEmojiBtn, {
    content: "Close emoji",
  });

  // settings
 

  // whiteboard btns
  
  // room actions btn
  
}

/**
 * Get peer info using DetecRTC
 * https://github.com/muaz-khan/DetectRTC
 * @return Json peer info
 */
function getPeerInfo() {
  return {
    detectRTCversion: DetectRTC.version,
    isWebRTCSupported: DetectRTC.isWebRTCSupported,
    isMobileDevice: DetectRTC.isMobileDevice,
    osName: DetectRTC.osName,
    osVersion: DetectRTC.osVersion,
    browserName: DetectRTC.browser.name,
    browserVersion: DetectRTC.browser.version,
  };
}

/**
 * Get approximative peer geolocation
 * @return json
 */
function getPeerGeoLocation() {
  fetch(peerLoockupUrl)
    .then((res) => res.json())
    .then((outJson) => {
      peerGeo = outJson;
    })
    .catch((err) => console.error(err));
}

/**
 * Get Signaling server url
 * @return Signaling server Url
 */
function getServerUrl() {
  return (
    "http" +
    (location.hostname == "localhost" ? "" : "s") +
    "://" +
    location.hostname +
    (location.hostname == "localhost" ? ":" + signalingServerPort : "")
  );
}

/**
 * Generate random Room id
 * @return Room Id
 */
function getRoomId() {
  // skip /join/
  let roomId = location.pathname.substring(6);
  // if not specified room id, create one random
  if (roomId == "") {
    roomId = makeId(12);
    const newurl = signalingServer + "/join/" + roomId;
    window.history.pushState({ url: newurl }, roomId, newurl);
  }
  return roomId;
}

/**
 * Generate random Id
 * @param {*} length
 * @returns random id
 */
function makeId(length) {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Check if there is peer connections
 * @return true, false otherwise
 */
function thereIsPeerConnections() {
  if (Object.keys(peerConnections).length === 0) {
    return false;
  }
  return true;
}

/**
 * On body load Get started
 */
function initPeer() {
 
  if (!isWebRTCSupported) {
    userLog("error", "This browser seems not supported WebRTC!");
    return;
  }

  console.log("Connecting to signaling server");
  signalingSocket = io(signalingServer);

  signalingSocket.on("connect", handleConnect);
  signalingSocket.on("addPeer", handleAddPeer);
  signalingSocket.on("sessionDescription", handleSessionDescription);
  signalingSocket.on("iceCandidate", handleIceCandidate);

  signalingSocket.on("disconnect", handleDisconnect);
  
} // end [initPeer]

/**
 * Connected to Signaling Server.
 * Once the user has given us access to their
 * microphone/camcorder, join the channel
 * and start peering up
 */

function handleConnect() {
  getId("loadingDiv").style.display = "none";
  console.log("Connected to signaling server");
  getPeerGeoLocation();
  getHtmlElementsById();
  setButtonsTitle();
  manageLeftButtons();
  handleBodyOnMouseMove();
  
      whoAreYou();

}

/**
 * set your name for the conference
 */
function whoAreYou() {
  playSound("newMessage");

  Swal.fire({
    allowOutsideClick: false,
    background: swalBackground,
    position: "center",
    imageAlt: "mirotalk-name",
   // imageUrl: welcomeImg,
    title: "Enter your name",
    width:400,
    input: "text",
    
    confirmButtonText: `Join meeting`,
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
    inputValidator: (value) => {
      if (!value) {
        return "Please enter your name";
      }
      myPeerName = value;
      
      setPeerChatAvatarImgName("right", myPeerName);
      joinToChannel();
    },
  }).then(() => {
    welcomeUser();
  });

  // not need for mobile
  if (isMobileDevice) return;

  
}

/**
 * join to chennel and send some peer info
 */
function joinToChannel() {
  console.log("join to channel", roomId);
  signalingSocket.emit("join", {
    channel: roomId,
    peerInfo: peerInfo,
    peerGeo: peerGeo,
    peerName: myPeerName,
    
  });
}

/**
 * welcome message
 */
function welcomeUser() {
  getmessages();
  const myRoomUrl = window.location.href;
  playSound("newMessage");
  Swal.fire({
    background: swalBackground,
    width:400,
    position: "center",
    title: "<strong>Welcome " + myPeerName + "</strong>",
    imageAlt: "mirotalk-welcome",
  
    html:
      `
      <br/> 
      <p style="color:white;">Share this meeting invite others to join.</p>
      <p style="color:rgb(8, 189, 89);">` +
      myRoomUrl +
      `</p>`,
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: `Copy meeting URL`,
    denyButtonText: `Email invite`,
    cancelButtonText: `Close`,
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      copyRoomURL();
    } else if (result.isDenied) {
      let message = {
        email: "",
        subject: "Please join our MiroTalk Video Chat Meeting",
        body: "Click to join: " + myRoomUrl,
      };
      shareRoomByEmail(message);
    }
  });
}
function getmessages()
{
  firestore.collection('messages').doc(`${roomId}`).collection(`${roomId}`).orderBy('time', 'asc').get()
  .then(function(snapshot) {
    snapshot.forEach(function(doc) {
      if(myPeerName === doc.data().name){
        appendMessage(myPeerName, rightChatAvatar, "right", doc.data().msg, doc.data().privateMsg);
      }
      else{
        setPeerChatAvatarImgName("left", doc.data().name);
        appendMessage(doc.data().name, leftChatAvatar, "left", doc.data().msg, doc.data().privateMsg);
      }
    });
  });

}
/**
 * When we join a group, our signaling server will send out 'addPeer' events to each pair
 * of users in the group (creating a fully-connected graph of users, ie if there are 6 people
 * in the channel you will connect directly to the other 5, so there will be a total of 15
 * connections in the network).
 *
 * @param {*} config
 */
function handleAddPeer(config) {
  // console.log("addPeer", JSON.stringify(config));
  let peer_id = config.peer_id;
  let peers = config.peers;

  if (peer_id in peerConnections) {
    // This could happen if the user joins multiple channels where the other peer is also in.
    console.log("Already connected to peer", peer_id);
    return;
  }

  if (config.iceServers) iceServers = config.iceServers;
  console.log("iceServers", iceServers[0]);

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection
  peerConnection = new RTCPeerConnection({ iceServers: iceServers });
  peerConnections[peer_id] = peerConnection;

 
  handleOnIceCandidate(peer_id);
  handleRTCDataChannel(peer_id);

  if (config.should_create_offer) {
    handleRtcOffer(peer_id);
  }
  playSound("addPeer");
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onicecandidate
 *
 * @param {*} peer_id
 */
function handleOnIceCandidate(peer_id) {
  peerConnections[peer_id].onicecandidate = (event) => {
    if (event.candidate) {
      signalingSocket.emit("relayICE", {
        peer_id: peer_id,
        ice_candidate: {
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          candidate: event.candidate.candidate,
          address: event.candidate.address,
        },
      });
    }
  };
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack
 *
 * @param {*} peer_id
 * @param {*} peers
 */

/**
 * Secure RTC Data Channel
 * https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel
 * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createDataChannel
 * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ondatachannel
 * https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel/onmessage
 *
 * @param {*} peer_id
 */
function handleRTCDataChannel(peer_id) {
  peerConnections[peer_id].ondatachannel = (event) => {
    console.log("Datachannel event " + peer_id, event);
    event.channel.onmessage = (msg) => {
      switch (event.channel.label) {
        case "mirotalk_chat_channel":
          let dataMessage = {};
          try {
            dataMessage = JSON.parse(msg.data);
            handleDataChannelChat(dataMessage);
          } catch (err) {
            console.log(err);
          }
          break;
        
      }
    };
  };
  createChatDataChannel(peer_id);
 
}

function handleRtcOffer(peer_id) {
  console.log("Creating RTC offer to", peer_id);
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer
  peerConnections[peer_id]
    .createOffer()
    .then((local_description) => {
      console.log("Local offer description is", local_description);
      // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription
      peerConnections[peer_id]
        .setLocalDescription(local_description)
        .then(() => {
          signalingSocket.emit("relaySDP", {
            peer_id: peer_id,
            session_description: local_description,
          });
          console.log("Offer setLocalDescription done!");
        })
        .catch((err) => {
          console.error("[Error] offer setLocalDescription", err);
          userLog("error", "Offer setLocalDescription failed " + err);
        });
    })
    .catch((err) => {
      console.error("[Error] sending offer", err);
    });
}

/**
 * Peers exchange session descriptions which contains information
 * about their audio / video settings and that sort of stuff. First
 * the 'offerer' sends a description to the 'answerer' (with type "offer"),
 * then the answerer sends one back (with type "answer").
 *
 * @param {*} config
 */
function handleSessionDescription(config) {
  console.log("Remote Session Description", config);

  let peer_id = config.peer_id;
  let remote_description = config.session_description;

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCSessionDescription
  let description = new RTCSessionDescription(remote_description);

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setRemoteDescription
  peerConnections[peer_id]
    .setRemoteDescription(description)
    .then(() => {
      console.log("setRemoteDescription done!");
      if (remote_description.type == "offer") {
        console.log("Creating answer");
        // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
        peerConnections[peer_id]
          .createAnswer()
          .then((local_description) => {
            console.log("Answer description is: ", local_description);
            // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription
            peerConnections[peer_id]
              .setLocalDescription(local_description)
              .then(() => {
                signalingSocket.emit("relaySDP", {
                  peer_id: peer_id,
                  session_description: local_description,
                });
                console.log("Answer setLocalDescription done!");
              })
              .catch((err) => {
                console.error("[Error] answer setLocalDescription", err);
                userLog("error", "Answer setLocalDescription failed " + err);
              });
          })
          .catch((err) => {
            console.error("[Error] creating answer", err);
          });
      } // end [if type offer]
    })
    .catch((err) => {
      console.error("[Error] setRemoteDescription", err);
    });
}

/**
 * The offerer will send a number of ICE Candidate blobs to the answerer so they
 * can begin trying to find the best path to one another on the net.
 *
 * @param {*} config
 */
function handleIceCandidate(config) {
  let peer_id = config.peer_id;
  let ice_candidate = config.ice_candidate;
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate
  peerConnections[peer_id]
    .addIceCandidate(new RTCIceCandidate(ice_candidate))
    .catch((err) => {
      console.error("[Error] addIceCandidate", err);
      userLog("error", "addIceCandidate failed " + err);
    });
}

/**
 * Disconnected from Signaling Server
 * Tear down all of our peer connections
 * and remove all the media divs when we disconnect from signaling server
 */
function handleDisconnect() {
  console.log("Disconnected from signaling server");
  for (let peer_id in peerMediaElements) {
    document.body.removeChild(peerMediaElements[peer_id].parentNode);
    resizeVideos();
  }
  for (let peer_id in peerConnections) {
    peerConnections[peer_id].close();
    
  }
  chatDataChannels = {};
  fileDataChannels = {};
  peerConnections = {};
  peerMediaElements = {};
}




function setPeerChatAvatarImgName(avatar, peerName) {
  let avatarImg =
    avatarApiUrl +
    "?name=" +
    peerName +
    "&size=32" +
    "&background=random&rounded=true";

  switch (avatar) {
    case "left":
      // console.log("Set Friend chat avatar image");
      leftChatAvatar = avatarImg;
      break;
    case "right":
      // console.log("Set My chat avatar image");
      rightChatAvatar = avatarImg;
      break;
  }
}


function manageLeftButtons() {
 setShareRoomBtn();
 setCallRoomBtn();
  setChatRoomBtn();
  showChatRoomDraggable();
  setChatEmojiBtn();
  setLeaveRoomBtn();
  showLeftButtonsAndMenu();
}



function setShareRoomBtn() {
  shareRoomBtn.addEventListener("click", async (e) => {
    shareRoomUrl();
  });
}
function setCallRoomBtn() {
  callRoomBtn.addEventListener("click", async (e) => {
     window.location.href=signalingServer+'/join/'+roomId;

  });
}

function setChatRoomBtn() {
  // adapt chat room for mobile
  setChatRoomForMobile();

  // open hide chat room
  


  
  // clean chat messages
  msgerClean.addEventListener("click", (e) => {
    cleanMessages();
  });

  // save chat messages to file
  msgerSaveBtn.addEventListener("click", (e) => {
    if (chatMessages.length != 0) {
      downloadChatMsgs();
      return;
    }
    userLog("info", "No chat messages to save");
  });

  
  // Execute a function when the user releases a key on the keyboard
  msgerInput.addEventListener("keyup", (e) => {
    // Number 13 is the "Enter" key on the keyboard
    if (e.keyCode === 13) {
      e.preventDefault();
      msgerSendBtn.click();
    }
  });

  // on input check 4emoji from map
  msgerInput.oninput = function () {
    for (let i in chatInputEmoji) {
      let regex = new RegExp(escapeSpecialChars(i), "gim");
      this.value = this.value.replace(regex, chatInputEmoji[i]);
    }
  };

  // chat send msg
  msgerSendBtn.addEventListener("click", (e) => {
    // prevent refresh page
    e.preventDefault();

    if (!thereIsPeerConnections()) {
      userLog("info", "Can't send message, no peer connection detected");
      msgerInput.value = "";
      return;
    }

    const msg = msgerInput.value;
    // empity msg
    if (!msg) return;

    emitMsg(myPeerName, "toAll", msg, false, "");
    appendMessage(myPeerName, rightChatAvatar, "right", msg, false);
    msgerInput.value = "";
  });
}

/**
 * Emoji picker chat room button click event
 */
function setChatEmojiBtn() {
  if (isMobileDevice) {
    // mobile already have it
    msgerEmojiBtn.style.display = "none";
  } else {
    // make emoji picker draggable for desktop
    dragElement(msgerEmojiPicker, msgerEmojiHeader);

    msgerEmojiBtn.addEventListener("click", (e) => {
      // prevent refresh page
      e.preventDefault();
      hideShowEmojiPicker();
    });

    msgerCloseEmojiBtn.addEventListener("click", (e) => {
      // prevent refresh page
      e.preventDefault();
      hideShowEmojiPicker();
    });

    emojiPicker.addEventListener("emoji-click", (e) => {
      //console.log(e.detail);
      //console.log(e.detail.emoji.unicode);
      msgerInput.value += e.detail.emoji.unicode;
    });
  }
}


/**
 * Leave room button click event
 */
function setLeaveRoomBtn() {
  leaveRoomBtn.addEventListener("click", (e) => {
    leaveRoom();
  });
}

/**
 * Handle left buttons - status menù show - hide on body mouse move
 */
function handleBodyOnMouseMove() {
  document.body.addEventListener("mousemove", (e) => {
    showLeftButtonsAndMenu();
  });
}







function showLeftButtonsAndMenu() {
  
  toggleClassElements("statusMenu", "inline");
  leftButtons.style.display = "flex";
  isButtonsVisible = true;
  
}

/**
 * Copy room url to clipboard and share it with navigator share if supported
 * https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
 */
async function shareRoomUrl() {
  const myRoomUrl = window.location.href;

  // navigator share
  let isSupportedNavigatorShare = false;
  let errorNavigatorShare = false;
  // if supported
  if (navigator.share) {
    isSupportedNavigatorShare = true;
    try {
      // not add title and description to load metadata from url
      await navigator.share({ url: myRoomUrl });
      userLog("toast", "Room Shared successfully!");
    } catch (err) {
      errorNavigatorShare = true;
      /*  This feature is available only in secure contexts (HTTPS),
          in some or all supporting browsers and mobile devices
          console.error("navigator.share", err); 
      */
    }
  }

  // something wrong or not supported navigator.share
  if (
    !isSupportedNavigatorShare ||
    (isSupportedNavigatorShare && errorNavigatorShare)
  ) {
    playSound("newMessage");
    Swal.fire({
      width:400,
      background: swalBackground,
      position: "center",
      title: "Share the Room",
      imageAlt: "mirotalk-share",
      //imageUrl: shareUrlImg,
      html:
        `
      <br/>
      <div id="qrRoomContainer">
        <canvas id="qrRoom"></canvas>
      </div>
      <br/><br/>
      <p style="color:white;"> Share this meeting invite others to join.</p>
      <p style="color:rgb(8, 189, 89);">` +
        myRoomUrl +
        `</p>`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: `Copy meeting URL`,
      denyButtonText: `Email invite`,
      cancelButtonText: `Close`,
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        copyRoomURL();
      } else if (result.isDenied) {
        let message = {
          email: "",
          subject: "Please join our MiroTalk Video Chat Meeting",
          body: "Click to join: " + myRoomUrl,
        };
        shareRoomByEmail(message);
      }
    });
    makeRoomQR();
  }
}

/**
 * Make Room QR
 * https://github.com/neocotic/qrious
 */
function makeRoomQR() {
  let qr = new QRious({
    element: getId("qrRoom"),
    value: window.location.href,
  });
  qr.set({
    size: 128,
  });
}

/**
 * Copy Room URL to clipboard
 */
function copyRoomURL() {
  // save Room Url to clipboard
  let roomURL = window.location.href;
  let tmpInput = document.createElement("input");
  document.body.appendChild(tmpInput);
  tmpInput.value = roomURL;
  tmpInput.select();
  // for mobile devices
  tmpInput.setSelectionRange(0, 99999);
  document.execCommand("copy");
  console.log("Copied to clipboard Join Link ", roomURL);
  document.body.removeChild(tmpInput);
  userLog("toast", "Meeting URL is copied to clipboard 👍");
}

/**
 * Share room id by email
 * @param {*} message email | subject | body
 */
function shareRoomByEmail(message) {
  let email = message.email;
  let subject = message.subject;
  let emailBody = message.body;
  document.location =
    "mailto:" + email + "?subject=" + subject + "&body=" + emailBody;
}


 

function createChatDataChannel(peer_id) {
  chatDataChannels[peer_id] = peerConnections[peer_id].createDataChannel(
    "mirotalk_chat_channel"
  );
  chatDataChannels[peer_id].addEventListener("open", onChatChannelStateChange);
  chatDataChannels[peer_id].addEventListener("close", onChatChannelStateChange);
  chatDataChannels[peer_id].addEventListener("error", onChatError);
}

/**
 * Handle Chat Room channel state
 * @param {*} event
 */
function onChatChannelStateChange(event) {
  console.log("onChatChannelStateChange", event.type);
}

/**
 * Something wrong on Chat Data Channel
 * @param {*} event
 */
function onChatError(event) {
  const errMessage = event.error.message;
  // Transport channel closed ignore it...
  if (errMessage.includes("closed")) return;
  console.error("onChatError", event);
  userLog("error", "Chat data channel error: " + errMessage);
}

/**
 * Set the chat room on full screen mode for mobile
 */
function setChatRoomForMobile() {
  if (isMobileDevice) {
    document.documentElement.style.setProperty("--msger-height", "99%");
    document.documentElement.style.setProperty("--msger-width", "99%");
  } else {
    // make chat room draggable for desktop
    dragElement(msgerDraggable, msgerHeader);
  }
}

/**
 * Show msger draggable on center screen position
 */
function showChatRoomDraggable() {
  playSound("newMessage");
  if (isMobileDevice) {
    leftButtons.style.display = "none";
    isButtonsVisible = false;
  }
  
  msgerDraggable.style.top = "50%";
  msgerDraggable.style.left = "50%";
  msgerDraggable.style.display = "flex";
 
  // only for desktop
  
}

/**
 * Clean chat messages
 * https://sweetalert2.github.io
 */
function cleanMessages() {
  Swal.fire({
    width:400,
    background: swalBackground,
    position: "center",
    title: "Clean up chat Messages?",
    icon: "warning",
    showDenyButton: true,
    confirmButtonText: `Yes`,
    denyButtonText: `No`,
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
  }).then((result) => {
    // clean chat messages
    if (result.isConfirmed) {
      let msgs = msgerChat.firstChild;
      while (msgs) {
        msgerChat.removeChild(msgs);
        msgs = msgerChat.firstChild;
      }
      // clean object
      chatMessages = [];
    }
  });
}

/**
 * Hide chat room and emoji picker
 */


/**
 * handle Incoming Data Channel Chat Messages
 * @param {*} dataMessages
 */
function handleDataChannelChat(dataMessages) {
  switch (dataMessages.type) {
    case "chat":
      // private message but not for me return
      if (dataMessages.privateMsg && dataMessages.toName != myPeerName) return;
      // log incoming dataMessages json
      console.log("handleDataChannelChat", dataMessages);
      // chat message for me also
      
      playSound("chatMessage");
      setPeerChatAvatarImgName("left", dataMessages.name);
      appendMessage(
        dataMessages.name,
        leftChatAvatar,
        "left",
        dataMessages.msg,
        dataMessages.privateMsg
      );
      break;
    // .........
    default:
      break;
  }
}

/**
 * Escape Special Chars
 * @param {*} regex
 */
function escapeSpecialChars(regex) {
  return regex.replace(/([()[{*+.$^\\|?])/g, "\\$1");
}

/**
 * Append Message to msger chat room
 * @param {*} name
 * @param {*} img
 * @param {*} side
 * @param {*} text
 * @param {*} privateMsg
 */
function appendMessage(name, img, side, text, privateMsg) {
  let time = getFormatDate(new Date());
  // collect chat msges to save it later
  chatMessages.push({
    time: time,
    name: name,
    text: text,
    private_msg: privateMsg,
  });

  // check if i receive a private message
  let msgBubble = privateMsg ? "private-msg-bubble" : "msg-bubble";

  // console.log("chatMessages", chatMessages);
  let ctext = detectUrl(text);
  const msgHTML = `
	<div class="msg ${side}-msg">
		<div class="msg-img" style="background-image: url('${img}')"></div>
		<div class=${msgBubble}>
      <div class="msg-info">
        <div class="msg-info-name">${name}</div>
        <div class="msg-info-time">${time}</div>
      </div>
      <div class="msg-text">${ctext}</div>
    </div>
	</div>
  `;
  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
}






/**
 * Detect url from text and make it clickable
 * Detect also if url is a img to create preview of it
 * @param {*} text
 * @returns html
 */
function detectUrl(text) {
  let urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    if (isImageURL(text)) {
      return (
        '<p><img src="' + url + '" alt="img" width="200" height="auto"/></p>'
      );
    }
    return (
      '<a id="chat-msg-a" href="' + url + '" target="_blank">' + url + "</a>"
    );
  });
}

/**
 * Check if url passed is a image
 * @param {*} url
 * @returns true/false
 */
function isImageURL(url) {
  return url.match(/\.(jpeg|jpg|gif|png|tiff|bmp)$/) != null;
}

/**
 * Format data h:m:s
 * @param {*} date
 */
function getFormatDate(date) {
  const time = date.toTimeString().split(" ")[0];
  return `${time}`;
}

/**
 * Send message over Secure dataChannels
 * otherwise over signaling server
 * @param {*} name
 * @param {*} toName
 * @param {*} msg
 * @param {*} privateMsg private message true/false
 * @param {*} peer_id to sent private message
 */
function emitMsg(name, toName, msg, privateMsg, peer_id) {
  if (msg) {
    const chatMessage = {
      type: "chat",
      name: name,
      toName: toName,
      msg: msg,
      privateMsg: privateMsg,
    };
    // peer to peer over DataChannels
    Object.keys(chatDataChannels).map((peerId) =>
      chatDataChannels[peerId].send(JSON.stringify(chatMessage))
    );
    console.log("Send msg", chatMessage);
    let time=Date.now();
    const messages = firestore.collection('messages').doc(`${roomId}`).collection(`${roomId}`).doc(`${time}`);
    const snapshot = messages.get();
    if (!snapshot.exists) {
      try {
        messages.set({ name, toName, msg, privateMsg, time });
      } catch (err) {
        console.log(err);
      }
    }
  }
}

/**
 * Hide - Show emoji picker div
 */
function hideShowEmojiPicker() {
  if (!isChatEmojiVisible) {
    playSound("newMessage");
    msgerEmojiPicker.style.display = "block";
    isChatEmojiVisible = true;
    return;
  }
  msgerEmojiPicker.style.display = "none";
  isChatEmojiVisible = false;
}

/**
 * Download Chat messages in json format
 * https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
 */
function downloadChatMsgs() {
  let a = document.createElement("a");
  a.href =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(chatMessages, null, 1));
  a.download = getDataTimeString() + "-CHAT.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}



/**
 * Update myPeerName to other peers in the room
 */






function leaveRoom() {
  playSound("newMessage");

  Swal.fire({
    width:400,
    background: swalBackground,
    position: "center",
    imageAlt: "mirotalk-leave",
   // imageUrl: leaveRoomImg,
    title: "Leave this room?",
    showDenyButton: true,
    confirmButtonText: `Yes`,
    denyButtonText: `No`,
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/";
    }
  });
}

/**
 * Make Obj draggable
 * https://www.w3schools.com/howto/howto_js_draggable.asp
 * @param {*} elmnt
 * @param {*} dragObj
 */
function dragElement(elmnt, dragObj) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (dragObj) {
    // if present, the header is where you move the DIV from:
    dragObj.onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }
  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

/**
 * Data Formated DD-MM-YYYY-H_M_S
 * https://convertio.co/it/
 * @returns data string
 */
function getDataTimeString() {
  const d = new Date();
  const date = d.toISOString().split("T")[0];
  const time = d.toTimeString().split(" ")[0];
  return `${date}-${time}`;
}

/**
 * Convert bytes to KB-MB-GB-TB
 * @param {*} bytes
 * @returns size
 */
function bytesToSize(bytes) {
  let sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

/**
 * Basic user logging
 * https://sweetalert2.github.io
 * @param {*} type
 * @param {*} message
 */
function userLog(type, message) {
  switch (type) {
    case "error":
      Swal.fire({
        width:400,
        background: swalBackground,
        position: "center",
        icon: "error",
        title: "Oops...",
        text: message,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
      playSound("error");
      break;
    case "info":
      Swal.fire({
        width:400,
        background: swalBackground,
        position: "center",
        icon: "info",
        title: "Info",
        text: message,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
      break;
    case "success":
      Swal.fire({
        width:400,
        background: swalBackground,
        position: "center",
        icon: "success",
        title: "Success",
        text: message,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
      break;
    case "success-html":
      Swal.fire({
        width:400,
        background: swalBackground,
        position: "center",
        icon: "success",
        title: "Success",
        html: message,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
      break;
    case "toast":
      const Toast = Swal.mixin({
        background: swalBackground,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      Toast.fire({
        icon: "info",
        title: message,
      });
      break;
    // ......
    default:
      alert(message);
  }
}

/**
 * Sound notifications
 * https://notificationsounds.com/notification-sounds
 * @param {*} state
 */
async function playSound(state) {
  if (!notifyBySound) return;

  let file_audio = "";
  switch (state) {
    case "addPeer":
      file_audio = notifyAddPeer;
      break;
    case "download":
      file_audio = notifyDownload;
      break;
    case "kickedOut":
      file_audio = notifyKickedOut;
      break;
    case "removePeer":
      file_audio = notifyRemovePeer;
      break;
    case "newMessage":
      file_audio = notifyNewMessage;
      break;
    case "chatMessage":
      file_audio = notifyChatMessage;
      break;
    case "recStart":
      file_audio = notifyRecStart;
      break;
    case "recStop":
      file_audio = notifyRecStop;
      break;
    case "rHand":
      file_audio = notifyRaiseHand;
      break;
    case "error":
      file_audio = notifyError;
      break;
    // ...
    default:
      console.log("no file audio");
  }
  if (file_audio != "") {
    let audioToPlay = new Audio(file_audio);
    try {
      await audioToPlay.play();
    } catch (err) {
      // console.error("Cannot play sound", err);
      // Automatic playback failed. (safari)
      return;
    }
  }
}

/**
 * Show-Hide all elements grp by class name
 * @param {*} className
 * @param {*} displayState
 */
function toggleClassElements(className, displayState) {
  let elements = getEcN(className);
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.display = displayState;
  }
}

/**
 * Get Html element by Id
 * @param {*} id
 */
function getId(id) {
  return document.getElementById(id);
}

/**
 * Get Html element by selector
 * @param {*} selector
 */
function getSl(selector) {
  return document.querySelector(selector);
}

/**
 * Get Html element by class name
 * @param {*} className
 */
function getEcN(className) {
  return document.getElementsByClassName(className);
}
