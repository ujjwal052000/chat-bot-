"use client"

import { Edit2, Flag, FileText, ImageIcon, Video } from "lucide-react"
import { useState } from "react"

interface ChatHeaderMenuProps {
  onEditTitle: () => void
  onClose: () => void
}

export default function ChatHeaderMenu({ onEditTitle, onClose }: ChatHeaderMenuProps) {
  const [showGeneratedFiles, setShowGeneratedFiles] = useState(false)

  return (
    <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-48">
      <button
        onClick={() => {
          onEditTitle()
          onClose()
        }}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
      >
        <Edit2 className="w-4 h-4" />
        Edit Chat Name
      </button>

      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors border-t border-border">
        <Flag className="w-4 h-4" />
        Marked
      </button>

      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
        <FileText className="w-4 h-4" />
        Saved Files
      </button>

      <div className="border-t border-border">
        <button
          onClick={() => setShowGeneratedFiles(!showGeneratedFiles)}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
        >
          <FileText className="w-4 h-4" />
          Generated Files
          <span className="ml-auto text-xs">→</span>
        </button>

        {showGeneratedFiles && (
          <div className="bg-muted border-t border-border">
            <button className="w-full flex items-center gap-3 px-6 py-2 text-sm text-foreground hover:bg-muted/80 transition-colors">
              <ImageIcon className="w-4 h-4" />
              Images
            </button>
            <button className="w-full flex items-center gap-3 px-6 py-2 text-sm text-foreground hover:bg-muted/80 transition-colors">
              <Video className="w-4 h-4" />
              Videos
            </button>
            <button className="w-full flex items-center gap-3 px-6 py-2 text-sm text-foreground hover:bg-muted/80 transition-colors">
              <FileText className="w-4 h-4" />
              Documents
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
