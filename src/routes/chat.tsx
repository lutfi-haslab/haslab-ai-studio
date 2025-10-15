import { createFileRoute } from '@tanstack/react-router'
import { ChatInterface } from '@/components/chat/ChatInterface'

export const Route = createFileRoute('/chat')({
  component: Chat,
})

function Chat() {
  return <ChatInterface mode="chat" />
}
