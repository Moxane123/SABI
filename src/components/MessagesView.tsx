import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  ExternalLink,
  MoreVertical,
  Trash2,
  Ban,
  Flag,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  Compass,
  AlertTriangle,
  X,
  Lock,
} from 'lucide-react';
import { UserProfile, Conversation, Message } from '../types';
import { db } from '../services/db';

interface MessagesViewProps {
  currentUser: UserProfile | null;
  selectedConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
  onViewProofProfile: (user: UserProfile) => void;
  onGoToDiscover: () => void;
  onPromptAuth: (reason?: string) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  selectedConversationId,
  onSelectConversation,
  onViewProofProfile,
  onGoToDiscover,
  onPromptAuth,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeMenuOpen, setActiveMenuOpen] = useState(false);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate behavior');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load and subscribe to real-time conversation updates
  const loadConversations = () => {
    if (!currentUser) {
      setConversations([]);
      return;
    }
    db.ensureStarterConversation(currentUser.id);
    const convs = db.getConversationsForUser(currentUser.id);
    setConversations(convs);

    // If a conversation is selected, ensure it still exists
    if (selectedConversationId) {
      const exists = convs.some((c) => c.id === selectedConversationId);
      if (!exists && convs.length > 0) {
        // keep selected if loaded
      }
    }
  };

  useEffect(() => {
    loadConversations();
    const unsubscribe = db.subscribeToMessages(() => {
      loadConversations();
      if (selectedConversationId && currentUser) {
        const msgs = db.getMessages(selectedConversationId, currentUser.id);
        setMessages(msgs);
      }
    });
    return () => unsubscribe();
  }, [currentUser, selectedConversationId]);

  // Load messages for currently active conversation
  useEffect(() => {
    if (!currentUser || !selectedConversationId) {
      setMessages([]);
      return;
    }

    const msgs = db.getMessages(selectedConversationId, currentUser.id);
    setMessages(msgs);

    // Mark as read immediately
    db.markConversationAsRead(selectedConversationId, currentUser.id);

    // Focus input on selection
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  }, [selectedConversationId, currentUser]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // If user is not logged in, prompt authentication
  if (!currentUser) {
    return (
      <div className="py-12 px-4 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#EAF3EF] text-[#2D4D45] flex items-center justify-center mx-auto mb-5 border border-[#CFE2D9] shadow-xs">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#16222F] mb-3">
          SABI Professional Messaging
        </h2>
        <p className="text-sm text-[#5A6872] leading-relaxed mb-6">
          Connect directly with professionals after reviewing their documented proof and verified deliverables.
          Sign in or create an account to start private, professional conversations.
        </p>
        <button
          onClick={() => onPromptAuth('Sign in or create an account to message professionals.')}
          className="px-6 py-3 bg-[#2D4D45] hover:bg-[#203731] text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Sign In to Access Messaging
        </button>
      </div>
    );
  }

  // Determine current active conversation object & other participant
  const activeConversation = selectedConversationId
    ? conversations.find((c) => c.id === selectedConversationId) ||
      db.getConversationById(selectedConversationId, currentUser.id)
    : null;

  const otherParticipantId = activeConversation
    ? activeConversation.participantIds.find((id) => id !== currentUser.id)
    : null;

  const otherParticipantUser: UserProfile | null = otherParticipantId
    ? db.getUserById(otherParticipantId)
    : null;

  const isBlockedByMe = otherParticipantId
    ? db.isBlockedBy(currentUser.id, otherParticipantId)
    : false;

  const isBlockedByOther = otherParticipantId
    ? db.isBlockedBy(otherParticipantId, currentUser.id)
    : false;

  const isAnyBlocked = isBlockedByMe || isBlockedByOther;

  // Filter conversations by search term
  const filteredConversations = conversations.filter((conv) => {
    const otherId = conv.participantIds.find((id) => id !== currentUser.id);
    if (!otherId) return false;
    const user = db.getUserById(otherId);
    if (!user) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      user.fullName.toLowerCase().includes(q) ||
      (user.profession && user.profession.toLowerCase().includes(q)) ||
      (conv.lastMessageContent && conv.lastMessageContent.toLowerCase().includes(q))
    );
  });

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedConversationId || !newMessageText.trim() || isSending || isAnyBlocked) return;

    try {
      setIsSending(true);
      db.sendMessage(selectedConversationId, currentUser.id, newMessageText.trim());
      setNewMessageText('');
      const updated = db.getMessages(selectedConversationId, currentUser.id);
      setMessages(updated);
      loadConversations();
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleHideConversation = () => {
    if (!selectedConversationId) return;
    db.hideOrDeleteConversation(selectedConversationId, currentUser.id);
    setIsHideModalOpen(false);
    setActiveMenuOpen(false);
    onSelectConversation(null);
    loadConversations();
  };

  const handleToggleBlock = () => {
    if (!otherParticipantId) return;
    if (isBlockedByMe) {
      db.unblockUser(currentUser.id, otherParticipantId);
    } else {
      db.blockUser(currentUser.id, otherParticipantId);
    }
    setIsBlockModalOpen(false);
    setActiveMenuOpen(false);
    loadConversations();
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otherParticipantId || !selectedConversationId) return;
    db.reportUser(
      currentUser.id,
      otherParticipantId,
      selectedConversationId,
      reportReason,
      reportDetails
    );
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setIsReportModalOpen(false);
      setActiveMenuOpen(false);
      setReportDetails('');
    }, 1800);
  };

  // Helper formatting for timestamps
  const formatTimestamp = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (3600 * 1000));

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24 && date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="pb-16">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#16222F] tracking-tight">
            Messages
          </h1>
          <p className="text-xs text-[#5A6872] mt-0.5">
            Private, professional connections initiated through documented proof.
          </p>
        </div>
      </div>

      {/* Main Messaging Container */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] shadow-xs overflow-hidden flex flex-col md:grid md:grid-cols-12 min-h-[580px] h-[calc(100vh-220px)] max-h-[780px]">
        
        {/* =================================================================== */}
        {/* LEFT COLUMN: CONVERSATION LIST (Hidden on mobile if chat is open) */}
        {/* =================================================================== */}
        <div
          className={`${
            selectedConversationId ? 'hidden md:flex' : 'flex'
          } md:col-span-4 lg:col-span-5 flex-col border-r border-[#E7E2D8] bg-[#FAF8F5]/40 h-full overflow-hidden`}
        >
          {/* Search / Filter Bar */}
          <div className="p-3 border-b border-[#E7E2D8] bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-[#16222F] placeholder-stone-400 focus:outline-none focus:border-[#2D4D45] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E7E2D8]/60">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-[#16222F] mb-1">
                  No conversations yet
                </h3>
                <p className="text-[11px] text-[#7A8690] max-w-[220px] mb-4 leading-relaxed">
                  Discover professionals through their documented work and connect when you find verified talent.
                </p>
                <button
                  onClick={onGoToDiscover}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2D4D45] hover:bg-[#203731] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>Explore Discover</span>
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const otherId = conv.participantIds.find((id) => id !== currentUser.id);
                const otherUser = otherId ? db.getUserById(otherId) : null;
                const isSelected = selectedConversationId === conv.id;
                const isUnread =
                  !conv.lastMessageIsRead && conv.lastMessageSenderId !== currentUser.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#EAF3EF] border-l-3 border-[#2D4D45]'
                        : isUnread
                        ? 'bg-white hover:bg-stone-50 font-semibold'
                        : 'bg-white/70 hover:bg-stone-50'
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="relative shrink-0">
                      {otherUser?.profilePhoto ? (
                        <img
                          src={otherUser.profilePhoto}
                          alt={otherUser.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-stone-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#4D7A70] text-white font-bold text-xs flex items-center justify-center border border-stone-200">
                          {otherUser?.fullName ? otherUser.fullName.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      {isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#2D4D45] rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1 mb-0.5">
                        <p
                          className={`text-xs truncate ${
                            isUnread || isSelected
                              ? 'font-bold text-[#16222F]'
                              : 'font-semibold text-[#2D3530]'
                          }`}
                        >
                          {otherUser?.fullName || 'Professional'}
                        </p>
                        <span className="text-[10px] text-[#7A8690] shrink-0">
                          {formatTimestamp(conv.lastMessageDate)}
                        </span>
                      </div>

                      {otherUser?.profession && (
                        <p className="text-[10px] text-[#4D7A70] font-medium truncate mb-1">
                          {otherUser.profession}
                        </p>
                      )}

                      <p
                        className={`text-xs truncate ${
                          isUnread
                            ? 'text-[#16222F] font-semibold'
                            : 'text-[#5A6872]'
                        }`}
                      >
                        {conv.lastMessageSenderId === currentUser.id && (
                          <span className="text-[#7A8690] font-normal">You: </span>
                        )}
                        {conv.lastMessageContent || 'Started a conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: ACTIVE CHAT SCREEN */}
        {/* =================================================================== */}
        <div
          className={`${
            !selectedConversationId ? 'hidden md:flex' : 'flex'
          } md:col-span-8 lg:col-span-7 flex-col h-full bg-white relative`}
        >
          {activeConversation && otherParticipantUser ? (
            <>
              {/* Chat Top Bar */}
              <div className="p-3.5 px-4 border-b border-[#E7E2D8] flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => onSelectConversation(null)}
                    className="md:hidden p-1 text-stone-500 hover:text-stone-800 rounded-lg"
                    aria-label="Back to inbox"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {/* Profile Picture */}
                  {otherParticipantUser.profilePhoto ? (
                    <img
                      src={otherParticipantUser.profilePhoto}
                      alt={otherParticipantUser.fullName}
                      className="w-9 h-9 rounded-full object-cover border border-stone-200 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#4D7A70] text-white font-bold text-xs flex items-center justify-center border border-stone-200 shrink-0">
                      {otherParticipantUser.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Name & Profession */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-xs sm:text-sm font-bold text-[#16222F] truncate">
                        {otherParticipantUser.fullName}
                      </h2>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Active" />
                    </div>
                    <p className="text-[11px] text-[#5A6872] truncate">
                      {otherParticipantUser.profession || 'Professional'}
                    </p>
                  </div>
                </div>

                {/* Right Action Bar */}
                <div className="flex items-center gap-1.5">
                  {/* View SABI Proof Profile Button */}
                  <button
                    onClick={() => onViewProofProfile(otherParticipantUser)}
                    className="px-2.5 py-1.5 bg-stone-100 hover:bg-[#EAF3EF] text-[#2D4D45] text-xs font-semibold rounded-xl border border-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Inspect their documented work deliverables"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4D7A70]" />
                    <span className="hidden sm:inline">View Proof Profile</span>
                  </button>

                  {/* Options Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuOpen(!activeMenuOpen)}
                      className="p-1.5 text-stone-500 hover:text-[#16222F] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      aria-label="Conversation settings"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-30 text-xs text-[#16222F]">
                        <button
                          onClick={() => {
                            setActiveMenuOpen(false);
                            setIsHideModalOpen(true);
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-stone-50 flex items-center gap-2 text-stone-600"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-stone-400" />
                          <span>Hide Conversation</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveMenuOpen(false);
                            setIsBlockModalOpen(true);
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-stone-50 flex items-center gap-2 text-stone-600"
                        >
                          <Ban className="w-3.5 h-3.5 text-stone-400" />
                          <span>
                            {isBlockedByMe ? `Unblock ${otherParticipantUser.fullName.split(' ')[0]}` : `Block ${otherParticipantUser.fullName.split(' ')[0]}`}
                          </span>
                        </button>

                        <div className="border-t border-stone-100 my-1" />

                        <button
                          onClick={() => {
                            setActiveMenuOpen(false);
                            setIsReportModalOpen(true);
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                        >
                          <Flag className="w-3.5 h-3.5 text-rose-500" />
                          <span>Report Conversation</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Discovery Context Banner */}
              <div className="bg-[#FAF8F5] border-b border-[#E7E2D8] px-4 py-2 text-[11px] text-[#5A6872] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#D4A359] shrink-0" />
                  <span>
                    You connected with <strong>{otherParticipantUser.fullName}</strong> through SABI.
                  </span>
                </div>
                <button
                  onClick={() => onViewProofProfile(otherParticipantUser)}
                  className="font-semibold text-[#2D4D45] hover:underline flex items-center gap-0.5 shrink-0"
                >
                  Review Proof <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]/30">
                {messages.length === 0 ? (
                  <div className="py-12 text-center text-stone-400 text-xs">
                    <p className="font-medium text-[#16222F] mb-1">
                      Start your conversation with {otherParticipantUser.fullName}
                    </p>
                    <p className="text-[11px] text-[#7A8690] max-w-sm mx-auto">
                      All SABI conversations are private and 1-to-1. Discuss project timelines, scope, or collaboration opportunities.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                      <div
                        key={msg.id || index}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs whitespace-pre-wrap leading-relaxed ${
                            isMe
                              ? 'bg-[#2D4D45] text-white rounded-br-xs'
                              : 'bg-white text-[#16222F] border border-[#E7E2D8] rounded-bl-xs'
                          }`}
                        >
                          {msg.content}
                        </div>

                        {/* Timestamp & Read Tick */}
                        <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-stone-400">
                          <span>
                            {new Date(msg.sentDate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && (
                            <span>
                              {msg.readStatus ? (
                                <span title="Read">
                                  <CheckCheck className="w-3 h-3 text-[#4D7A70]" />
                                </span>
                              ) : (
                                <span title="Delivered">
                                  <Check className="w-3 h-3 text-stone-400" />
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Blocked Alert Banner */}
              {isAnyBlocked && (
                <div className="p-3 bg-amber-50 border-t border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {isBlockedByMe
                        ? `You have blocked ${otherParticipantUser.fullName}.`
                        : 'Messaging is unavailable with this user.'}
                    </span>
                  </div>
                  {isBlockedByMe && (
                    <button
                      onClick={handleToggleBlock}
                      className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-amber-900 font-semibold text-[11px] hover:bg-amber-100"
                    >
                      Unblock
                    </button>
                  )}
                </div>
              )}

              {/* Message Input Bar */}
              {!isAnyBlocked ? (
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-[#E7E2D8] bg-white flex items-end gap-2"
                >
                  <div className="flex-1 min-h-[40px] bg-stone-50 border border-stone-200 rounded-xl focus-within:border-[#2D4D45] focus-within:bg-white transition-colors">
                    <textarea
                      ref={inputRef}
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Write a professional message to ${otherParticipantUser.fullName.split(' ')[0]}...`}
                      rows={1}
                      className="w-full px-3.5 py-2.5 text-xs text-[#16222F] placeholder-stone-400 bg-transparent resize-none focus:outline-none max-h-32"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!newMessageText.trim() || isSending}
                    className="p-2.5 bg-[#2D4D45] hover:bg-[#203731] disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl shadow-2xs transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0 active:scale-95"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : null}
            </>
          ) : (
            /* Empty State when no conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF8F5]/30">
              <div className="w-16 h-16 rounded-3xl bg-[#EAF3EF] text-[#2D4D45] flex items-center justify-center mb-4 border border-[#CFE2D9]">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-[#16222F] mb-1">
                Select a conversation
              </h2>
              <p className="text-xs text-[#5A6872] max-w-sm mb-5 leading-relaxed">
                Connect directly with verified professionals based on documented deliverables, client confirmations, and proven skills.
              </p>
              <button
                onClick={onGoToDiscover}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D4D45] hover:bg-[#203731] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#D4A359]" />
                <span>Browse Verified Professionals in Discover</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL: REPORT CONVERSATION */}
      {/* =================================================================== */}
      {isReportModalOpen && otherParticipantUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 text-rose-600 mb-3">
              <Flag className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#16222F]">
                Report Conversation
              </h3>
            </div>

            {reportSubmitted ? (
              <div className="py-6 text-center text-emerald-700">
                <Check className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <p className="text-sm font-bold">Report Submitted</p>
                <p className="text-xs text-stone-500 mt-1">
                  Thank you for keeping SABI a trusted, professional platform.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit}>
                <p className="text-xs text-[#5A6872] mb-4">
                  Help us understand why you are reporting your conversation with{' '}
                  <strong>{otherParticipantUser.fullName}</strong>:
                </p>

                <div className="space-y-2 mb-4">
                  {[
                    'Spam or commercial solicitation',
                    'Inappropriate or unprofessional behavior',
                    'Harassment or offensive language',
                    'Misrepresentation of work or identity',
                    'Other concern',
                  ].map((reason) => (
                    <label
                      key={reason}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-stone-50 text-xs cursor-pointer border border-transparent has-checked:border-[#2D4D45] has-checked:bg-[#EAF3EF]/40"
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        checked={reportReason === reason}
                        onChange={() => setReportReason(reason)}
                        className="text-[#2D4D45] focus:ring-[#2D4D45]"
                      />
                      <span className="text-[#16222F]">{reason}</span>
                    </label>
                  ))}
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-semibold text-[#16222F] mb-1">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide context or specifics..."
                    rows={3}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#2D4D45] focus:bg-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: BLOCK CONFIRMATION */}
      {/* =================================================================== */}
      {isBlockModalOpen && otherParticipantUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200 relative">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Ban className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-bold text-[#16222F] mb-1.5">
              {isBlockedByMe
                ? `Unblock ${otherParticipantUser.fullName}?`
                : `Block ${otherParticipantUser.fullName}?`}
            </h3>

            <p className="text-xs text-[#5A6872] leading-relaxed mb-5">
              {isBlockedByMe
                ? 'Unblocking will allow this user to send you messages again.'
                : 'Blocked users will not be able to send you messages or contact you.'}
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBlockModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleBlock}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                  isBlockedByMe
                    ? 'bg-[#2D4D45] text-white hover:bg-[#203731]'
                    : 'bg-rose-600 text-white hover:bg-rose-700'
                }`}
              >
                {isBlockedByMe ? 'Confirm Unblock' : 'Confirm Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: HIDE CONVERSATION */}
      {/* =================================================================== */}
      {isHideModalOpen && otherParticipantUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200 relative">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-bold text-[#16222F] mb-1.5">
              Hide this conversation?
            </h3>

            <p className="text-xs text-[#5A6872] leading-relaxed mb-5">
              This conversation will be hidden from your inbox. If {otherParticipantUser.fullName} sends you a new message, it will reappear.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsHideModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleHideConversation}
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
              >
                Hide Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
