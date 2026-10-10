import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  connectWebSocket,
  sendMessage as wsSendMessage,
  disconnectWebSocket,
} from "../services/Websocket";
import { useAuth } from "../contexts/AuthContext";
import ChatComposer from "./ChatComposer";
import { getMyGroups } from "../api/groupApi";
import {
  MessageCircle,
  Users,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Send,
  Paperclip,
  Smile,
  SmilePlus,
  Reply,
  MoreVertical,
  Search,
} from "lucide-react";
import "../styles/ChatsPage.css";

const fmtDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

// ---------------------------------------------------------
// COMPONENT: Group List (Left Panel)
// ---------------------------------------------------------
function GroupList({ groups, selectedGroupId, onSelectGroup }) {
  return (
    <div className="chat-group-list">
      <div className="chat-group-list-header">
        <h1>Your chats</h1>
        <p>Trip group conversations</p>
      </div>

      <div className="chat-group-items">
        {groups.map((group) => (
          <div
            key={group.groupId}
            className={`chat-group-item ${
              selectedGroupId === group.groupId ? "active" : ""
            }`}
            onClick={() => onSelectGroup(group)}
          >
            <div className="chat-group-icon">
              <MessageCircle size={20} />
            </div>
            <div className="chat-group-info">
              <h3 className="chat-group-route">{group.route}</h3>
              <p className="chat-group-preview">{group.lastMessage}</p>
            </div>
            <div className="chat-group-meta">
              <span className="chat-group-time">{group.lastMessageTime}</span>
              <span className="chat-group-members">
                <Users size={12} />
                {group.members}
              </span>
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="chat-empty-groups">
            <MessageCircle size={32} strokeWidth={1.5} />
            <p>No trip groups yet</p>
            <span>Join a trip to start chatting</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT: Message Bubble
// ---------------------------------------------------------
function MessageBubble({ msg, isGrouped, isOwn, userName }) {
  const displayName = isOwn ? `${userName} (you)` : `User ${msg.senderId}`;
  const initials = isOwn
    ? userName.slice(0, 2).toUpperCase()
    : `U${msg.senderId}`;

  const timeString = msg.sendAt
    ? new Date(msg.sendAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });

  return (
    <div
      className={`chat-message ${isGrouped ? "grouped" : ""} ${
        isOwn ? "is-own" : ""
      }`}
    >
      <div className="chat-msg-avatar-col">
        {!isGrouped ? (
          <div className="chat-msg-avatar">{initials}</div>
        ) : (
          <div className="chat-msg-time-hover">{timeString}</div>
        )}
      </div>

      <div className="chat-msg-content">
        {!isGrouped && (
          <div className="chat-msg-meta">
            <span className="chat-msg-author">{displayName}</span>
            <span className="chat-msg-time">{timeString}</span>
          </div>
        )}
        <div className="chat-msg-text">{msg.content}</div>
      </div>

      <div className="chat-msg-actions">
        <button title="Add Reaction">
          <SmilePlus size={16} />
        </button>
        <button title="Reply">
          <Reply size={16} />
        </button>
        <button title="More">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT: Chat Area (Right Panel)
// ---------------------------------------------------------
function ChatArea({ group, messages, connectionStatus, onSendMessage, userName }) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainRef = useRef(null);
  const connected = connectionStatus === "connected";

  // Auto-scroll on new messages
  useEffect(() => {

   if(chatContainRef.current){
    chatContainRef.current.scrollTo({
      top: chatContainRef.current.scrollHeight,
      behavior: "smooth"
    });
   }
  }, [messages]);

  const handleInput = (e) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (inputText.trim() && connected) {
      onSendMessage(inputText.trim());
      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  return (
    <div className="chat-area">
      {/* Chat Header */}
      <div className="chat-area-header">
        <div className="chat-area-header-info">
          <h2 className="chat-area-room-name">{group.route}</h2>
          <div className="chat-area-room-meta">
            <div className="chat-connection-indicator">
              <div
                className={`chat-indicator-dot ${
                  connected ? "connected" : "connecting"
                }`}
              />
              <span>{connected ? "Connected" : "Connecting..."}</span>
            </div>
            <span>|</span>
            <span>{group.members} members</span>
          </div>
        </div>
        <div className="chat-area-header-actions">
          <button>
            <Search size={18} />
          </button>
          <button>
            <Users size={18} />
          </button>
          <button>
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages-area" ref={chatContainRef}>
        <div className="chat-intro-block">
          <h3 className="chat-intro-block-title">{group.route}</h3>
          <p className="chat-intro-block-desc">
            This is the start of the trip group chat. Coordinate with your
            co-passengers here!
          </p>
          <div className="chat-intro-block-details">
            <span>
              <Calendar size={14} />
              {fmtDate(group.travelDate)}
            </span>
            <span>
              <ArrowRight size={14} />
              {group.destination}
            </span>
          </div>
        </div>

        {messages.map((msg, idx) => {
          const prevMsg = messages[idx - 1];
          const isGrouped = prevMsg && prevMsg.senderId === msg.senderId;
          const isOwn = userName && msg.senderId === 1; // userId 1 is the current mock user

          return (
            <MessageBubble
              key={idx}
              msg={msg}
              isGrouped={isGrouped}
              isOwn={isOwn}
              userName={userName}
            />
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <ChatComposer
  placeholder={`Message ${group.route.split(" → ")[0]}...`}
  connected={connected}
  onSendMessage={onSendMessage}
/>
    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT: Empty State (no group selected)
// ---------------------------------------------------------
function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="chat-empty-state">
      <div className="chat-empty-state-inner">
        <MessageCircle size={48} strokeWidth={1.5} />
        <h2>Select a conversation</h2>
        <p>Pick a trip group from the left to start chatting</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/trips")}
        >
          Browse trips
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// MAIN: ChatsPage
// ---------------------------------------------------------
export default function ChatsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
 

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const userName = user?.name || "You";

  // Auto-select group from ?trip=id query param
  const tripIdFromUrl = searchParams.get("trip");

  useEffect(() => {
    if (tripIdFromUrl) {
      const matchedGroup = MOCK_GROUPS.find(
        (g) => g.tripId === parseInt(tripIdFromUrl)
      );
      if (matchedGroup) {
        setSelectedGroup(matchedGroup);
        setMobileShowChat(true);
      }
    }
  }, [tripIdFromUrl]);

  // Connect/disconnect WebSocket when selected group changes
  useEffect(() => {
    if (!selectedGroup) {
      disconnectWebSocket();
      setConnectionStatus("disconnected");
      return;
    }

    // Clear messages for the new group
    setMessages([]);

    // Connect via the centralized WebSocket service
    connectWebSocket(
      selectedGroup.groupId,
      (receivedMessage) => {
        setMessages((prev) => [...prev, receivedMessage]);
      },
      (status) => {
        setConnectionStatus(status);
      }
    );

    return () => {
      disconnectWebSocket();
    };
  }, [selectedGroup?.groupId]);

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setMobileShowChat(true);
  };

  const handleSendMessage = (content) => {
    wsSendMessage(selectedGroup.groupId, content);
  };

  const handleMobileBack = () => {
    setMobileShowChat(false);
  };

  return (
    <div className="chats-page">
      <div
        className={`chats-layout ${mobileShowChat ? "mobile-show-chat" : ""}`}
      >
        {/* Left Panel — Group List */}
        <div className="chats-left-panel">
          <GroupList
            groups={MOCK_GROUPS}
            selectedGroupId={selectedGroup?.groupId}
            onSelectGroup={handleSelectGroup}
          />
        </div>

        {/* Right Panel — Chat or Empty State */}
        <div className="chats-right-panel">
          {mobileShowChat && (
            <button className="chat-mobile-back" onClick={handleMobileBack}>
              <ArrowLeft size={18} />
              Back to groups
            </button>
          )}

          {selectedGroup ? (
            <ChatArea
              group={selectedGroup}
              messages={messages}
              connectionStatus={connectionStatus}
              onSendMessage={handleSendMessage}
              userName={userName}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
