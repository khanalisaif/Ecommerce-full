import { useState, useEffect, useRef } from 'react'
import { X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react'
import chatService from '../services/chatService'

export default function AIChatBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm Hashteli AI. How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    const history = messages
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setInput('')
    setIsTyping(true)

    chatService.sendMessage(userMessage, history)
      .then((res) => {
        setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }])
      })
      .catch(() => {
        setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble responding right now. Please try again in a moment." }])
      })
      .finally(() => setIsTyping(false))
  }

  if (!isOpen) return null

  return (
    <div 
      className={`fixed z-[999] bg-white border border-gray-200 shadow-2xl flex flex-col transition-all duration-300 ease-in-out
        ${isExpanded 
          ? 'inset-0 w-full h-full md:inset-auto md:bottom-6 md:right-6 md:w-[400px] md:h-[600px] md:rounded-2xl' 
          : 'bottom-0 right-0 w-full h-[500px] rounded-t-2xl md:bottom-6 md:right-6 md:w-[350px] md:h-[500px] md:rounded-2xl'
        }
      `}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-500 p-4 flex items-center justify-between text-white rounded-t-2xl md:rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[15px] leading-tight">Hashteli AI</h3>
            <p className="text-[10px] text-purple-100 uppercase tracking-wider font-bold">Virtual Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="p-1.5 hover:bg-white/20 rounded transition-colors hidden md:block"
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-purple-100 text-purple-700' : 'bg-white shadow border border-gray-100 text-purple-600'}`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`p-3 rounded-2xl text-[13px] leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-purple-600 text-white rounded-tr-sm' 
                : 'bg-white border border-gray-100 shadow-sm text-gray-700 rounded-tl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-white shadow border border-gray-100 text-purple-600">
              <Bot size={14} />
            </div>
            <div className="p-3 rounded-2xl bg-white border border-gray-100 shadow-sm rounded-tl-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 rounded-b-2xl md:rounded-b-2xl">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="w-full bg-gray-50 border border-gray-200 text-[13px] rounded-full pl-4 pr-12 py-3 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-purple-600 text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={14} className="ml-0.5" />
          </button>
        </div>
        <div className="text-center mt-2">
          <p className="text-[9px] text-gray-400">Powered by Hashteli AI</p>
        </div>
      </div>
    </div>
  )
}
