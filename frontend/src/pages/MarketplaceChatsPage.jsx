import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ChatComposer from "./ChatComposer";
// import {
//   connectMarketplaceWebSocket,
//   sendMarketplaceMessage,
//   disconnectMarketplaceWebSocket,
// } from "../services/MarketplaceWebsocket";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  SmilePlus,
  Reply,
  MoreVertical,
  Search,
  Store,
} from "lucide-react";
import "../styles/ChatsPage.css"; // Reusing the same CSS to maintain identical theme

// MOCK DATA
const MOCK_CONVERSATIONS = [
  {
    conversationId: 2001,
    listingId: 1,
    listingTitle: "Vande Bharat Express",
    otherUserId: 101,
    otherUserName: "User #101",
    lastMessage: "Is the ticket still available?",
    lastMessageTime: "1h ago",
  },
  {
    conversationId: 2002,
    listingId: 2,
    listingTitle: "Shatabdi CC to Kanpur",
    otherUserId: 205,
    otherUserName: "User #205",
    lastMessage: "Yes, we can meet at the station.",
    lastMessageTime: "4h ago",
  }
];



function ConversationList({ conversations, selectedConversationId, onSelectConversation }) {
  return (
    <div className="chat-group-list">
      <div className="chat-group-list-header">
        <h1>Marketplace Inbox</h1>
        <p>Your ticket discussions</p>
      </div>

      <div className="chat-group-items">
        {conversations.map((conv) => (
          <div
            key={conv.conversationId}
            className={`chat-group-item ${
              selectedConversationId === conv.conversationId ? "active" : ""
            }`}
            onClick={() => onSelectConversation(conv)}
          >
            <div className="chat-group-icon">
              <Store size={20} />
            </div>
            <div className="chat-group-info">
              <h3 className="chat-group-route">{conv.otherUserName}</h3>
              <p className="chat-group-preview">{conv.lastMessage}</p>
            </div>
            <div className="chat-group-meta">
              <span className="chat-group-time">{conv.lastMessageTime}</span>
              <span className="chat-group-members">
                 {/* Reusing existing styles */}
                 Ticket #{conv.listingId}
              </span>
            </div>
          </div>
        ))}

        {conversations.length === 0 && (
          <div className="chat-empty-groups">
            <Store size={32} strokeWidth={1.5} />
            <p>No marketplace messages yet</p>
            <span>Express interest in a ticket to start chatting</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ msg, isGrouped, isOwn, userName }) {
  const displayName = isOwn ? `${userName} (you)` : `User #${msg.senderId}`;
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

function ChatArea({ conversation, messages, connectionStatus, onSendMessage, userName, currentUserId }) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  const connected = connectionStatus === "connected";

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
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
        300
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
      <div className="chat-area-header">
        <div className="chat-area-header-info">
          <h2 className="chat-area-room-name">{conversation.otherUserName}</h2>
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
            <span>{conversation.listingTitle}</span>
          </div>
        </div>
        <div className="chat-area-header-actions">
          <button>
            <Search size={18} />
          </button>
          <button>
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="chat-messages-area" ref={chatContainerRef}>
        <div className="chat-intro-block">
          <h3 className="chat-intro-block-title">{conversation.listingTitle}</h3>
          <p className="chat-intro-block-desc">
            This is the start of your conversation with {conversation.otherUserName} regarding this listing.
          </p>
          <div className="chat-intro-block-details">
            <span>
              <Store size={14} />
              Ticket #{conversation.listingId}
            </span>
          </div>
        </div>

        {messages.map((msg, idx) => {
          const prevMsg = messages[idx - 1];
          const isGrouped = prevMsg && prevMsg.senderId === msg.senderId;
          const isOwn = msg.senderId === currentUserId; 

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

      <ChatComposer
  placeholder={`Message ${conversation.otherUserName}...`}
  connected={connected}
  onSendMessage={onSendMessage}
/>
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="chat-empty-state">
      <div className="chat-empty-state-inner">
        <Store size={48} strokeWidth={1.5} />
        <h2>Select a conversation</h2>
        <p>Pick a marketplace chat from the left to start messaging</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/marketplace")}
        >
          Browse Marketplace
        </button>
      </div>
    </div>
  );
}

export default function MarketplaceChatsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // In this mock setup, current user ID is 102 (from ListingDetail.jsx mockup)
  const currentUserId = user?.id || 102; 
  const userName = user?.name || "You";

  const conversationIdFromUrl = searchParams.get("conversation");
  const newListingIdFromUrl = searchParams.get("new_listing");
  const newSellerIdFromUrl = searchParams.get("seller");

  // Manage mock conversations list with localStorage persistence
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("marketplace_conversations");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_CONVERSATIONS;
      }
    }
    return MOCK_CONVERSATIONS;
  });

  useEffect(() => {
    localStorage.setItem("marketplace_conversations", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (conversationIdFromUrl) {
      const matchedConv = conversations.find(
        (c) => c.conversationId === parseInt(conversationIdFromUrl)
      );
      if (matchedConv) {
        setSelectedConversation(matchedConv);
        setMobileShowChat(true);
      }
    } else if (newListingIdFromUrl && newSellerIdFromUrl) {
      // Dynamic creation of a new mock conversation
      const existingConv = conversations.find(
        c => c.listingId === parseInt(newListingIdFromUrl) && c.otherUserId === parseInt(newSellerIdFromUrl)
      );
      
      if (existingConv) {
         setSelectedConversation(existingConv);
         setMobileShowChat(true);
      } else {
         const newConv = {
            conversationId: Date.now(), // Generate a mock ID
            listingId: parseInt(newListingIdFromUrl),
            listingTitle: "Ticket #" + newListingIdFromUrl,
            otherUserId: parseInt(newSellerIdFromUrl),
            otherUserName: "User #" + newSellerIdFromUrl,
            lastMessage: "Conversation started",
            lastMessageTime: "Just now",
         };
         setConversations(prev => [newConv, ...prev]);
         setSelectedConversation(newConv);
         setMobileShowChat(true);
      }
    }
  }, [conversationIdFromUrl, newListingIdFromUrl, newSellerIdFromUrl]); // depend on initial load params

  useEffect(() => {
    if (!selectedConversation) {
      disconnectMarketplaceWebSocket();
      setConnectionStatus("disconnected");
      return;
    }

    const savedMessages = localStorage.getItem(`marketplace_messages_${selectedConversation.conversationId}`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch(e) {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }

    connectMarketplaceWebSocket(
      selectedConversation.conversationId,
      (receivedMessage) => {
        setMessages((prev) => [...prev, receivedMessage]);
      },
      (status) => {
        setConnectionStatus(status);
      }
    );

    return () => {
      disconnectMarketplaceWebSocket();
    };
  }, [selectedConversation?.conversationId]);

  useEffect(() => {
    if (selectedConversation) {
      localStorage.setItem(`marketplace_messages_${selectedConversation.conversationId}`, JSON.stringify(messages));
    }
  }, [messages, selectedConversation]);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setMobileShowChat(true);
  };

  const handleSendMessage = (content) => {
    const success = sendMarketplaceMessage(selectedConversation.conversationId, currentUserId, content);
    
    // In a mock environment without backend echoing back, add manually
    if (success && connectionStatus !== "connected") {
       // if disconnected, we still want to show in UI for mock if real sending failed? 
       // Actually no, wait for echo or simulate echo
    }
    // Simulate echo if websocket isn't actually echoing because no backend
    const simulatedMsg = {
        senderId: currentUserId,
        content: content,
        sendAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, simulatedMsg]);

    // Update conversation last message in list
    setConversations(prev => prev.map(c => 
      c.conversationId === selectedConversation.conversationId 
        ? { ...c, lastMessage: content, lastMessageTime: "Just now" } 
        : c
    ));
  };

  const handleMobileBack = () => {
    setMobileShowChat(false);
  };

  return (
    <div className="chats-page">
      <div
        className={`chats-layout ${mobileShowChat ? "mobile-show-chat" : ""}`}
      >
        <div className="chats-left-panel">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversation?.conversationId}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        <div className="chats-right-panel">
          {mobileShowChat && (
            <button className="chat-mobile-back" onClick={handleMobileBack}>
              <ArrowLeft size={18} />
              Back to inbox
            </button>
          )}

          {selectedConversation ? (
            <ChatArea
              conversation={selectedConversation}
              messages={messages}
              connectionStatus={connectionStatus}
              onSendMessage={handleSendMessage}
              userName={userName}
              currentUserId={currentUserId}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
