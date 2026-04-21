import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { isLoggedIn } from "../api/authAPI";
import {
  getConversationMessages,
  getMessageConversations,
  sendConversationMessage,
} from "../api/messageApi";

const IMG_URL = "http://localhost:8000/uploads/";

const getId = (value) => value?._id || value || "";
const getMessageId = (message) =>
  message?._id?.toString?.() || message?._id || "";
const getConversationKey = (conversation) =>
  conversation ? `${conversation.bookingId}:${conversation.staffRole}` : "";

const Messages = () => {
  const [auth] = useState(() => isLoggedIn());
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [isTabVisible, setIsTabVisible] = useState(() =>
    typeof document === "undefined"
      ? true
      : document.visibilityState === "visible"
  );

  const activeConversationRef = useRef(null);

  const currentUserId = auth?.user?._id ? String(auth.user._id) : "";
  const requestedBookingId = searchParams.get("bookingId");
  const requestedRole = searchParams.get("role");

  const selectedKey = getConversationKey(activeConversation);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    if (!auth) {
      navigate("/", { replace: true });
    }
  }, [auth, navigate]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const syncConversationAfterMessagesLoad = useCallback(
    (conversation, nextMessages, serverConversation = null) => {
      const targetKey = getConversationKey(conversation);
      const latestMessage =
        nextMessages.length > 0
          ? nextMessages[nextMessages.length - 1]
          : serverConversation?.lastMessage || null;

      setConversations((current) =>
        current
          .map((item) =>
            getConversationKey(item) === targetKey
              ? {
                  ...item,
                  ...(serverConversation || {}),
                  lastMessage: latestMessage || item.lastMessage || null,
                  updatedAt:
                    latestMessage?.createdAt ||
                    serverConversation?.updatedAt ||
                    item.updatedAt,
                  unreadCount: 0,
                }
              : item
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt || 0).getTime() -
              new Date(a.updatedAt || 0).getTime()
          )
      );

      setActiveConversation((current) => {
        if (!current || getConversationKey(current) !== targetKey)
          return current;

        return {
          ...current,
          ...(serverConversation || {}),
          lastMessage: latestMessage || current.lastMessage || null,
          updatedAt:
            latestMessage?.createdAt ||
            serverConversation?.updatedAt ||
            current.updatedAt,
          unreadCount: 0,
        };
      });
    },
    []
  );

  const loadMessages = useCallback(
    async (conversation, silent = false) => {
      if (!conversation) return;

      if (!silent) {
        setLoadingMessages(true);
        setError("");
      }

      try {
        const res = await getConversationMessages(
          conversation.bookingId,
          conversation.staffRole
        );

        const nextMessages = res.data || [];
        setMessages(nextMessages);

        syncConversationAfterMessagesLoad(
          conversation,
          nextMessages,
          res.conversation || null
        );
      } catch (err) {
        if (!silent) {
          setError(err.message || "Unable to load messages.");
        }
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [syncConversationAfterMessagesLoad]
  );

  const loadConversations = useCallback(
    async ({ silent = false } = {}) => {
      if (!auth) return;

      if (!silent) {
        setLoadingConversations(true);
        setError("");
      }

      try {
        const res = await getMessageConversations();
        const nextConversations = res.data || [];
        setConversations(nextConversations);

        const requestedConversation = nextConversations.find(
          (conversation) =>
            String(conversation.bookingId) === String(requestedBookingId) &&
            conversation.staffRole === requestedRole
        );

        const currentActive = activeConversationRef.current;
        const currentActiveKey = getConversationKey(currentActive);

        const refreshedActive =
          nextConversations.find(
            (conversation) =>
              getConversationKey(conversation) === currentActiveKey
          ) || null;

        const nextActive =
          refreshedActive ||
          requestedConversation ||
          nextConversations[0] ||
          null;

        setActiveConversation(nextActive);
      } catch (err) {
        if (!silent) {
          setError(err.message || "Unable to load conversations.");
        }
      } finally {
        if (!silent) setLoadingConversations(false);
      }
    },
    [auth, requestedBookingId, requestedRole]
  );

  const pollGlobalUpdates = useCallback(async () => {
    if (!auth) return;

    try {
      const res = await getMessageConversations();
      const fetchedConversations = res.data || [];

      const currentActive = activeConversationRef.current;
      const activeKey = getConversationKey(currentActive);

      const rawActiveConversation = activeKey
        ? fetchedConversations.find(
            (conversation) => getConversationKey(conversation) === activeKey
          ) || null
        : null;

      const normalizedConversations = fetchedConversations.map((conversation) =>
        getConversationKey(conversation) === activeKey
          ? { ...conversation, unreadCount: 0 }
          : conversation
      );

      setConversations(normalizedConversations);

      if (!currentActive) {
        const requestedConversation = normalizedConversations.find(
          (conversation) =>
            String(conversation.bookingId) === String(requestedBookingId) &&
            conversation.staffRole === requestedRole
        );

        const nextActive =
          requestedConversation || normalizedConversations[0] || null;

        if (nextActive) {
          setActiveConversation(nextActive);
        }

        return;
      }

      const updatedActiveConversation =
        normalizedConversations.find(
          (conversation) => getConversationKey(conversation) === activeKey
        ) || null;

      if (!updatedActiveConversation) {
        const fallbackConversation = normalizedConversations[0] || null;
        setActiveConversation(fallbackConversation);
        if (!fallbackConversation) {
          setMessages([]);
        }
        return;
      }

      if (
        JSON.stringify(updatedActiveConversation) !==
        JSON.stringify(currentActive)
      ) {
        setActiveConversation(updatedActiveConversation);
      }

      const previousLastMessageId = getMessageId(currentActive.lastMessage);
      const nextLastMessageId = getMessageId(
        rawActiveConversation?.lastMessage
      );
      const hasUnreadForActive = (rawActiveConversation?.unreadCount || 0) > 0;
      const activeConversationChanged =
        nextLastMessageId && nextLastMessageId !== previousLastMessageId;

      if (hasUnreadForActive || activeConversationChanged) {
        await loadMessages(updatedActiveConversation, true);
      }
    } catch (err) {
      console.warn("Global message polling failed:", err);
    }
  }, [auth, loadMessages, requestedBookingId, requestedRole]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }
    loadMessages(activeConversation);
  }, [selectedKey, loadMessages]);

  useEffect(() => {
    if (!auth || !isTabVisible) return;

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        pollGlobalUpdates();
      }
    }, 8000);

    return () => clearInterval(timer);
  }, [auth, isTabVisible, pollGlobalUpdates]);

  useEffect(() => {
    if (!auth || !isTabVisible) return;
    pollGlobalUpdates();
  }, [auth, isTabVisible, pollGlobalUpdates]);

  const getCounterpart = (conversation) => {
    if (!conversation) return null;

    const isTraveler = String(getId(conversation.traveler)) === currentUserId;
    return isTraveler ? conversation.staff : conversation.traveler;
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    setDraft("");
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const cleanDraft = draft.trim();
    if (!activeConversation || !cleanDraft || sending) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      text: cleanDraft,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages((current) => [...current, optimisticMessage]);
    setDraft("");
    setSending(true);
    setError("");

    try {
      const res = await sendConversationMessage({
        bookingId: activeConversation.bookingId,
        staffRole: activeConversation.staffRole,
        text: cleanDraft,
      });

      setMessages((current) =>
        current.map((msg) => (msg._id === tempId ? res.data : msg))
      );

      setConversations((current) =>
        current
          .map((conversation) =>
            getConversationKey(conversation) === selectedKey
              ? {
                  ...conversation,
                  lastMessage: res.data,
                  updatedAt: res.data.createdAt,
                  unreadCount: 0,
                }
              : conversation
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt || 0).getTime() -
              new Date(a.updatedAt || 0).getTime()
          )
      );

      setActiveConversation((current) =>
        current
          ? {
              ...current,
              lastMessage: res.data,
              updatedAt: res.data.createdAt,
              unreadCount: 0,
            }
          : current
      );
    } catch (err) {
      setMessages((current) => current.filter((msg) => msg._id !== tempId));
      setDraft(cleanDraft);
      setError(err.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Login Required
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Please login to view your trek messages.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-3 bg-[#004d4d] text-white rounded-xl font-bold text-sm"
          >
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  const activeCounterpart = getCounterpart(activeConversation);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#bd8157]">
              Trek Messages
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              Chat with your booked guide or porter
            </h1>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:border-[#004d4d]/40 transition-colors"
          >
            <i className="bi bi-arrow-left" />
            Profile
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[720px]">
          {/* ── SIDEBAR ── */}
          <aside className="border-b lg:border-b-0 lg:border-r border-slate-100">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800">
                Conversations
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Only bookings with an assigned guide or porter appear here.
              </p>
            </div>

            <div className="max-h-[320px] lg:max-h-[650px] overflow-y-auto">
              {loadingConversations ? (
                <div className="p-6 text-sm text-slate-400 font-bold animate-pulse">
                  Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <i className="bi bi-chat-dots text-slate-400 text-xl" />
                  </div>
                  <p className="text-sm font-bold text-slate-600">
                    No chat is available yet.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Book a guide or porter to start messaging.
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const counterpart = getCounterpart(conversation);
                  const conversationKey = `${conversation.bookingId}:${conversation.staffRole}`;
                  const isActive = conversationKey === selectedKey;

                  return (
                    <button
                      key={conversationKey}
                      type="button"
                      onClick={() => handleSelectConversation(conversation)}
                      className={`w-full text-left p-4 border-b border-slate-100 transition-colors ${
                        isActive
                          ? "bg-[#004d4d]/5"
                          : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          {counterpart?.image ? (
                            <img
                              src={`${IMG_URL}${counterpart.image}`}
                              alt={counterpart.username || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <i className="bi bi-person text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-black text-slate-800 truncate">
                                {counterpart?.username || "Trek Partner"}
                              </p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#bd8157]">
                                {conversation.staffRole}
                              </p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-[#004d4d] text-white min-w-6 h-6 px-2 rounded-full text-[10px] font-black flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-1">
                            {conversation.destination?.title || "Booked trek"}
                          </p>
                          <p className="text-xs text-slate-400 truncate mt-1">
                            {conversation.lastMessage?.text ||
                              "Start the conversation"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* ── CHAT PANEL ── */}
          <section className="flex flex-col h-[650px] min-h-[620px]">
            {activeConversation ? (
              <>
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      {activeCounterpart?.image ? (
                        <img
                          src={`${IMG_URL}${activeCounterpart.image}`}
                          alt={activeCounterpart.username || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="bi bi-person text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-black text-slate-900 truncate">
                        {activeCounterpart?.username || "Trek Partner"}
                      </h2>
                      <p className="text-xs text-slate-400 font-semibold truncate">
                        {activeConversation.staffRole} for{" "}
                        {activeConversation.destination?.title || "your trek"}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase">
                    {activeConversation.status}
                  </span>
                </div>

                {/* Messages — plain overflow scroll */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70">
                  {loadingMessages ? (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400 font-bold animate-pulse">
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center">
                      <div>
                        <div className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center mx-auto mb-3">
                          <i className="bi bi-send text-[#004d4d] text-xl" />
                        </div>
                        <p className="font-black text-slate-700">
                          No messages yet.
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Send the first note for this booked service.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const fromMe =
                          String(getId(message.senderId)) === currentUserId;

                        return (
                          <div
                            key={message._id}
                            className={`flex ${
                              fromMe ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[82%] sm:max-w-[68%] px-4 py-3 rounded-2xl shadow-sm ${
                                fromMe
                                  ? "bg-[#004d4d] text-white rounded-br-md"
                                  : "bg-white text-slate-700 border border-slate-100 rounded-bl-md"
                              } ${
                                message.isOptimistic ? "opacity-70 italic" : ""
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {message.text}
                              </p>
                              <p
                                className={`text-[10px] font-semibold mt-2 ${
                                  fromMe ? "text-white/60" : "text-slate-400"
                                }`}
                              >
                                {message.isOptimistic
                                  ? "Sending..."
                                  : formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Input */}
                <form
                  onSubmit={handleSend}
                  className="p-4 sm:p-5 border-t border-slate-100 bg-white"
                >
                  <div className="flex items-end gap-3">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                      placeholder="Type your message..."
                      rows={2}
                      maxLength={2000}
                      className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#004d4d] focus:bg-white transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={sending || !draft.trim()}
                      className="h-12 w-12 rounded-xl bg-[#004d4d] text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      title="Send message"
                    >
                      <i className="bi bi-send-fill" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8 bg-slate-50/70">
                <div>
                  <div className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center mx-auto mb-4">
                    <i className="bi bi-chat-left-text text-[#004d4d] text-2xl" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800">
                    Select a conversation
                  </h2>
                  <p className="text-sm text-slate-400 mt-2 max-w-sm">
                    Your chats are limited to the guide or porter assigned to
                    your own booking.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Messages;
