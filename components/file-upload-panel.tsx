"use client"

import { X, ImageIcon, Video, FileText } from "lucide-react"

interface FileUploadPanelProps {
  onClose: () => void
}

export default function FileUploadPanel({ onClose }: FileUploadPanelProps) {
  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Upload Files</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 cursor-pointer transition-colors">
            <ImageIcon className="w-6 h-6 text-slate-600 dark:text-slate-400 mb-2" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Images</span>
            <input type="file" accept="image/*" className="hidden" />
          </label>

          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 cursor-pointer transition-colors">
            <Video className="w-6 h-6 text-slate-600 dark:text-slate-400 mb-2" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Videos</span>
            <input type="file" accept="video/*" className="hidden" />
          </label>

          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 cursor-pointer transition-colors">
            <FileText className="w-6 h-6 text-slate-600 dark:text-slate-400 mb-2" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Documents</span>
            <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" />
          </label>
        </div>
      </div>
    </div>
  )
}
