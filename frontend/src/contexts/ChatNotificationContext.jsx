import { createContext, useContext, useEffect, useCallback, useState } from "react";
import { useAuth } from "./AuthContext";
import { getMyGroups } from "../api/groupApi";
import { getGroupChatHistory } from "../api/chatApi";
import { getMyListingConversations, getListingChatHistory } from "../api/marketplaceApi";

const ChatNotificationContext = createContext();

export function ChatNotificationProvider({ children }) {
  const { user, isLoggedIn } = useAuth();

  // Trip groups state
  const [lastMessages, setLastMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [activeGroupId, setActiveGroupId] = useState(null);

  // Marketplace conversations state
  const [marketplaceUnreadCounts, setMarketplaceUnreadCounts] = useState({});
  const [activeMarketplaceConvId, setActiveMarketplaceConvId] = useState(null);

  const getStorageKey = () => `chat_last_read_${user?.id || "guest"}`;
  const getMarketplaceStorageKey = () => `marketplace_chat_last_read_${user?.id || "guest"}`;

  // 1. Load Trip Groups Summary
  const loadGroupsSummary = useCallback(async () => {
    if (!isLoggedIn || !user) return;
    try {
      const res = await getMyGroups(0, 50);
      const groups = res.data?.content || [];
      const storedLastRead = JSON.parse(localStorage.getItem(getStorageKey()) || "{}");

      const previews = {};
      const unreads = {};

      await Promise.all(
        groups.map(async (group) => {
          try {
            const historyRes = await getGroupChatHistory(group.id, null, 10);
            const messages = historyRes.data?.messages || [];
            if (messages.length > 0) {
              const lastMsg = messages[messages.length - 1];
              previews[group.id] = {
                content: lastMsg.content,
                sendAt: lastMsg.sendAt,
                senderName: lastMsg.senderName,
              };

              const lastReadTime = storedLastRead[group.id];
              if (!lastReadTime) {
                const unreadList = messages.filter((m) => m.senderId !== user.id);
                unreads[group.id] = unreadList.length;
              } else {
                const unreadList = messages.filter(
                  (m) => new Date(m.sendAt) > new Date(lastReadTime) && m.senderId !== user.id
                );
                unreads[group.id] = unreadList.length;
              }
            }
          } catch (e) {
            console.error("Error loading summary for group:", group.id, e);
          }
        })
      );

      setLastMessages(previews);
      setUnreadCounts(unreads);
    } catch (err) {
      console.log("Error loading groups:", err);
    }
  }, [isLoggedIn, user]);

  // 2. Load Marketplace Conversations Summary
  const loadMarketplaceSummary = useCallback(async () => {
    if (!isLoggedIn || !user) return;
    try {
      const res = await getMyListingConversations(0, 50);
      const conversations = res.data?.content || [];
      const storedLastRead = JSON.parse(localStorage.getItem(getMarketplaceStorageKey()) || "{}");

      const unreads = {};

      await Promise.all(
        conversations.map(async (conv) => {
          try {
            const historyRes = await getListingChatHistory(conv.conversationId, null, 10);
            const messages = historyRes.data?.messages || [];
            if (messages.length > 0) {
              const lastReadTime = storedLastRead[conv.conversationId];
              if (!lastReadTime) {
                const unreadList = messages.filter((m) => m.senderId !== user.id);
                unreads[conv.conversationId] = unreadList.length;
              } else {
                const unreadList = messages.filter(
                  (m) =>
                    new Date(m.sentAt || m.sendAt) > new Date(lastReadTime) &&
                    m.senderId !== user.id
                );
                unreads[conv.conversationId] = unreadList.length;
              }
            }
          } catch (e) {
            console.error("Error loading summary for marketplace conversation:", conv.conversationId, e);
          }
        })
      );

      setMarketplaceUnreadCounts(unreads);
    } catch (err) {
      console.log("Error loading marketplace summary:", err);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    loadGroupsSummary();
    loadMarketplaceSummary();
  }, [loadGroupsSummary, loadMarketplaceSummary]);

  // Group message handler
  const handleIncomingMessage = useCallback(
    (groupId, message) => {
      setLastMessages((prev) => ({
        ...prev,
        [groupId]: {
          content: message.content,
          sendAt: message.sendAt || new Date().toISOString(),
          senderName: message.senderName,
        },
      }));

      if (String(activeGroupId) !== String(groupId) && message.senderId !== user?.id) {
        setUnreadCounts((prev) => ({
          ...prev,
          [groupId]: (prev[groupId] || 0) + 1,
        }));
      }
    },
    [activeGroupId, user]
  );

  // Group mark as read
  const markAsRead = useCallback(
    (groupId) => {
      if (!groupId) return;
      setActiveGroupId(groupId);
      setUnreadCounts((prev) => ({
        ...prev,
        [groupId]: 0,
      }));
      const stored = JSON.parse(localStorage.getItem(getStorageKey()) || "{}");
      stored[groupId] = new Date().toISOString();
      localStorage.setItem(getStorageKey(), JSON.stringify(stored));
    },
    [user]
  );

  // Marketplace message handler
  const handleIncomingMarketplaceMessage = useCallback(
    (conversationId, message) => {
      if (
        String(activeMarketplaceConvId) !== String(conversationId) &&
        message.senderId !== user?.id
      ) {
        setMarketplaceUnreadCounts((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || 0) + 1,
        }));
      }
    },
    [activeMarketplaceConvId, user]
  );

  // Marketplace mark as read
  const markMarketplaceAsRead = useCallback(
    (conversationId) => {
      if (!conversationId) return;
      setActiveMarketplaceConvId(conversationId);
      setMarketplaceUnreadCounts((prev) => ({
        ...prev,
        [conversationId]: 0,
      }));
      const stored = JSON.parse(localStorage.getItem(getMarketplaceStorageKey()) || "{}");
      stored[conversationId] = new Date().toISOString();
      localStorage.setItem(getMarketplaceStorageKey(), JSON.stringify(stored));
    },
    [user]
  );

  // Total unreads
  const totalUnreadCount = Object.values(unreadCounts).reduce((acc, curr) => acc + (curr || 0), 0);
  const totalMarketplaceUnread = Object.values(marketplaceUnreadCounts).reduce(
    (acc, curr) => acc + (curr || 0),
    0
  );

  return (
    <ChatNotificationContext.Provider
      value={{
        // Groups
        lastMessages,
        unreadCounts,
        totalUnreadCount,
        handleIncomingMessage,
        markAsRead,
        setActiveGroupId,
        refreshSummaries: loadGroupsSummary,

        // Marketplace
        marketplaceUnreadCounts,
        totalMarketplaceUnread,
        handleIncomingMarketplaceMessage,
        markMarketplaceAsRead,
        setActiveMarketplaceConvId,
        refreshMarketplaceSummaries: loadMarketplaceSummary,
      }}
    >
      {children}
    </ChatNotificationContext.Provider>
  );
}

export const useChatNotifications = () => useContext(ChatNotificationContext);
