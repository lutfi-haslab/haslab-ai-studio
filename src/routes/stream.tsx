import { createFileRoute } from '@tanstack/react-router'
import { ChatInterface } from '@/components/chat/ChatInterface'

export const Route = createFileRoute('/stream')({
  component: Stream,
})

function Stream() {
  return <ChatInterface mode="stream" />
}