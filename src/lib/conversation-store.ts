import { Store } from '@tanstack/react-store'
import { ChatStorage } from './storage'
import type { Conversation, StoredMessage } from './storage'

interface ConversationState {
  conversations: Conversation[]
  activeConversationId: string | null
  isLoading: boolean
}

class ConversationStore extends Store<ConversationState> {
  constructor() {
    super({
      conversations: [],
      activeConversationId: null,
      isLoading: false
    })
    
    this.loadConversations()
  }

  loadConversations() {
    this.setState((state) => ({ ...state, isLoading: true }))
    const conversations = ChatStorage.getAllConversations()
    const activeId = ChatStorage.getActiveConversationId()
    
    this.setState((state) => ({
      ...state,
      conversations: conversations.sort((a, b) => 
        b.updatedAt.getTime() - a.updatedAt.getTime()
      ),
      activeConversationId: activeId,
      isLoading: false
    }))
  }

  createNewConversation(modelProvider: string, modelName: string, initialMessage?: StoredMessage): Conversation {
    const conversation = ChatStorage.createConversation(modelProvider, modelName, initialMessage)
    this.loadConversations()
    this.setActiveConversation(conversation.id)
    return conversation
  }

  setActiveConversation(id: string | null) {
    ChatStorage.setActiveConversationId(id)
    this.setState((state) => ({
      ...state,
      activeConversationId: id
    }))
  }

  getActiveConversation(): Conversation | null {
    const state = this.state
    if (!state.activeConversationId) return null
    return state.conversations.find(c => c.id === state.activeConversationId) || null
  }

  updateConversationMessages(id: string, messages: StoredMessage[]) {
    ChatStorage.updateConversationMessages(id, messages)
    this.loadConversations()
  }

  deleteConversation(id: string) {
    ChatStorage.deleteConversation(id)
    this.loadConversations()
  }

  clearAllConversations() {
    ChatStorage.clearAllConversations()
    this.loadConversations()
  }

  exportConversation(id: string): string {
    return ChatStorage.exportConversation(id)
  }

  importConversation(jsonData: string): Conversation | null {
    const conversation = ChatStorage.importConversation(jsonData)
    if (conversation) {
      this.loadConversations()
    }
    return conversation
  }
}

export const conversationStore = new ConversationStore()
