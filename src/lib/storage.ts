export interface StoredMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Conversation {
  id: string
  title: string
  messages: StoredMessage[]
  createdAt: Date
  updatedAt: Date
  modelProvider: string
  modelName: string
}

const STORAGE_KEY = 'haslab_conversations'
const ACTIVE_CONVERSATION_KEY = 'haslab_active_conversation'

export class ChatStorage {
  static getAllConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []
      
      const conversations = JSON.parse(data)
      return conversations.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))
    } catch (error) {
      console.error('Failed to load conversations:', error)
      return []
    }
  }

  static saveConversation(conversation: Conversation): void {
    try {
      const conversations = this.getAllConversations()
      const existingIndex = conversations.findIndex(c => c.id === conversation.id)
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation
      } else {
        conversations.push(conversation)
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch (error) {
      console.error('Failed to save conversation:', error)
    }
  }

  static getConversation(id: string): Conversation | null {
    const conversations = this.getAllConversations()
    return conversations.find(c => c.id === id) || null
  }

  static deleteConversation(id: string): void {
    try {
      const conversations = this.getAllConversations()
      const filtered = conversations.filter(c => c.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      
      if (this.getActiveConversationId() === id) {
        this.setActiveConversationId(null)
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  static createConversation(modelProvider: string, modelName: string, initialMessage?: StoredMessage): Conversation {
    const now = new Date()
    const conversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: initialMessage?.content.slice(0, 50) || 'New Chat',
      messages: initialMessage ? [initialMessage] : [],
      createdAt: now,
      updatedAt: now,
      modelProvider,
      modelName
    }
    
    this.saveConversation(conversation)
    return conversation
  }

  static updateConversationMessages(id: string, messages: StoredMessage[]): void {
    const conversation = this.getConversation(id)
    if (!conversation) return
    
    conversation.messages = messages
    conversation.updatedAt = new Date()
    
    if (messages.length > 0 && messages[0].role === 'user') {
      conversation.title = messages[0].content.slice(0, 50)
    }
    
    this.saveConversation(conversation)
  }

  static getActiveConversationId(): string | null {
    return localStorage.getItem(ACTIVE_CONVERSATION_KEY)
  }

  static setActiveConversationId(id: string | null): void {
    if (id) {
      localStorage.setItem(ACTIVE_CONVERSATION_KEY, id)
    } else {
      localStorage.removeItem(ACTIVE_CONVERSATION_KEY)
    }
  }

  static clearAllConversations(): void {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ACTIVE_CONVERSATION_KEY)
  }

  static exportConversation(id: string): string {
    const conversation = this.getConversation(id)
    if (!conversation) return ''
    
    return JSON.stringify(conversation, null, 2)
  }

  static importConversation(jsonData: string): Conversation | null {
    try {
      const data = JSON.parse(jsonData)
      const conversation: Conversation = {
        ...data,
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(),
        messages: data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }
      
      this.saveConversation(conversation)
      return conversation
    } catch (error) {
      console.error('Failed to import conversation:', error)
      return null
    }
  }
}
