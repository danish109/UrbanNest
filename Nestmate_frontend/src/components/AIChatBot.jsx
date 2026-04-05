import React, { useState, useRef, useEffect } from "react";
import {
  FaComments,
  FaTimes,
  FaPaperPlane,
  FaRobot,
  FaLightbulb,
} from "react-icons/fa";
import { MdSmartToy } from "react-icons/md";

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sample initial messages
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your Society Management Assistant. How can I help you today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Get JWT token from local storage (assuming you have auth implemented)

      const response = await fetch("http://localhost:8000/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", parts: [{ text: inputMessage }] }],
          queryType: "general",
          // userId: 'current-user-id', // You would get this from auth context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Simulate typing delay for better UX
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: data.data,
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Quick questions suggestions
  const quickQuestions = [
    "How do I report a maintenance issue?",
    "What are the visiting hours?",
    "How to pay maintenance fees?",
    "Where can I find society rules?",
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-10 right-10 z-50 flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? "bg-red-900" : "bg-[#ffb703] hover:bg-[#ffb710]"
        }`}
        aria-label="Open chat"
      >
        {isOpen ? (
          <FaTimes className="text-black text-xl" />
        ) : (
          <FaComments className="text-black text-xl" />
        )}
      </button>

      {/* Chat Container */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col border border-gray-200">
          {/* Chat Header */}
          <div className="bg-[#0e2a4a] text-white font-bold p-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-grey-600 p-1 rounded-full mr-2">
                <MdSmartToy className="text-white text-lg" />
              </div>
              <div>
                <h3 className="font-bold">Society Assistant</h3>
                <p className="text-xs  text-white opacity-90">
                  AI-powered support
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-black hover:text-gray-200"
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-3  overflow-y-auto bg-gray-400">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-3 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "bot" && (
                  <div className="flex-shrink-0 mr-2">
                    <FaRobot className="text-black mt-1" />
                  </div>
                )}
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-500 text-black rounded-br-none"
                      : "bg-white border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-blue-200"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex mb-3 justify-start">
                <div className="flex-shrink-0 mr-2">
                  <FaRobot className="text-black mt-1" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none p-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2">
              <p className="text-xs text-black mb-1">Try asking:</p>
              <div className="flex flex-wrap gap-1">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs bg-gray-300 hover:bg-gray-200 text-black px-2 py-1 rounded-full truncate"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-gray-200"
          >
            <div className="flex">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-600 text-white rounded-r-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                <FaPaperPlane />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatBot;
