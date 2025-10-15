export interface FileNode {
  name: string
  type: 'file' | 'directory'
  content?: string
  children?: FileNode[]
}

export const simpleReactViteTemplate: FileNode[] = [
  {
    name: 'package.json',
    type: 'file',
    content: JSON.stringify({
      name: 'vite-react-app',
      private: true,
      version: '0.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.0.3',
        vite: '^4.4.5'
      }
    }, null, 2)
  },
  {
    name: 'index.html',
    type: 'file',
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
  },
  {
    name: 'vite.config.js',
    type: 'file',
    content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
  },
  {
    name: 'src',
    type: 'directory',
    children: [
      {
        name: 'main.jsx',
        type: 'file',
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
      },
      {
        name: 'App.jsx',
        type: 'file',
        content: `import { useState } from 'react'
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

export default App`
      },
      {
        name: 'App.css',
        type: 'file',
        content: `#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.card {
  padding: 2em;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}`
      },
      {
        name: 'index.css',
        type: 'file',
        content: `:root {
  --font-base: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
  --color-bg: #0e0e10;
  --color-surface: #1a1a1d;
  --color-primary: #00e0ff;
  --color-accent: #ff3cac;
  --color-text: #e0e0e0;
  --color-muted: #999;
  --color-code-bg: #151518;
  --radius: 12px;
  --transition: all 0.25s ease-in-out;

  font-family: var(--font-base);
  line-height: 1.6;
  font-weight: 400;

  color-scheme: dark;
  color: var(--color-text);
  background-color: var(--color-bg);

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  justify-content: center;
  min-width: 320px;
  min-height: 100vh;
  background: radial-gradient(circle at top left, #1f1f25, #0e0e10 70%);
  transition: var(--transition);
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
  background: linear-gradient(90deg, var(--color-accent), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
  text-shadow: 0 0 10px rgba(0, 224, 255, 0.2);
  transition: var(--transition);
}

code {
  background-color: var(--color-code-bg);
  padding: 4px 8px;
  border-radius: var(--radius);
  color: var(--color-primary);
  font-family: 'Fira Code', monospace;
  font-size: 0.95em;
  box-shadow: 0 0 10px rgba(0, 224, 255, 0.15);
  transition: var(--transition);
}

a {
  color: var(--color-accent);
  text-decoration: none;
  transition: var(--transition);
}

a:hover {
  color: var(--color-primary);
  text-shadow: 0 0 8px var(--color-primary);
}

button {
  background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 0.75em 1.5em;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: var(--transition);
  box-shadow: 0 0 15px rgba(255, 60, 172, 0.3);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px rgba(0, 224, 255, 0.5);
}`
      }
    ]
  }
]
