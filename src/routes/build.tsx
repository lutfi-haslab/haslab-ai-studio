import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Code, FileCode, Eye, Terminal, ChevronDown, ChevronUp, Save, FilePlus, RefreshCw, Download } from 'lucide-react'
import { FileSystemSidebar } from '@/components/build/FileSystemSidebar'
import { CodeEditor } from '@/components/build/CodeEditor'
import { Preview } from '@/components/build/Preview'
import { simpleReactViteTemplate } from '@/lib/templates'
import type { FileNode } from '@/lib/templates'
import { WebContainer } from '@webcontainer/api'
import { formatTerminalLine } from '@/lib/terminalUtils'

export const Route = createFileRoute('/build')({
  component: Build,
})

type ViewMode = 'code' | 'preview'

// Global singleton to ensure only one WebContainer instance
let webContainerInstance: WebContainer | null = null
let webContainerPromise: Promise<WebContainer> | null = null

async function getWebContainer(): Promise<WebContainer> {
  if (webContainerInstance) {
    return webContainerInstance
  }
  
  if (webContainerPromise) {
    return webContainerPromise
  }
  
  webContainerPromise = WebContainer.boot().then(instance => {
    webContainerInstance = instance
    webContainerPromise = null
    return instance
  })
  
  return webContainerPromise
}

function resetProject() {
  // This function is called when user clicks restart
  // It will be followed by a page reload
}

