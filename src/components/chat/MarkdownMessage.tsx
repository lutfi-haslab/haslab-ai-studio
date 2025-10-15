import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface MarkdownMessageProps {
  content: string
  isUser?: boolean
}

export function MarkdownMessage({ content, isUser = false }: MarkdownMessageProps) {
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
            return !isInline ? (
              <div className="relative group">
                <pre className={`${className} rounded-lg p-4 overflow-x-auto bg-muted`}>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className={`px-1.5 py-0.5 rounded bg-muted text-sm font-mono`} {...props}>
                {children}
              </code>
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
