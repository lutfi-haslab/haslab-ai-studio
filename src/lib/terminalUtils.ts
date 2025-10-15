// Remove ANSI escape codes and clean terminal output
export function cleanTerminalOutput(text: string): string {
  // Remove ANSI escape codes
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
}

// Format terminal output lines
export function formatTerminalLine(line: string): string {
  const cleaned = cleanTerminalOutput(line)
  const trimmed = cleaned.trim()
  
  // Filter out spinner/progress indicator characters (single characters like |, /, -, \)
  if (trimmed.length === 1 && /[|/\-\\]/.test(trimmed)) {
    return ''
  }
  
  // Filter out very short lines that are likely noise
  if (trimmed.length < 2) {
    return ''
  }
  
  return trimmed
}
