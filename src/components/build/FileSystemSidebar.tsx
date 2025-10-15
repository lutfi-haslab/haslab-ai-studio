import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react'
import type { FileNode } from '@/lib/templates'

interface FileSystemSidebarProps {
  files: FileNode[]
  selectedFile: string | null
  onFileSelect: (path: string, content: string) => void
  onFileDoubleClick?: (path: string, content: string) => void
}

interface FileTreeItemProps {
  node: FileNode
  path: string
  level: number
  selectedFile: string | null
  onFileSelect: (path: string, content: string) => void
  onFileDoubleClick?: (path: string, content: string) => void
  expandedDirs: Set<string>
  toggleDir: (path: string) => void
}

function FileTreeItem({ 
  node, 
  path, 
  level, 
  selectedFile, 
  onFileSelect,
  onFileDoubleClick, 
  expandedDirs, 
  toggleDir 
}: FileTreeItemProps) {
  const isExpanded = expandedDirs.has(path)
  const isSelected = selectedFile === path

  if (node.type === 'directory') {
    return (
      <div>
        <Button
          variant="ghost"
          className={`w-full justify-start gap-1 h-7 px-2 text-sm hover:bg-accent ${
            isSelected ? 'bg-accent' : ''
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => toggleDir(path)}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 text-blue-500" />
          )}
          <span className="text-foreground">{node.name}</span>
        </Button>
        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeItem
                key={`${path}/${child.name}`}
                node={child}
                path={`${path}/${child.name}`}
                level={level + 1}
                selectedFile={selectedFile}
                onFileSelect={onFileSelect}
                onFileDoubleClick={onFileDoubleClick}
                expandedDirs={expandedDirs}
                toggleDir={toggleDir}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      className={`w-full justify-start gap-2 h-7 px-2 text-sm hover:bg-accent ${
        isSelected ? 'bg-accent text-foreground' : 'text-muted-foreground'
      }`}
      style={{ paddingLeft: `${level * 12 + 24}px` }}
      onClick={() => onFileSelect(path, node.content || '')}
      onDoubleClick={() => onFileDoubleClick?.(path, node.content || '')}
    >
      <File className="h-4 w-4" />
      <span>{node.name}</span>
    </Button>
  )
}

export function FileSystemSidebar({ files, selectedFile, onFileSelect, onFileDoubleClick }: FileSystemSidebarProps) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['src']))

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  return (
    <div className="h-full border-r border-border bg-card flex flex-col">
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Files</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {files.map((node) => (
            <FileTreeItem
              key={node.name}
              node={node}
              path={node.name}
              level={0}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              onFileDoubleClick={onFileDoubleClick}
              expandedDirs={expandedDirs}
              toggleDir={toggleDir}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
