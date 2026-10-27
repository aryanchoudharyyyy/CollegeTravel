import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useChatNotifications } from "../contexts/ChatNotificationContext";
import ChatComposer from "./ChatComposer";
import {
  connectMarketplaceWebsocket,
  sendMarketplaceMessage,
  disconnectMarketplaceWebSocket,
} from "../services/marketPlaceWebsocket";
import {
  getListingChatHistory,
  getMyListingConversations,
  getListingById,
} from "../api/marketplaceApi";
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

function formatTime(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onLoadMore,
  hasMore,
  loadingMore,
  unreadCounts = {},
}) {
  return (
    <div className="chat-group-list">
      <div className="chat-group-list-header">
        <h1>Marketplace Inbox</h1>
        <p>Your ticket discussions</p>
      </div>

      <div className="chat-group-items">
        {conversations.map((conv) => {
          const unread = unreadCounts[conv.conversationId] || 0;
          const displayTitle = conv.listingTitle || conv.otherUserName;
          const displayTime = formatTime(conv.lastMessageTime);

          return (
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
                <h3
                  className={`chat-group-route ${unread > 0 ? "unread-title" : ""}`}
                  title={displayTitle}
                >
                  {displayTitle}
                </h3>
                <p className={`chat-group-preview ${unread > 0 ? "chat-unread-text" : ""}`}>
                  {conv.lastMessage || "Chat started"}
                </p>
              </div>
              <div className="chat-group-meta">
                <span className="chat-group-time">{displayTime}</span>
                {unread > 0 && (
                  <span className="whatsapp-unread-badge">{unread}</span>
                )}
              </div>
            </div>
          );
        })}

        {conversations.length === 0 && (
          <div className="chat-empty-groups">
            <Store size={32} strokeWidth={1.5} />
            <p>No marketplace messages yet</p>
            <span>Express interest in a ticket to start chatting</span>
          </div>
        )}
      </div>
      {hasMore && (
        <button className="btn btn-ghost" onClick={onLoadMore} disabled={loadingMore}>
          {loadingMore ? "Loading…" : "Load more conversations"}
        </button>
      )}
    </div>
  );
}

