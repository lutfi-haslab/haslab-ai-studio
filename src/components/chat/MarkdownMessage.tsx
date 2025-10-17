import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import 'highlight.js/styles/github-dark.css'

interface MarkdownMessageProps {
  content: string
  isUser?: boolean
}

const CODE_TRUNCATE_LINES = 20

export function MarkdownMessage({ content, isUser = false }: MarkdownMessageProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set())
  const [copiedBlocks, setCopiedBlocks] = useState<Set<number>>(new Set())

  const toggleBlock = (index: number) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const copyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedBlocks(prev => new Set(prev).add(index))
      setTimeout(() => {
        setCopiedBlocks(prev => {
          const newSet = new Set(prev)
          newSet.delete(index)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  return (
    <div className={`prose prose-sm max-w-none ${
      isUser 
        ? 'prose-invert prose-p:text-primary-foreground prose-headings:text-primary-foreground prose-strong:text-primary-foreground prose-code:text-primary-foreground' 
        : 'dark:prose-invert'
    }`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom rendering for code blocks
          code({ className, children, ...props }: any) {
            const isInline = !className || !className.includes('language-')
            
            if (isInline) {
              return (
                <code className={`px-1.5 py-0.5 rounded bg-muted text-sm font-mono`} {...props}>
                  {children}
                </code>
              )
            }

            // For code blocks, handle truncation
            const codeString = String(children).replace(/\n$/, '')
            const lines = codeString.split('\n')
            const blockIndex = Math.random() // Use a simple random index for demo
            const shouldTruncate = lines.length > CODE_TRUNCATE_LINES
            const isExpanded = expandedBlocks.has(blockIndex)
            const isCopied = copiedBlocks.has(blockIndex)
            const displayedCode = shouldTruncate && !isExpanded 
              ? lines.slice(0, CODE_TRUNCATE_LINES).join('\n') 
              : codeString

            const language = className?.replace('language-', '') || 'text'

            return (
              <div className="relative group my-3">
                <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 rounded-t-lg border-b border-border">
                  <span className="text-xs font-mono text-muted-foreground">{language}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => copyCode(codeString, blockIndex)}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <pre className={`${className} rounded-t-none rounded-b-lg p-4 overflow-x-auto bg-muted border-t-0`}>
                  <code className={className} {...props}>
                    {displayedCode}
                  </code>
                </pre>
                {shouldTruncate && (
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-7 text-xs"
                      onClick={() => toggleBlock(blockIndex)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Show {lines.length - CODE_TRUNCATE_LINES} more lines
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )
          },
          // Custom rendering for paragraphs
          p({ children }) {
            return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
          },
          // Custom rendering for lists
          ul({ children }) {
            return <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>
          },
          ol({ children }) {
            return <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>
          },
          // Custom rendering for links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline hover:no-underline ${isUser ? 'text-primary-foreground' : 'text-primary'}`}
              >
                {children}
              </a>
            )
          },
          // Custom rendering for tables
          table({ children }) {
            return (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full border-collapse border border-border">
                  {children}
                </table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="border border-border px-3 py-2 bg-muted font-semibold text-left">
                {children}
              </th>
            )
          },
          td({ children }) {
            return (
              <td className="border border-border px-3 py-2">
                {children}
              </td>
            )
          },
          // Custom rendering for blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary pl-4 my-2 italic">
                {children}
              </blockquote>
            )
          },
          // Custom rendering for headings
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-2 mt-4">{children}</h1>
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-2 mt-3">{children}</h2>
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mb-2 mt-2">{children}</h3>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
