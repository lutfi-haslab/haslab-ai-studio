import { useEffect, useRef, useState } from 'react'
import type { WebContainer } from '@webcontainer/api'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle } from 'lucide-react'
import type { FileNode } from '@/lib/templates'
import { formatTerminalLine } from '@/lib/terminalUtils'

interface PreviewProps {
  files: FileNode[]
  webcontainer: WebContainer | null
  previewUrl: string
  setPreviewUrl: (url: string) => void
  addTerminalOutput: (message: string) => void
  setFilesystemMounted: (mounted: boolean) => void
}

// Global flag to prevent duplicate initialization
let isInitializing = false

export function Preview({ files, webcontainer, previewUrl, setPreviewUrl, addTerminalOutput, setFilesystemMounted }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const hasInitialized = useRef(false)
  const isMounted = useRef(true)

  const buildFileTree = (nodes: FileNode[]): Record<string, any> => {
    const tree: Record<string, any> = {}
    
    nodes.forEach((node) => {
      if (node.type === 'directory' && node.children) {
        tree[node.name] = {
          directory: buildFileTree(node.children)
        }
      } else if (node.type === 'file') {
        tree[node.name] = {
          file: {
            contents: node.content || ''
          }
        }
      }
    })
    
    return tree
  }

  const startDevServer = async (container: WebContainer) => {
    try {
      setIsLoading(true)
      setError('')
      addTerminalOutput('Installing dependencies...')
      
      const installProcess = await container.spawn('npm', ['install'])
      
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          const cleaned = formatTerminalLine(data)
          if (cleaned) addTerminalOutput(cleaned)
        }
      }))
      
      const installExitCode = await installProcess.exit

      if (installExitCode !== 0) {
        const errorMsg = 'Failed to install dependencies'
        setError(errorMsg)
        addTerminalOutput(`ERROR: ${errorMsg}`)
        setIsLoading(false)
        return
      }

      addTerminalOutput('Dependencies installed successfully')
      addTerminalOutput('Starting development server...')

      const devProcess = await container.spawn('npm', ['run', 'dev'])

      devProcess.output.pipeTo(new WritableStream({
        write(data) {
          const cleaned = formatTerminalLine(data)
          if (cleaned) addTerminalOutput(cleaned)
        }
      }))

      container.on('server-ready', (_port, url) => {
        setPreviewUrl(url)
        setIsLoading(false)
        addTerminalOutput(`Server ready at: ${url}`)
      })

    } catch (err) {
      console.error('Error starting dev server:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to start development server'
      setError(errorMsg)
      addTerminalOutput(`ERROR: ${errorMsg}`)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!webcontainer || hasInitialized.current || isInitializing) return

    // If server is already running, just update state
    if (previewUrl) {
      if (isMounted.current) {
        setIsLoading(false)
        hasInitialized.current = true
        setFilesystemMounted(true)
      }
      return
    }

    const initProject = async () => {
      if (isInitializing) return
      isInitializing = true

      try {
        addTerminalOutput('Mounting file system...')
        const fileTree = buildFileTree(files)
        await webcontainer.mount(fileTree)
        
        if (!isMounted.current) {
          isInitializing = false
          return
        }
        addTerminalOutput('File system mounted successfully')
        setFilesystemMounted(true)

        await startDevServer(webcontainer)
        if (isMounted.current) {
          hasInitialized.current = true
        }
      } catch (err) {
        console.error('Error initializing project:', err)
        const errorMsg = err instanceof Error ? err.message : 'Failed to initialize project'
        if (isMounted.current) {
          setError(errorMsg)
          addTerminalOutput(`ERROR: ${errorMsg}`)
          setIsLoading(false)
        }
      } finally {
        isInitializing = false
      }
    }

    initProject()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webcontainer])

  const handleRefresh = async () => {
    if (webcontainer && previewUrl) {
      try {
        addTerminalOutput('Refreshing preview...')
        if (iframeRef.current) {
          iframeRef.current.src = previewUrl
        }
        addTerminalOutput('Preview refreshed')
      } catch (err) {
        console.error('Error refreshing:', err)
        const errorMsg = err instanceof Error ? err.message : 'Failed to refresh preview'
        setError(errorMsg)
        addTerminalOutput(`ERROR: ${errorMsg}`)
      }
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-2 border-b border-border flex items-center justify-between bg-card">
        <div className="text-xs text-muted-foreground font-mono truncate flex-1">
          {previewUrl || 'Starting server...'}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || !previewUrl}
          className="h-7"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="flex-1 relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Starting development server...</p>
              <p className="text-xs text-muted-foreground mt-1">Check terminal for details</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center max-w-md p-6">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive mb-2">Error</p>
              <p className="text-xs text-muted-foreground">{error}</p>
              <p className="text-xs text-muted-foreground mt-2">Check terminal for more details</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Reload Page
              </Button>
            </div>
          </div>
        )}
        
        {previewUrl && !error && (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-presentation"
          />
        )}
      </div>
    </div>
  )
}
