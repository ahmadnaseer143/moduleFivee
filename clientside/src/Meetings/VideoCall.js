import Button from "@material-ui/core/Button";
import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
import Peer from "simple-peer";
// import io from "socket.io-client";
import "./videocall.css";
import { Link, useNavigate } from "react-router-dom";
import VideoCallControls from "./VideoCallControls";
import ChatOnline from "../Chat/ChatOnline";
import io from "socket.io-client";
import VideoCallModal from "./VideoCallModal";
const socket = io.connect("http://localhost:8900");
const VideoCall = ({ onlineUsers, setOnlineUsers }) => {
  const navigate = useNavigate();
  const [me, setMe] = useState("");
  const [idToCall, setIdToCall] = useState();
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [userStream, setUserStream] = useState();

  const [receivingCall, setReceivingCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [caller, setCaller] = useState("");
  const [both, setBoth] = useState();
  const [callerSignal, setCallerSignal] = useState();
  const [stream, setStream] = useState();

  const connectionRef = useRef();
  const userVideo = useRef();
  const myVideo = useRef();
  // allows to disconnect the call

  const [user, setUser] = useState();
  const [friend, setFriend] = useState();

  const [isOpenVideoModal, setIsOpenVideoModal] = useState(false);

  const handleClose = () => setIsOpenVideoModal(false);
  const handleShow = () => setIsOpenVideoModal(true);

  const callUser = (user) => {
    setFriend(user);
    handleShow();
    // console.log(id);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: user._id,
        signalData: data,
        from: JSON.parse(localStorage.getItem("user"))._id,
        name: name,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
      setUserStream(stream);
    });
    socket.on("callAccepted", (signal, name) => {
      setCallAccepted(true);
      setCallerName(name);
      peer.signal(signal);
      handleClose();
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      // console.log("Signal");
      // console.log(data);
      socket.emit("answerCall", {
        signal: data,
        to: caller,
        name: user.username,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const rejectCall = () => {
    // receivingCall && !callAccepted ?
    setReceivingCall(false);
    setCallAccepted(false);
    let otherId = "";
    if (!caller) {
      otherId = both.find((usr) => usr != user._id);
      socket.emit("rejectCall", otherId, user._id, name);
    } else socket.emit("rejectCall", caller, user._id, name);
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
    let otherId = "";
    if (!caller) {
      otherId = both.find((usr) => usr != user._id);
      socket.emit("leaveCall", otherId, user._id, name);
    } else socket.emit("leaveCall", caller, user._id, name);
    // window.location.reload();
    navigate("/dashboard");
  };

  // const handleChatOnlineClick = (friend) => {
  //   socket.emit(
  //     "getUserSocketId",
  //     friend._id,
  //     JSON.parse(localStorage.getItem("user"))._id
  //   );
  // };

  const handleFullScreen = (id) => {
    document.getElementById(id).requestFullscreen();
  };

  const cutCallInBetween = (id) => {
    socket.emit("cutCallInBetween", id, name);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      // console.log(user);
      setUser(user);
      setName(user?.username);

      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          // set my stream
          setStream(stream);
          myVideo.current.srcObject = stream;
        });

      socket.on("me", (id) => {
        setMe(id);
      });

      socket.on("callUser", (data) => {
        // console.log(data);
        setReceivingCall(true);
        setCaller(data.from);
        setCallerName(data.name);
        setCallerSignal(data.signal);
      });

      socket.on("setBothCallers", (data) => {
        // console.log("Both callers Id:");
        // console.log(data);
        setBoth([data.to, data.from]);
      });

      socket.on("cutCallInBetween", (name) => {
        setReceivingCall(false);
        toast.info(`${name} Cut the Call`);
      });
    }
  }, []);

  useEffect(() => {
    socket.emit("addUser", JSON.parse(localStorage.getItem("user"))._id);
    socket.on("getUsers", (users) => {
      const usersWithoutMe = users?.filter((u) => u?.userId != user?._id);
      // console.log(usersWithoutMe);
      setOnlineUsers(usersWithoutMe);
    });

    socket.on("leaveCallId", (friend, name) => {
      // callAccepted && !callEnded
      // console.log(name);
      toast.info(`${name} Ended the call`);
      // window.location.reload();
      navigate("/dashboard");
    });

    socket.on("callRejected", (friend, name) => {
      // callAccepted && !callEnded
      // console.log(name);
      toast.info(`Call Declined`);
      handleClose();
    });

    // socket.on("userSocketId", (friend) => {
    //   console.log(friend.socketId);
    //   setIdToCall(friend.socketId);
    // });
  }, []);

  return (
    <div className="videocallContainer">
      <div className="video-call-container-container">
        <div
          className={`${
            callAccepted && !callEnded
              ? "call-video-container"
              : "video-container"
          }`}
        >
          <div
            className={`${callAccepted && !callEnded ? "call-video" : "video"}`}
          >
            {stream && (
              <div>
                <div
                  className="expand"
                  onClick={() => handleFullScreen("own-video")}
                >
                  <div className="expand-btm-area">
                    <div>
                      <div className="expand-icon">
                        <i className="fa-solid fa-expand"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <video
                  id="own-video"
                  style={{ pointerEvents: "none", transition: "all 0.5s" }}
                  playsInline
                  muted
                  ref={myVideo}
                  autoPlay
                />
                <div className="video-name">
                  <h3>{user?.username}</h3>
                </div>
              </div>
            )}
          </div>
          <div className="friend-video">
            {callAccepted && !callEnded ? (
              <>
                <div>
                  <div
                    className="expand"
                    onClick={() => handleFullScreen("friend-video")}
                  >
                    <div className="expand-btm-area">
                      <div>
                        <div className="expand-icon">
                          <i className="fa-solid fa-expand"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <video
                    id="friend-video"
                    playsInline
                    ref={userVideo}
                    autoPlay
                    style={{ pointerEvents: "none", transition: "all 0.5s" }}
                  />
                  <div className="video-name">
                    <h3>{callerName}</h3>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
        <ChatOnline
          onlineUsers={onlineUsers}
          currentId={user?._id}
          callUser={callUser}
          callAccepted={callAccepted}
          callEnded={callEnded}
        />
        <div className="video-call-controls-container">
          <VideoCallControls
            leaveCall={leaveCall}
            mystream={stream}
            callAccepted={callAccepted}
            callEnded={callEnded}
          />
        </div>
        <Modal show={receivingCall && !callAccepted}>
          <Modal.Header>
            <Modal.Title>
              <h1>{callerName} is calling...</h1>
            </Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            <Button variant="contained" color="primary" onClick={answerCall}>
              Answer
            </Button>
            <Button variant="contained" color="secondary" onClick={rejectCall}>
              Decline
            </Button>
          </Modal.Footer>
        </Modal>
        {/* {receivingCall && !callAccepted ? (
          <div>
            <div className="caller">
              <h1>{callerName} is calling...</h1>
              <Button variant="contained" color="primary" onClick={answerCall}>
                Answer
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={rejectCall}
              >
                Decline
              </Button>
            </div>
          </div>
        ) : null} */}
      </div>
      {isOpenVideoModal && (
        <VideoCallModal
          isOpen={isOpenVideoModal}
          handleClose={handleClose}
          friend={friend}
          cutCallInBetween={cutCallInBetween}
        />
      )}
    </div>
  );
};

export default VideoCall;
