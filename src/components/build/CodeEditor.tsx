import { Editor } from '@monaco-editor/react'

interface CodeEditorProps {
  value: string
  language: string
  onChange?: (value: string | undefined) => void
  readOnly?: boolean
}

export function CodeEditor({ value, language, onChange, readOnly = false }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={onChange}
      theme="vs-dark"
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
      }}
    />
  )
}