function Build() {
  const [files] = useState<FileNode[]>(simpleReactViteTemplate)
  const [selectedFile, setSelectedFile] = useState<string | null>('src/App.jsx')
  const [fileContent, setFileContent] = useState<string>(`import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App`)
  const [viewMode, setViewMode] = useState<ViewMode>('code')
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [isTerminalOpen, setIsTerminalOpen] = useState(true)
  const [filesystemMounted, setFilesystemMounted] = useState(false)
  const terminalHeight = 200
  const terminalRef = useRef<HTMLDivElement>(null)
  const originalContentRef = useRef<string>('')
  const fileJustOpenedRef = useRef(false)

  useEffect(() => {
    let isMounted = true
    
    const initWebContainer = async () => {
      try {
        addTerminalOutput('Initializing WebContainer...')
        const container = await getWebContainer()
        
        if (!isMounted) return
        
        setWebcontainer(container)
        addTerminalOutput('WebContainer initialized successfully')
      } catch (err) {
        console.error('Error initializing WebContainer:', err)
        addTerminalOutput(`Error: ${err instanceof Error ? err.message : 'Failed to initialize'}`)
      }
    }

    initWebContainer()

    return () => {
      isMounted = false
      // Don't teardown WebContainer here - it's a global singleton
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addTerminalOutput = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const cleanedMessage = formatTerminalLine(message)
    if (cleanedMessage) {
      setTerminalOutput(prev => [...prev, `[${timestamp}] ${cleanedMessage}`])
    }
  }

  const handleSaveFile = async () => {
    if (!webcontainer || !selectedFile || !filesystemMounted) return
    
    try {
      addTerminalOutput(`Saving ${selectedFile}...`)
      await webcontainer.fs.writeFile(selectedFile, fileContent)
      addTerminalOutput(`✓ Saved ${selectedFile}`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save file'
      addTerminalOutput(`ERROR: ${errorMsg}`)
    }
  }

  const handleRestartServer = () => {
    if (window.confirm('Restart the development server? This will clear all state.')) {
      resetProject()
      setPreviewUrl('')
      setFilesystemMounted(false)
      setTerminalOutput([])
      addTerminalOutput('Server restart initiated - please refresh the page')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  const handleCreateFile = async () => {
    if (!webcontainer) return
    
    const fileName = prompt('Enter file name (e.g., src/NewComponent.jsx):')
    if (!fileName) return
    
    try {
      addTerminalOutput(`Creating ${fileName}...`)
      await webcontainer.fs.writeFile(fileName, '// New file\n')
      addTerminalOutput(`✓ Created ${fileName}`)
      
      // Reload file tree (simplified - you may want to update the files state properly)
      setSelectedFile(fileName)
      setFileContent('// New file\n')
      originalContentRef.current = '// New file\n'
      fileJustOpenedRef.current = true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create file'
      addTerminalOutput(`ERROR: ${errorMsg}`)
    }
  }

  const handleExportProject = async () => {
    if (!webcontainer || !filesystemMounted) return
    
    try {
      addTerminalOutput('Exporting project to ZIP...')
      
      // Use JSZip to create ZIP file
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // Recursively add files to ZIP
      const addFilesToZip = async (node: FileNode, parentPath: string = '') => {
        const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name
        
        if (node.type === 'directory') {
          // Create directory in ZIP (JSZip needs folder() call or will auto-create)
          if (node.children) {
            for (const child of node.children) {
              await addFilesToZip(child, currentPath)
            }
          }
        } else if (node.type === 'file') {
          // Read actual content from WebContainer
          try {
            const content = await webcontainer.fs.readFile(currentPath, 'utf-8')
            zip.file(currentPath, content)
          } catch (err) {
            // Fallback to template content
            zip.file(currentPath, node.content || '')
          }
        }
      }

      // Process each root node
      for (const fileNode of files) {
        await addFilesToZip(fileNode, '')
      }

      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'project.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      addTerminalOutput('✓ Project exported successfully')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to export project'
      addTerminalOutput(`ERROR: ${errorMsg}`)
    }
  }

  const handleFileSelect = (path: string, content: string) => {
    setSelectedFile(path)
    setFileContent(content)
    originalContentRef.current = content
    fileJustOpenedRef.current = true
  }

  const handleFileDoubleClick = (path: string, content: string) => {
    setSelectedFile(path)
    setFileContent(content)
    originalContentRef.current = content
    fileJustOpenedRef.current = true
    setViewMode('code')
  }

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase()
    const langMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      json: 'json',
      html: 'html',
      css: 'css',
      md: 'markdown',
    }
    return langMap[ext || ''] || 'plaintext'
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalOutput])

  // Auto-save with debounce (1 second after last change)
  useEffect(() => {
    // Don't auto-save until filesystem is mounted and we have a preview URL
    if (!webcontainer || !selectedFile || !fileContent || !filesystemMounted || !previewUrl) return

    // Skip auto-save if file was just opened (no actual changes made)
    if (fileJustOpenedRef.current) {
      fileJustOpenedRef.current = false
      return
    }

    // Skip auto-save if content hasn't changed from original
    if (fileContent === originalContentRef.current) return

    const autoSaveTimer = setTimeout(() => {
      webcontainer.fs.writeFile(selectedFile, fileContent)
        .then(() => {
          const timestamp = new Date().toLocaleTimeString()
          setTerminalOutput(prev => [...prev, `[${timestamp}] ✓ Auto-saved ${selectedFile}`])
          originalContentRef.current = fileContent // Update original after save
        })
        .catch((err) => {
          const timestamp = new Date().toLocaleTimeString()
          const errorMsg = err instanceof Error ? err.message : 'Failed to auto-save file'
          setTerminalOutput(prev => [...prev, `[${timestamp}] ERROR: ${errorMsg}`])
        })
    }, 1000) // Wait 1 second after last keystroke

    return () => clearTimeout(autoSaveTimer)
  }, [fileContent, selectedFile, webcontainer, filesystemMounted, previewUrl])

  // Keyboard shortcut for manual save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (webcontainer && selectedFile) {
          webcontainer.fs.writeFile(selectedFile, fileContent)
            .then(() => {
              const timestamp = new Date().toLocaleTimeString()
              setTerminalOutput(prev => [...prev, `[${timestamp}] ✓ Saved ${selectedFile}`])
            })
            .catch((err) => {
              const timestamp = new Date().toLocaleTimeString()
              const errorMsg = err instanceof Error ? err.message : 'Failed to save file'
              setTerminalOutput(prev => [...prev, `[${timestamp}] ERROR: ${errorMsg}`])
            })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedFile, fileContent, webcontainer])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-primary" />
            <div>
              <h1 className="text-sm font-semibold text-foreground">Build</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveFile}
              disabled={!selectedFile || !webcontainer || !filesystemMounted}
              className="h-7 px-2 text-xs"
              title="Save file (hot reload)"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateFile}
              disabled={!webcontainer || !filesystemMounted}
              className="h-7 px-2 text-xs"
              title="Create new file"
            >
              <FilePlus className="h-3 w-3 mr-1" />
              New
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRestartServer}
              disabled={!webcontainer}
              className="h-7 px-2 text-xs text-orange-600 hover:text-orange-700"
              title="Restart development server"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Restart
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportProject}
              disabled={!webcontainer || !filesystemMounted}
              className="h-7 px-2 text-xs"
              title="Export project as ZIP"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button
              variant={viewMode === 'code' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('code')}
              className="h-7 px-2 text-xs"
            >
              <FileCode className="h-3 w-3 mr-1" />
              Code
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="h-7 px-2 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File System Sidebar */}
        <div className="w-64 flex-shrink-0">
          <FileSystemSidebar
            files={files}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onFileDoubleClick={handleFileDoubleClick}
          />
        </div>

        {/* Editor/Preview Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden" style={{ height: `calc(100% - ${isTerminalOpen ? terminalHeight : 0}px)` }}>
            {viewMode === 'code' ? (
              <div className="h-full flex flex-col">
                {selectedFile && (
                  <div className="p-2 border-b border-border bg-card text-xs text-foreground font-mono">
                    {selectedFile}
                  </div>
                )}
                <div className="flex-1">
                  <CodeEditor
                    value={fileContent}
                    language={selectedFile ? getLanguageFromPath(selectedFile) : 'javascript'}
                    onChange={(value) => setFileContent(value || '')}
                  />
                </div>
              </div>
            ) : (
              <Preview 
                files={files} 
                webcontainer={webcontainer}
                previewUrl={previewUrl}
                setPreviewUrl={setPreviewUrl}
                addTerminalOutput={addTerminalOutput}
                setFilesystemMounted={setFilesystemMounted}
              />
            )}
          </div>

          {/* Terminal Panel */}
          <div 
            className={`border-t border-border bg-card transition-all ${isTerminalOpen ? '' : 'h-8'}`}
            style={{ height: isTerminalOpen ? `${terminalHeight}px` : '32px' }}
          >
            <div className="flex items-center justify-between px-3 py-1 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Terminal className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Terminal</span>
                <span className="text-xs text-muted-foreground">({terminalOutput.length} lines)</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                className="h-6 w-6 p-0"
              >
                {isTerminalOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              </Button>
            </div>
            
            {isTerminalOpen && (
              <div 
                ref={terminalRef}
                className="overflow-auto p-2 font-mono text-xs bg-black/90 text-green-400"
                style={{ height: `calc(${terminalHeight}px - 32px)` }}
              >
                {terminalOutput.length === 0 ? (
                  <div className="text-muted-foreground">Waiting for output...</div>
                ) : (
                  terminalOutput.map((line, idx) => (
                    <div key={idx} className="whitespace-pre-wrap break-words">
                      {line}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}