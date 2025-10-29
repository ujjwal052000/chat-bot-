"use client"

import type React from "react"

import {
  Plus,
  X,
  Search,
  LogOut,
  User,
  Zap,
  FolderOpen,
  Settings,
  ChevronDown,
  Clock,
  Save,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useState, useRef, useEffect } from "react"

interface Conversation {
  id: string
  title: string
  createdAt: Date
  isTemporary?: boolean
  categoryId?: string
}

interface Category {
  id: string
  name: string
  chatIds: string[]
}

interface SidebarProps {
  conversations: Conversation[]
  categories: Category[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: (isTemporary?: boolean) => void
  onDeleteConversation: (id: string) => void
  onCreateCategory: (chatId1: string, chatId2: string, categoryName: string) => void
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({
  conversations,
  categories,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onCreateCategory,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showProfile, setShowProfile] = useState(false)
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null)
  const [showSaveMenu, setShowSaveMenu] = useState<string | null>(null)
  const [draggedChatId, setDraggedChatId] = useState<string | null>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [dragTarget, setDragTarget] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const profileRef = useRef<HTMLDivElement>(null)
  const saveMenuRef = useRef<HTMLDivElement>(null)

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const uncategorizedChats = filteredConversations.filter((conv) => !conv.categoryId)

  const handleDragStart = (e: React.DragEvent, chatId: string) => {
    setDraggedChatId(chatId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetChatId: string) => {
    e.preventDefault()
    if (draggedChatId && draggedChatId !== targetChatId) {
      setDragTarget(targetChatId)
      setShowCategoryModal(true)
    }
    setDraggedChatId(null)
  }

  const handleCreateCategory = () => {
    if (categoryName.trim() && draggedChatId && dragTarget) {
      onCreateCategory(draggedChatId, dragTarget, categoryName)
      setCategoryName("")
      setShowCategoryModal(false)
      setDragTarget(null)
    }
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
    }

    if (showProfile) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showProfile])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (saveMenuRef.current && !saveMenuRef.current.contains(event.target as Node)) {
        setShowSaveMenu(null)
      }
    }

    if (showSaveMenu) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSaveMenu])

  if (!isOpen) return null

  return (
    <div className="w-72 border-r border-border bg-card flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CB</span>
          </div>
          <h2 className="font-bold text-foreground">Cool Buddy</h2>
        </div>
        <button onClick={onToggle} className="p-1 hover:bg-muted rounded transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* New Chat & Temporary Chat Buttons */}
      <div className="p-4 border-b border-border space-y-2">
        <Button
          onClick={() => onNewConversation(false)}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
        <Button
          onClick={() => onNewConversation(true)}
          variant="outline"
          className="w-full border-border text-foreground rounded-lg flex items-center justify-center gap-2 hover:bg-muted"
        >
          <Clock className="w-4 h-4" />
          Temporary Chat
        </Button>
      </div>

      {/* Search Chat */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-0 rounded-lg text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredConversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No chats yet</p>
          ) : (
            <>
              {categories.map((category) => (
                <div key={category.id} className="space-y-1">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        expandedCategories.has(category.id) ? "rotate-90" : ""
                      }`}
                    />
                    <FolderOpen className="w-4 h-4" />
                    <span className="font-medium">{category.name}</span>
                  </button>

                  {expandedCategories.has(category.id) && (
                    <div className="pl-6 space-y-1">
                      {conversations
                        .filter((conv) => category.chatIds.includes(conv.id))
                        .map((conv) => (
                          <div
                            key={conv.id}
                            className="group relative rounded-lg transition-colors"
                            onMouseEnter={() => setHoveredChatId(conv.id)}
                            onMouseLeave={() => setHoveredChatId(null)}
                            draggable
                            onDragStart={(e) => handleDragStart(e, conv.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, conv.id)}
                          >
                            <div
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                currentConversationId === conv.id
                                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30"
                                  : "hover:bg-muted"
                              }`}
                            >
                              <button
                                onClick={() => onSelectConversation(conv.id)}
                                className="flex-1 text-left text-sm text-foreground truncate"
                              >
                                {conv.title}
                              </button>

                              {hoveredChatId === conv.id && (
                                <div className="relative" ref={saveMenuRef}>
                                  <button
                                    onClick={() => setShowSaveMenu(showSaveMenu === conv.id ? null : conv.id)}
                                    className="p-1 hover:bg-muted rounded transition-colors"
                                  >
                                    <Save className="w-3 h-3 text-muted-foreground" />
                                  </button>

                                  {showSaveMenu === conv.id && (
                                    <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-40">
                                      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                                        📁 Saved Files
                                      </button>
                                      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors border-t border-border">
                                        🖼️ Photos
                                      </button>
                                      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors border-t border-border">
                                        💬 Chats
                                      </button>
                                      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors border-t border-border">
                                        🎥 Videos
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {hoveredChatId === conv.id && (
                                <button
                                  onClick={() => onDeleteConversation(conv.id)}
                                  className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                >
                                  <X className="w-3 h-3 text-red-500" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}

              {uncategorizedChats.map((conv) => (
                <div
                  key={conv.id}
                  className="group relative rounded-lg transition-colors"
                  onMouseEnter={() => setHoveredChatId(conv.id)}
                  onMouseLeave={() => setHoveredChatId(null)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, conv.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, conv.id)}
                >
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      currentConversationId === conv.id
                        ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30"
                        : "hover:bg-muted"
                    }`}
                  >
                    <button
                      onClick={() => onSelectConversation(conv.id)}
                      className="flex-1 text-left text-sm text-foreground truncate"
                    >
                      {conv.title}
                    </button>

                    {hoveredChatId === conv.id && (
                      <div className="relative" ref={saveMenuRef}>
                        <button
                          onClick={() => setShowSaveMenu(showSaveMenu === conv.id ? null : conv.id)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          <Save className="w-3 h-3 text-muted-foreground" />
                        </button>

                        {showSaveMenu === conv.id && (
                          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-40">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                              📁 Saved Files
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors border-t border-border">
                              🖼️ Photos
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors border-t border-border">
                              💬 Chats
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors border-t border-border">
                              🎥 Videos
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {hoveredChatId === conv.id && (
                      <button
                        onClick={() => onDeleteConversation(conv.id)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create Category</h3>
            <p className="text-sm text-muted-foreground mb-4">Name this category to group these chats together</p>
            <Input
              placeholder="Category name..."
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="mb-4 bg-muted border-0 rounded-lg text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowCategoryModal(false)
                  setCategoryName("")
                }}
                variant="outline"
                className="flex-1 border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCategory}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Profile, Library, Premium */}
      <div className="border-t border-border p-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">
          <FolderOpen className="w-4 h-4" />
          Library
        </button>

        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg transition-colors">
          <Zap className="w-4 h-4" />
          Upgrade to Premium
        </button>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
            <span className="flex-1 text-left">Profile</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showProfile ? "rotate-180" : ""}`} />
          </button>

          {showProfile && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                <User className="w-4 h-4" />
                My Profile
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors border-t border-border">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
