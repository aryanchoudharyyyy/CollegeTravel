import { Client } from "@stomp/stompjs";
import { getAccessToken } from "../utils/token";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/api/chat/ws"; 
let stompClient = null;
let connectionStatusCallBack = null;
export const connectMarketplaceWebsocket = (conversationId, onMessage, onStatusChange)=>{
    disconnectMarketplaceWebSocket();

    connectionStatusCallBack = onStatusChange;
    if(onStatusChange) onStatusChange("connecting");
    stompClient = new Client({
        brokerURL: WS_URL,
        connectHeaders: {
            Authorization: `Bearer ${getAccessToken()}`

        },
        reconnectDelay: 5000,
        onConnect: ()=>{
            console.log("Marketplace websocket connected to conversation:", conversationId);
            if(connectionStatusCallBack) connectionStatusCallBack("connected");
            stompClient.subscribe(`/topic/listing-conversation.${conversationId}`,
            (message) => {
                if(message.body && onMessage){
                    onMessage(JSON.parse(message.body));

                }
            });
        },
        onStompError: (frame) => {
            const errorMsg = frame.headers["message"];
            console.error("Marketplace broker error:", errorMsg);
            if (frame.body) {
                console.error("Broker error details:", frame.body);
            }
            if (connectionStatusCallBack) connectionStatusCallBack("disconnected");
            if (stompClient) {
                stompClient.deactivate();
            }
        },
        onWebSocketError: (error) => {
            console.error("Marketplace WebSocket error:", error);
            if (connectionStatusCallBack) connectionStatusCallBack("disconnected");
        }
    });
        stompClient.activate();
};
export const sendMarketplaceMessage = (conversationId, content) => {
    if (!stompClient || !stompClient.connected) {
        console.warn("Cannot send message - Marketplace WebSocket is not connected");
        return false;
    }
    stompClient.publish({
        destination: "/app/listing.sendMessage",
        body: JSON.stringify({
            conversationId: conversationId,
            content: content.trim()
        })
    });
    return true;
};
export const isMarketplaceConnected = () => {
    return stompClient?.connected ?? false;
};
export const disconnectMarketplaceWebSocket = () => {
    connectionStatusCallBack = null;
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
        console.log("Marketplace WebSocket disconnected");
    }
};