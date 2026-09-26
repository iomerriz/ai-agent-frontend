import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import api from '../api/axios'

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="code-block my-3 min-w-0 max-w-full overflow-hidden rounded-xl border border-gray-700 bg-[#282c34] text-gray-100">
      <div className="flex items-center justify-between gap-2 border-b border-gray-600 px-3 py-2 text-xs text-gray-300">
        <span className="truncate">{language || 'Code'}</span>
        <button type="button" onClick={copyCode} className="shrink-0 rounded px-2 py-1 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-blue-400" aria-label="Copy code">
          {copied ? 'Copied' : 'Copy code'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        wrapLongLines
        customStyle={{ margin: 0, padding: '0.75rem', background: 'transparent', maxWidth: '100%', overflowX: 'auto', fontSize: '0.8rem' }}
        codeTagProps={{ style: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

function Chat() {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef(null)

  const fetchConversations = useCallback(async () => {
    try {
      const response = await api.get('/conversations')
      setConversations(response.data)
    } catch (err) {
      if (err.response?.status === 401) navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    api.get('/conversations')
      .then((response) => setConversations(response.data))
      .catch((err) => { if (err.response?.status === 401) navigate('/login') })
  }, [navigate])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const fetchConversation = async (id) => {
    try {
      const response = await api.get(`/conversations/${id}`)
      setActiveConversationId(id)
      setMessages(response.data.messages)
      setSidebarOpen(false)
    } catch (err) {
      if (err.response?.status === 401) navigate('/login')
    }
  }

  const startNewChat = () => {
    setActiveConversationId(null)
    setMessages([])
    setSidebarOpen(false)
  }

  const deleteConversation = async (id) => {
    try {
      await api.delete(`/conversations/${id}`)
      if (activeConversationId === id) {
        setActiveConversationId(null)
        setMessages([])
      }
      fetchConversations()
    } catch {
      console.error('Failed to delete conversation')
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await api.post('/chat', {
        message: input,
        conversation_id: activeConversationId,
      })

      const aiMessage = { role: 'ai', content: response.data.reply }
      setMessages((prev) => [...prev, aiMessage])

      if (!activeConversationId) {
        setActiveConversationId(response.data.conversation_id)
        fetchConversations()
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login')
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', content: 'Error getting response. Please try again.' },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
     <div className="flex flex-col h-dvh min-h-0 bg-gray-100 dark:bg-gray-950 transition-colors duration-300">

      <div className="flex flex-wrap justify-between items-center gap-2 px-3 sm:px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 min-w-0">
          <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open conversations" className="md:hidden rounded-lg px-2 py-1 text-xl text-gray-700 dark:text-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500">☰</button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white truncate">AI Agent</h1>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 items-center text-xs sm:text-sm">
          <button
            onClick={toggleDarkMode}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            onClick={() => navigate('/users')}
            className="text-blue-600 hover:underline"
          >
            My Profile
          </button>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">

        {sidebarOpen && <button type="button" aria-label="Close conversations" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-20 bg-black/50 md:hidden" />}

        <aside className={`fixed inset-y-0 left-0 z-30 w-[min(18rem,85vw)] md:static md:z-auto md:w-64 md:shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-3">
            <button type="button" onClick={() => setSidebarOpen(false)} className="md:hidden float-right mb-2 px-2 py-1 text-gray-600 dark:text-gray-200" aria-label="Close sidebar">✕</button>
            <button
              onClick={startNewChat}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition clear-both"
            >
              + New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {conversations.length === 0 && (
              <p className="text-xs text-gray-400 text-center mt-6">
                No conversations yet
              </p>
            )}
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg mb-1 transition ${
                  activeConversationId === conv.id
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <button
                  onClick={() => fetchConversation(conv.id)}
                  className="flex-1 min-w-0 text-left text-sm truncate font-medium"
                >
                  {conv.title}
                </button>
                <button
                  onClick={() => deleteConversation(conv.id)}
                  aria-label={`Delete ${conv.title}`}
                  className="ml-2 p-2 text-gray-400 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">

          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm">
                  Start a new conversation
                </p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`message-content px-3 sm:px-4 py-2 rounded-2xl text-sm min-w-0 break-words ${msg.role === 'ai' && msg.content.includes('```') ? 'w-full max-w-full sm:max-w-[85%] lg:max-w-3xl' : 'max-w-[92%] sm:max-w-[85%] lg:max-w-2xl'} ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        pre({ children }) {
                          return <div className="min-w-0 max-w-full overflow-hidden">{children}</div>
                        },
                        code({ node, className, children, ...props }) {
                          void node
                          const match = /language-(\w+)/.exec(className || '')
                          return match ? (
                            <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
                          ) : (
                            <code
                              className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-sm"
                              {...props}
                            >
                              {children}
                            </code>
                          )
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 px-4 py-2 rounded-2xl rounded-bl-sm text-sm">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-3 sm:p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex gap-2 sm:gap-3 max-w-4xl mx-auto min-w-0">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 min-w-0 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-3 sm:px-4 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-blue-600 text-white px-3 sm:px-5 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium shrink-0"
              >
                Send
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Chat
