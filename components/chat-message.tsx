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

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      <div
        className={`max-w-2xl rounded-2xl px-4 py-3 ${
          isUser ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-slate-800 text-white" // Changed to darker grey background with white text
        }`}
        onMouseEnter={() => !isUser && setShowOptions(true)}
        onMouseLeave={() => !isUser && setShowOptions(false)}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>

        {!isUser && showOptions && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              title="Copy"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>

            <button
              onClick={() => setMarked(!marked)}
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                marked ? "bg-yellow-500 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"
              }`}
              title="Mark"
            >
              <Flag className="w-3 h-3" />
              {marked ? "Marked" : "Mark"}
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                saved ? "bg-cyan-500 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"
              }`}
              title="Save"
            >
              <Bookmark className="w-3 h-3" />
              {saved ? "Saved" : "Save"}
            </button>

            {message.type !== "text" && (
              <button
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                title="Download"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
