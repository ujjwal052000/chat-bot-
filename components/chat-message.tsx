"use client"

import { Copy, Check, Bookmark, Flag, Download } from "lucide-react"
import { useState } from "react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  type?: "text" | "image" | "video" | "file"
}

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [marked, setMarked] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUser = message.role === "user"
  
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).format(date)
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      <div className={`flex items-start gap-3 max-w-3xl w-full ${isUser ? "flex-row-reverse" : ""}`}>
        {!isUser && (
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-white">AI</span>
          </div>
        )}
        <div className="flex-1 flex flex-col gap-2">
          <div
            className={`rounded-xl px-4 py-3 ${
              isUser 
                ? "bg-primary text-white ml-auto max-w-[90%] shadow-sm" 
                : "bg-card border border-border max-w-full shadow-sm"
            }`}
            onMouseEnter={() => !isUser && setShowOptions(true)}
            onMouseLeave={() => !isUser && setShowOptions(false)}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
            
            {!isUser && showOptions && (
              <div className="mt-3 flex items-center gap-2 flex-wrap pt-3 border-t border-border">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  title="Copy"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>

                <button
                  onClick={() => setMarked(!marked)}
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                    marked 
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" 
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                  title="Mark"
                >
                  <Flag className="w-3.5 h-3.5" />
                  {marked ? "Marked" : "Mark"}
                </button>

                <button
                  onClick={() => setSaved(!saved)}
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                    saved 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" 
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                  title="Save"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
                  {saved ? "Saved" : "Save"}
                </button>

                {message.type !== "text" && (
                  <button
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                )}
              </div>
            )}
          </div>
          <div className={`flex items-center gap-2 text-xs text-muted-foreground px-2 ${isUser ? "justify-end" : "justify-start"}`}>
            <span>{formatTime(message.timestamp)}</span>
          </div>
        </div>
        {isUser && (
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-white">U</span>
          </div>
        )}
      </div>
    </div>
  )
}