function MessageBubble({ msg, isGrouped, isOwn, userName, otherUserName }) {
  const displayName = isOwn ? `${userName} (you)` : (otherUserName || `User #${msg.senderId}`);
  const initials = isOwn
    ? userName.slice(0, 2).toUpperCase()
    : (otherUserName || "User").slice(0, 2).toUpperCase();

  const timeString = (msg.sentAt || msg.sendAt)
    ? new Date(msg.sentAt || msg.sendAt).toLocaleTimeString([], {
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
        behavior: "smooth",
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
            {conversation.listingTitle && (
              <>
                <span>|</span>
                <span>{conversation.listingTitle}</span>
              </>
            )}
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
          <h3 className="chat-intro-block-title">
            {conversation.listingTitle || `Ticket #${conversation.listingId}`}
          </h3>
          <p className="chat-intro-block-desc">
            This is the start of your conversation with {conversation.otherUserName} regarding this listing.
          </p>
          <div className="chat-intro-block-details">
            <span>
              <Store size={14} />
              Ticket #{conversation.listingId} {conversation.price ? `• ₹${conversation.price}` : ""}
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
              otherUserName={conversation.otherUserName}
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
  const {
    marketplaceUnreadCounts,
    markMarketplaceAsRead,
    handleIncomingMarketplaceMessage,
    setActiveMarketplaceConvId,
  } = useChatNotifications();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [conversationPage, setConversationPage] = useState(0);
  const [hasMoreConversations, setHasMoreConversations] = useState(false);
  const [loadingMoreConversations, setLoadingMoreConversations] = useState(false);

  const currentUserId = user?.id;
  const userName = user?.name || "You";

  const conversationIdFromUrl = searchParams.get("conversation");

  const loadConversations = async (page = 0, append = false) => {
    if (append) setLoadingMoreConversations(true);
    else setLoadingConversations(true);
    try {
      const res = await getMyListingConversations(page, 20);
      const rawList = res.data?.content || [];
      // Live ticket details (route, seller name, price) fetch karke combine karte hain
      const enrichedList = await Promise.all(
        rawList.map(async (conv) => {
          if (!conv.listingId) return conv;
          try {
            const listingRes = await getListingById(conv.listingId);
            const listing = listingRes.data;
            const route =
              listing.source && listing.destination
                ? `${listing.source} → ${listing.destination}`
                : listing.description;
            const isOtherSeller = conv.otherUserId === listing.postedByUserId;
            const realName =
              isOtherSeller && listing.postedByUserName
                ? listing.postedByUserName
                : conv.otherUserName;

            return {
              ...conv,
              listingTitle: route || `Ticket #${conv.listingId}`,
              otherUserName:
                realName && !realName.startsWith("User #") ? realName : conv.otherUserName,
              price: listing.price,
              ticketClass: listing.ticketClass,
            };
          } catch {
            return {
              ...conv,
              listingTitle: conv.listingId ? `Ticket #${conv.listingId}` : conv.otherUserName,
            };
          }
        })
      );
      setConversations((previous) => (append ? [...previous, ...enrichedList] : enrichedList));
      setConversationPage(page);
      setHasMoreConversations(res.data?.last === false);
    } catch (err) {
      console.log("Failed to load marketplace conversations:", err);
    } finally {
      setLoadingConversations(false);
      setLoadingMoreConversations(false);
    }
  };

  useEffect(() => {
    localStorage.removeItem("marketplace_conversations");
    loadConversations();
  }, []);

  useEffect(() => {
    return () => setActiveMarketplaceConvId(null);
  }, [setActiveMarketplaceConvId]);

  const loadMoreConversations = () => {
    if (!loadingMoreConversations && hasMoreConversations) {
      loadConversations(conversationPage + 1, true);
    }
  };

  useEffect(() => {
    const convId = conversationIdFromUrl ? parseInt(conversationIdFromUrl) : null;
    if (convId) {
      const existing = conversations.find((c) => c.conversationId === convId);
      if (existing) {
        setSelectedConversation(existing);
        markMarketplaceAsRead(existing.conversationId);
      } else {
        const stateData = location.state || {};
        const newConv = {
          conversationId: convId,
          listingId: stateData.listingId || null,
          listingTitle: stateData.listingTitle || `Ticket #${convId}`,
          otherUserId: stateData.otherUserId || null,
          otherUserName: stateData.otherUserName || "Seller",
          lastMessage: "Chat started",
          lastMessageTime: new Date().toISOString(),
        };
        setSelectedConversation(newConv);
        markMarketplaceAsRead(convId);
      }
      setMobileShowChat(true);
    }
  }, [conversationIdFromUrl, conversations, location.state, markMarketplaceAsRead]);

  useEffect(() => {
    if (!selectedConversation?.conversationId) {
      disconnectMarketplaceWebSocket();
      setConnectionStatus("disconnected");
      return;
    }

    markMarketplaceAsRead(selectedConversation.conversationId);

    // 1. Fetch persistent history from chat-service database
    getListingChatHistory(selectedConversation.conversationId)
      .then((res) => {
        const history = res.data?.messages || [];
        setMessages(history);
      })
      .catch((err) => {
        console.error("Failed to load message history:", err);
      });

    // 2. Connect WebSocket and subscribe to conversation topic
    connectMarketplaceWebsocket(
      selectedConversation.conversationId,
      (receivedMessage) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === receivedMessage.id)) return prev;
          return [...prev, receivedMessage];
        });

        setConversations((prev) =>
          prev.map((c) =>
            c.conversationId === selectedConversation.conversationId
              ? {
                  ...c,
                  lastMessage: receivedMessage.content,
                  lastMessageTime: receivedMessage.sentAt || new Date().toISOString(),
                }
              : c
          )
        );

        handleIncomingMarketplaceMessage(selectedConversation.conversationId, receivedMessage);
      },
      (status) => {
        setConnectionStatus(status);
      }
    );

    return () => {
      disconnectMarketplaceWebSocket();
    };
  }, [selectedConversation?.conversationId, markMarketplaceAsRead, handleIncomingMarketplaceMessage]);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setMobileShowChat(true);
    markMarketplaceAsRead(conv.conversationId);
  };

  const handleSendMessage = (content) => {
    if (!content.trim() || !selectedConversation) return;
    sendMarketplaceMessage(selectedConversation.conversationId, content);
  };

  const handleMobileBack = () => {
    setMobileShowChat(false);
  };

  return (
    <div className="chats-page">
      <div className={`chats-layout ${mobileShowChat ? "mobile-show-chat" : ""}`}>
        <div className="chats-left-panel">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversation?.conversationId}
            onSelectConversation={handleSelectConversation}
            onLoadMore={loadMoreConversations}
            hasMore={hasMoreConversations}
            loadingMore={loadingMoreConversations}
            unreadCounts={marketplaceUnreadCounts}
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
