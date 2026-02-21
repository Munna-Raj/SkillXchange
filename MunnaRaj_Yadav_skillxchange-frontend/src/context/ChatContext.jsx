import React, { createContext, useContext, useMemo, useState } from "react";
import ChatBox from "../components/ChatBox";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [chatState, setChatState] = useState(null);

  const openChat = ({ requestId, otherUser }) => {
    if (!requestId || !otherUser) return;
    setChatState({
      requestId,
      otherUser,
      isOpen: true,
    });
  };

  const closeChat = () => {
    setChatState(null);
  };

  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  const value = useMemo(
    () => ({
      chatState,
      openChat,
      closeChat,
    }),
    [chatState]
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
      {chatState?.isOpen && (
        <ChatBox
          requestId={chatState.requestId}
          otherUser={chatState.otherUser}
          currentUser={currentUser}
          onClose={closeChat}
        />
      )}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return ctx;
};

