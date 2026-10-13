import { Client } from "@stomp/stompjs";
import { getAccessToken } from "../utils/token";

// Native WebSocket URL routed perfectly through your API Gateway!
const WS_URL = "ws://localhost:8085/api/chat/ws";

let stompClient = null;
let connectionStatusCallback = null;

export const connectWebSocket = (groupId, onMessage, onStatusChange) => {
    disconnectWebSocket(); // Clean up old connections

    connectionStatusCallback = onStatusChange;
    if (onStatusChange) onStatusChange("connecting");

    stompClient = new Client({
        brokerURL: WS_URL,
        connectHeaders: {
            // Your backend interceptor strictly requires this!
            Authorization: `Bearer ${getAccessToken()}`
        },
        reconnectDelay: 5000,
        onConnect: () => {
            console.log("WebSocket connected to group", groupId);
            if (connectionStatusCallback) connectionStatusCallback("connected");

            // Subscribe to the specific group topic
            stompClient.subscribe(`/topic/group.${groupId}`, (message) => {
                if (message.body && onMessage) {
                    onMessage(JSON.parse(message.body));
                }
            });
        },
        onStompError: (frame) => {
            console.error("Broker reported error:", frame.headers["message"]);
            console.error("Additional details:", frame.body);
            if (connectionStatusCallback) connectionStatusCallback("disconnected");
        },
        onWebSocketError: (error) => {
            console.error("WebSocket error:", error);
            if (connectionStatusCallback) connectionStatusCallback("disconnected");
        }
    });

    stompClient.activate();
};

export const sendMessage = (groupId, content) => {
    if (!stompClient || !stompClient.connected) {
        console.warn("Cannot send message - WebSocket not connected");
        return false;
    }

    stompClient.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify({
            groupId: groupId,
            content: content.trim()
        })
    });
    return true;
};

export const isConnected = () => {
    return stompClient?.connected ?? false;
};

export const disconnectWebSocket = () => {
    connectionStatusCallback = null;
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
        console.log("WebSocket disconnected");
    }
};