"use client"

import { X, ImageIcon, Video, FileText } from "lucide-react"

interface FileUploadPanelProps {
  onClose: () => void
}

export default function FileUploadPanel({ onClose }: FileUploadPanelProps) {
  return (
    <div className="border-t border-border bg-card px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Upload Files</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl hover:border-primary cursor-pointer transition-colors bg-muted/50">
            <ImageIcon className="w-8 h-8 text-muted-foreground mb-3" />
            <span className="text-sm font-medium text-foreground">Images</span>
            <input type="file" accept="image/*" className="hidden" />
          </label>

          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl hover:border-primary cursor-pointer transition-colors bg-muted/50">
            <Video className="w-8 h-8 text-muted-foreground mb-3" />
            <span className="text-sm font-medium text-foreground">Videos</span>
            <input type="file" accept="video/*" className="hidden" />
          </label>

          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl hover:border-primary cursor-pointer transition-colors bg-muted/50">
            <FileText className="w-8 h-8 text-muted-foreground mb-3" />
            <span className="text-sm font-medium text-foreground">Documents</span>
            <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" />
          </label>
        </div>
      </div>
    </div>
  )
}
