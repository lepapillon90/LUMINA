import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getStylistAdvice } from '../../../services/geminiService';
import { getProducts } from '../../../services/productService';
import { saveAIFeedback } from '../../../services/feedbackService';
import { Product } from '../../../types';

interface Message {
  id: string; // Add ID for feedback tracking
  role: 'user' | 'assistant';
  text: string;
  feedback?: 'like' | 'dislike';
}

const AIStylist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', text: "안녕하세요! 당신만의 AI 스타일리스트 '루미'입니다. 오늘 특별히 찾으시는 스타일이 있으신가요?" }
  ]);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Fetch products when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    };
    fetchProducts();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    // Create a rich context of available products
    const productContext = products.map(p => {
      const tags = p.tags ? `[${p.tags.join(', ')}]` : '';
      // Extract material from description if possible or just use name/category
      // Assuming metadata might be in tags or name for now
      return `ID:${p.id} ${p.name} (${p.category}) : ₩${p.price} ${tags}`;
    }).join('\n');

    const advice = await getStylistAdvice(userMsg, productContext);
    const aiMsgId = (Date.now() + 1).toString();

    setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', text: advice }]);
    setIsLoading(false);
  };

  const handleFeedback = async (messageId: string, rating: 'like' | 'dislike', responseText: string) => {
    // UI Update (Optimistic)
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, feedback: rating } : msg
    ));

    // Find the query (user message right before this AI message)
    const msgIndex = messages.findIndex(m => m.id === messageId);
    let query = "";
    if (msgIndex > 0) {
      query = messages[msgIndex - 1].text;
    }

    // Save to Firestore
    await saveAIFeedback({
      query: query || "Unknown Context",
      response: responseText,
      rating
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white p-4 rounded-full shadow-xl hover:bg-accent transition-colors flex items-center justify-center animate-bounce"
        >
          <Sparkles size={24} />
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col overflow-hidden border border-gray-100 h-[500px]">
          {/* Header */}
          <div className="bg-primary p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <Sparkles size={18} className="text-accent" />
              <h3 className="font-serif font-medium">Lumi AI 스타일리스트</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-accent transition">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm'
                    }`}
                >
                  {msg.text}
                </div>

                {/* Feedback UI for Assistant Messages */}
                {msg.role === 'assistant' && msg.id !== 'welcome' && (
                  <div className="flex gap-2 mt-1 ml-1">
                    <button
                      onClick={() => handleFeedback(msg.id, 'like', msg.text)}
                      className={`p-1 rounded-full transition ${msg.feedback === 'like' ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-blue-500'}`}
                      disabled={!!msg.feedback}
                    >
                      <ThumbsUp size={12} />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, 'dislike', msg.text)}
                      className={`p-1 rounded-full transition ${msg.feedback === 'dislike' ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'}`}
                      disabled={!!msg.feedback}
                    >
                      <ThumbsDown size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                  <div className="flex space-x-1 items-center h-6">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="예: 금반지 추천해줘"
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2 bg-primary text-white rounded-full hover:bg-accent disabled:bg-gray-300 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIStylist;