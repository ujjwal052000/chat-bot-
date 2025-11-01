"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Menu, Mic, Paperclip, MoreVertical, Clock } from "lucide-react"
import ChatMessage from "@/components/chat-message"
import Sidebar from "@/components/sidebar"
import ChatHeaderMenu from "@/components/chat-header-menu"
import FileUploadPanel from "@/components/file-upload-panel"
import { clsx } from 'clsx';

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  type?: "text" | "image" | "video" | "file"
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  isTemporary?: boolean
  categoryId?: string
}

interface Category {
  id: string
  name: string
  chatIds: string[]
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showFilePanel, setShowFilePanel] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showHeaderMenu, setShowHeaderMenu] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const headerMenuRef = useRef<HTMLDivElement>(null)

  const currentConversation = conversations.find((c) => c.id === currentConversationId)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target as Node)) {
        setShowHeaderMenu(false)
      }
    }

    if (showHeaderMenu) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showHeaderMenu])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Ensure there is an active conversation on first load
  useEffect(() => {
    if (!currentConversationId && conversations.length === 0) {
      createNewConversation()
    }
  }, [])

  const createNewConversation = (isTemporary = false) => {
    const newId = Date.now().toString()
    const newConversation: Conversation = {
      id: newId,
      title: isTemporary ? "Temporary Chat" : "New conversation",
      messages: [],
      createdAt: new Date(),
      isTemporary,
    }
    setConversations([newConversation, ...conversations])
    setCurrentConversationId(newId)
    setMessages([])
  }

  const selectConversation = (id: string) => {
    setCurrentConversationId(id)
    const conv = conversations.find((c) => c.id === id)
    setMessages(conv?.messages || [])
  }

  const updateConversationTitle = (id: string, newTitle: string) => {
    setConversations(conversations.map((conv) => (conv.id === id ? { ...conv, title: newTitle } : conv)))
  }

  const deleteConversation = (id: string) => {
    const filtered = conversations.filter((c) => c.id !== id)
    setConversations(filtered)

    setCategories(
      categories
        .map((cat) => ({
          ...cat,
          chatIds: cat.chatIds.filter((chatId) => chatId !== id),
        }))
        .filter((cat) => cat.chatIds.length > 0),
    )

    if (currentConversationId === id) {
      setCurrentConversationId(filtered[0]?.id || null)
      setMessages(filtered[0]?.messages || [])
    }
  }

  const handleCreateCategory = (chatId1: string, chatId2: string, categoryName: string) => {
    const categoryId = Date.now().toString()
    const newCategory: Category = {
      id: categoryId,
      name: categoryName,
      chatIds: [chatId1, chatId2],
    }

    setCategories([...categories, newCategory])

    // Update conversations to assign category
    setConversations(
      conversations.map((conv) => {
        if (conv.id === chatId1 || conv.id === chatId2) {
          return { ...conv, categoryId }
        }
        return conv
      }),
    )
  }

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser")
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("")
      setInput(transcript)
    }

    recognition.start()
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !currentConversationId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
      type: "text",
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      let data: any = null
      if (!res.ok) {
        // Try to read error payload for better debugging in console
        try {
          data = await res.json()
        } catch {
          /* ignore */
        }
        console.error("/api/chat failed", res.status, data)
        throw new Error(`API error: ${res.status}`)
      }
      data = await res.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply || "",
        role: "assistant",
        timestamp: new Date(),
        type: "text",
      }

      const updatedMessages = [...newMessages, assistantMessage]
      setMessages(updatedMessages)

      setConversations(
        conversations.map((conv) => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              messages: updatedMessages,
              title: conv.title === "New conversation" ? userMessage.content.slice(0, 30) : conv.title,
            }
          }
          return conv
        }),
      )
    } catch (error: any) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I couldn't get a response right now.",
        role: "assistant",
        timestamp: new Date(),
        type: "text",
      }
      setMessages([...newMessages, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Quick Reply Suggestions
  const quickReplies = [
    "Hello!",
    "Show FAQs",
    "Talk to a human",
    "Pricing plans"
  ];

  const handleQuickReply = (msg: string) => {
    setInput(msg);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        categories={categories}
        currentConversationId={currentConversationId}
        onSelectConversation={selectConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        onCreateCategory={handleCreateCategory}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Menu className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">CB</span>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-foreground">{currentConversation?.title || "Cool Buddy"}</h1>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
                {currentConversation?.isTemporary && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> Temporary
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="relative" ref={headerMenuRef}>
            <button
              onClick={() => setShowHeaderMenu(!showHeaderMenu)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
            {showHeaderMenu && (
              <ChatHeaderMenu
                onEditTitle={() => {
                  const newTitle = prompt("Enter new chat name:", currentConversation?.title)
                  if (newTitle && currentConversationId) {
                    updateConversationTitle(currentConversationId, newTitle)
                  }
                  setShowHeaderMenu(false)
                }}
                onClose={() => setShowHeaderMenu(false)}
              />
            )}
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-center px-4">
                <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-white font-bold text-4xl">AI</span>
                </div>
                <h2 className="text-4xl font-bold text-foreground mb-3">Hey there!</h2>
                <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
                  I'm your AI assistant. Ask me anything, upload files, or use voice to chat. Let's create something amazing!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
                {/* Typing indicator when loading */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-xl px-5 py-4 bg-card border border-border max-w-[80%] shadow-sm flex items-end gap-3">
                      <div className="flex flex-row gap-1 items-center">
                        <span className="block w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                        <span className="block w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '120ms'}}></span>
                        <span className="block w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '240ms'}}></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Quick Reply Suggestions */}
        <div className="max-w-3xl mx-auto flex gap-2 flex-wrap px-4 pb-1">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              className="px-4 py-2 rounded-full bg-muted border border-border text-foreground text-sm hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors duration-150 shadow-sm"
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </button>
          ))}
        </div>

        {/* File Upload Panel */}
        {showFilePanel && <FileUploadPanel onClose={() => setShowFilePanel(false)} />}

        {/* Input Area */}
        <div className="border-t border-border bg-card px-6 py-6">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
            <div className="flex gap-2 items-center bg-muted rounded-2xl px-4 py-3 border border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <button
                type="button"
                onClick={() => setShowFilePanel(!showFilePanel)}
                className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-2 rounded-lg transition-colors ${
                  isListening ? "bg-red-500 text-white" : "hover:bg-accent text-muted-foreground"
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={!currentConversationId || isLoading}
                className="flex-1 bg-transparent border-0 px-2 py-2 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              />
              <Button
                type="submit"
                disabled={!input.trim() || !currentConversationId || isLoading}
                size="icon"
                className="rounded-xl w-11 h-11 bg-primary text-white hover:bg-primary/90 shadow-md transition-all"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
