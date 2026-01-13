// File: frontend/components/chat/Chat.jsx
// denne fil indeholder chat komponenter: beskeder, beskedliste og input felt

// det er denne fil der bruges i ChatPage.jsx til at vise chat interfacet
// og den bruger data fra useChat hooket og messages/friends data filerne

import React from "react";

function Message({ type = "user", children, avatar, showAvatar, senderName }) {
  const isUser = type === "user";
  return (
    <div
      className={`flex mb-1 px-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && showAvatar && (
        <div className="w-10 h-10 mr-2 overflow-hidden bg-gray-300 rounded-full shrink-0 relative group">
          <img
            src={avatar}
            alt="Friend avatar"
            className="object-cover w-full h-full"
            title={senderName} // Fallback tooltip
          />
          {/* CSS Tooltip */}
          {senderName && (
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
              {senderName}
            </div>
          )}
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 text-base leading-relaxed ${isUser ? "bg-[#3F4D54] text-white" : "bg-gray-200 text-gray-900"}`}
      >
        {children}
      </div>
      {isUser && showAvatar && (
        <div className="w-10 h-10 ml-2 overflow-hidden bg-gray-300 rounded-full shrink-0 relative group">
          <img
            src={avatar}
            alt="Your avatar"
            className="object-cover w-full h-full"
            title="You" // Fallback tooltip
          />
          {/* CSS Tooltip */}
          <div className="absolute bottom-12 right-1/2 transform translate-x-1/2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
            You
          </div>
        </div>
      )}
    </div>
  );
}

function ChatMessages({ messages = [], currentUser, friendAvatar, showTyping = false }) {
  return (
    <div className="flex-1 py-4 overflow-y-auto">
      {messages.map((message) => {
        const isCurrentUser = message.senderId === currentUser?.id;
        const messageType = isCurrentUser ? "user" : "friend";
        // Brug avatar fra message data (vigtig for gruppechats!)
        const avatar = message.avatar || (isCurrentUser ? currentUser?.avatar : friendAvatar);

        console.log("💬 Message from:", message.senderId, "isCurrentUser:", isCurrentUser, "avatar:", avatar);

        return (
          <Message
            key={message.id}
            type={messageType}
            avatar={avatar}
            showAvatar={true}
            senderName={message.senderName}
          >
            {message.content}
          </Message>
        );
      })}
      
      {/* Typing indicator */}
      {showTyping && (
        <div className="flex mb-1 px-4 justify-start">
          <div className="w-10 h-10 mr-2 overflow-hidden bg-gray-300 rounded-full shrink-0">
            <img
              src={friendAvatar}
              alt="Friend avatar"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-gray-200 text-gray-900">
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatInput({ onSendMessage }) {
  const formRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const pictureInputRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const [showMenu, setShowMenu] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const message = formData.get("message");

    if (message && message.trim() && onSendMessage) {
      onSendMessage(message.trim());
      e.target.reset();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }
  };

  const handlePictureSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (onSendMessage) {
          onSendMessage(`[Image: ${file.name}]`, {
            type: "image",
            data: reader.result,
            name: file.name,
          });
        }
      };
      reader.readAsDataURL(file);
    }
    setShowMenu(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (onSendMessage) {
        onSendMessage(`[File: ${file.name}]`, {
          type: "file",
          name: file.name,
          size: file.size,
        });
      }
    }
    setShowMenu(false);
  };

  // denne del er til at håndtere pop-up menuen for vedhæftninger
  // men er kun delvist implementeret
  // man kan ikke rigtig sende filer endnu
  
  return (
    <div className="relative px-4 py-3 bg-white border-t border-gray-200">
      {/* Pop-up menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute bottom-16 left-4 z-20 bg-[#3F4D54] rounded-2xl shadow-lg py-2 w-48">
            <button
              onClick={() => pictureInputRef.current?.click()}
              className="flex items-center w-full gap-3 px-4 py-3 text-left text-white transition-colors hover:bg-white/10"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm">Attach a picture</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center w-full gap-3 px-4 py-3 text-left text-white transition-colors hover:bg-white/10"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <span className="text-sm">Attach a file</span>
            </button>
            <button className="flex items-center w-full gap-3 px-4 py-3 text-left text-white transition-colors hover:bg-white/10">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm">Share location</span>
            </button>
            <button className="flex items-center w-full gap-3 px-4 py-3 text-left text-white transition-colors hover:bg-white/10">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="text-sm">Survey</span>
            </button>
          </div>
        </>
      )}

      {/* Hidden file inputs */}
      <input
        ref={pictureInputRef}
        type="file"
        accept="image/*"
        onChange={handlePictureSelect}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
      />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex items-center gap-3"
      >
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center justify-center text-gray-600 transition-colors bg-gray-200 rounded-full w-9 h-9 hover:bg-gray-300 shrink-0"
          aria-label="Add attachment"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <input
          ref={inputRef}
          name="message"
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-gray-200 transition-colors"
          placeholder="Aa"
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          required
        />
        <button
          type="submit"
          className="flex items-center justify-center text-white transition-colors bg-[#3F4D54] rounded-full w-9 h-9 hover:bg-[#2f3d44] shrink-0"
          aria-label="Send message"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}

export { Message, ChatMessages, ChatInput };
