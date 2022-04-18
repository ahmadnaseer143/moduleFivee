import React, { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import "./ConferenceCall.css";
import Peer from "simple-peer";
import io from "socket.io-client";
const ConferenceCall = (props) => {
  const { roomId } = useParams();

  return (
    <div class="main">
      <div class="main__left">
        <div class="main__videos">
          <div id="video-grid"></div>
        </div>
        <div class="main__controls">
          <div class="main__controls__block">
            <div
              onclick="muteUnmute()"
              class="main__controls__button main__mute_button"
            >
              <i class="fas fa-microphone"></i>
              <span>Mute</span>
            </div>
            <div
              onclick="playStop()"
              class="main__controls__button main__video_button"
            >
              <i class="fas fa-video"></i>
              <span>Stop Video</span>
            </div>
          </div>
          <div class="main__controls__block">
            <div class="main__controls__button">
              <i class="fas fa-shield-alt"></i>
              <span>Security</span>
            </div>
            <div class="main__controls__button">
              <i class="fas fa-user-friends"></i>
              <span>Participants</span>
            </div>
            <div class="main__controls__button">
              <i class="fas fa-comment-alt"></i>
              <span>Chat</span>
            </div>
          </div>
          <div class="main__controls__block">
            <div class="main__controls__button">
              <span class="leave_meeting">Leave Meeting</span>
            </div>
          </div>
        </div>
      </div>
      <div class="main__right">
        <div class="main__header">
          <h6>Chat</h6>
        </div>
        <div class="main__chat_window">
          <ul class="messages"></ul>
        </div>
        <div class="main__message_container">
          <input
            id="chat_message"
            type="text"
            placeholder="Type message here..."
          />
        </div>
      </div>
    </div>
  );
};

export default ConferenceCall;
