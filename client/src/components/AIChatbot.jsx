import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, User, RefreshCw, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { sendAIChatPrompt } from '../services/api';

const quickPrompts = [
  "Show me all properties for sale",
  "What's the cheapest property?",
  "Show me 4+ bedroom homes",
  "Find properties in Sydney"
];

const AIChatbot = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm Aura AI, your luxury real estate concierge 🏡\n\nAsk me anything about property prices, live database listings, mortgage calculations, suburb insights, or investment advice!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendAIChatPrompt(query);
      if (res.data && res.data.success) {
        setMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]);
      } else {
        throw new Error('No response');
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: "I'm having a momentary connectivity issue. Please try again in a few seconds!" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{
      sender: 'ai',
      text: "Hello! I'm Aura AI, your luxury real estate concierge 🏡\n\nAsk me anything about property prices, live database listings, mortgage calculations, suburb insights, or investment advice!"
    }]);
    setInput('');
  };

  // Demo properties lookup for fail-safe link resolution when AI generates URLs
  const demoPropertyList = [
    { id: '507f1f77bcf86cd799439000', keywords: ['grand waterfront villa', '14 wolseley', '18,500,000', '18500000'] },
    { id: '507f1f77bcf86cd799439001', keywords: ['oceanfront estate', 'private jetty', '28 wunulla', '24,000,000', '24000000'] },
    { id: '507f1f77bcf86cd799439002', keywords: ['wolseley haven penthouse', '52 wolseley', '4,500', '4500'] },
    { id: '507f1f77bcf86cd799439003', keywords: ['sky penthouse at crown', 'crown towers', '12,800,000', '12800000', '1 barangaroo'] },
    { id: '507f1f77bcf86cd799439004', keywords: ['executive waterfront residence', 'barangaroo wharf', '88 barangaroo', '2,200', '2200'] },
    { id: '507f1f77bcf86cd799439005', keywords: ['bondi beachfront designer penthouse', 'campbell parade', '120 campbell', '4,850,000'] },
    { id: '507f1f77bcf86cd799439006', keywords: ['ben buckler', 'ramsgate avenue', '45 ramsgate', '7,200,000'] },
    { id: '507f1f77bcf86cd799439007', keywords: ['balmoral bay architectural', 'balmoral avenue', '16 balmoral', '14,200,000'] },
    { id: '507f1f77bcf86cd799439008', keywords: ['mosman heritage federation', 'raglan street', '72 raglan', '6,900,000'] },
    { id: '507f1f77bcf86cd799439009', keywords: ['french provincial manor', 'ocean avenue', '34 ocean', '11,500,000'] },
    { id: '507f1f77bcf86cd799439010', keywords: ['bay street luxury townhouse', 'bay street', '18 bay', '3,200'] },
    { id: '507f1f77bcf86cd799439011', keywords: ['bellevue hill grand colonial', 'victoria road', '8 victoria', '21,000,000'] },
    { id: '507f1f77bcf86cd799439012', keywords: ['vaucluse cliffside harbour', 'coolong road', '55 coolong', '19,800,000'] },
    { id: '507f1f77bcf86cd799439013', keywords: ['manly ocean promenade', 'north steyne', '14 north', '3,650,000'] },
    { id: '507f1f77bcf86cd799439014', keywords: ['victorian heritage designer terrace', 'queen street', '42 queen', '4,100,000'] },
    { id: '507f1f77bcf86cd799439015', keywords: ['contemporary family residence in south yarra', 'domain road', '42 domain', '3,450,000'] },
    { id: '507f1f77bcf86cd799439016', keywords: ['domain road park view apartment', '98 domain', '1,100'] },
    { id: '507f1f77bcf86cd799439017', keywords: ['toorak european villa', 'st georges road', '12 st georges', '16,500,000'] },
    { id: '507f1f77bcf86cd799439018', keywords: ['brighton esplanade beachside', 'esplanade', '64 esplanade', '9,400,000'] },
    { id: '507f1f77bcf86cd799439019', keywords: ['docklands marina sky villa', 'ocean way', '180 ocean', '2,800,000'] },
    { id: '507f1f77bcf86cd799439020', keywords: ['surfers paradise oceanfront sky villa', '77 esplanade', '3,250,000'] },
    { id: '507f1f77bcf86cd799439021', keywords: ['modern waterfront townhouse on the gold coast', 'masthead way', '89 masthead', '1,350'] },
    { id: '507f1f77bcf86cd799439022', keywords: ['broadbeach waters luxury canal', 'monaco street', '14 monaco', '4,600,000'] },
    { id: '507f1f77bcf86cd799439023', keywords: ['little cove ocean view beach', 'alderly terrace', '22 alderly', '8,900,000'] },
    { id: '507f1f77bcf86cd799439024', keywords: ['cottesloe beachfront architectural', 'marine parade', '104 marine', '8,200,000'] },
    { id: '507f1f77bcf86cd799439025', keywords: ['ascot grand queenslander', 'sutherland avenue', '55 sutherland', '4,750,000'] },
    { id: '507f1f77bcf86cd799439026', keywords: ['london circuit executive penthouse', 'london circuit', '15 london', '1,950,000'] },
    { id: '507f1f77bcf86cd799439027', keywords: ['byron bay hinterland eco', 'coopers shoot road', '120 coopers', '7,800,000'] }
  ];

  const resolveSmartPropertyUrl = (rawUrl, lineContext = '') => {
    if (!rawUrl) return '/properties';

    let cleanUrl = rawUrl.trim();
    if (cleanUrl.includes('http')) {
      try {
        const parsed = new URL(cleanUrl);
        cleanUrl = parsed.pathname;
      } catch (e) {}
    }

    // 1. Check if URL contains a valid 24-character hexadecimal ObjectId
    const hexIdMatch = cleanUrl.match(/\/properties\/([a-fA-F0-9]{24})/);
    if (hexIdMatch && hexIdMatch[1]) {
      return `/properties/${hexIdMatch[1]}`;
    }

    // 2. Smart context matching against lineText / cell contents
    const ctx = (lineContext || '').toLowerCase();
    for (const item of demoPropertyList) {
      for (const kw of item.keywords) {
        if (ctx.includes(kw)) {
          return `/properties/${item.id}`;
        }
      }
    }

    return cleanUrl.startsWith('/properties') && cleanUrl.length > 15 ? cleanUrl : '/properties';
  };

  // Helper to parse inline markdown (links & bold)
  const renderInlineMarkdown = (lineText, extraContext = '') => {
    if (!lineText) return null;

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const elements = [];
    let lastIdx = 0;
    let match;

    while ((match = linkRegex.exec(lineText)) !== null) {
      if (match.index > lastIdx) {
        elements.push(lineText.substring(lastIdx, match.index));
      }

      const rawLabel = match[1].replace(/\*\*/g, '');
      const rawUrl = match[2];
      const targetUrl = resolveSmartPropertyUrl(rawUrl, `${lineText} ${extraContext}`);

      if (rawUrl.startsWith('/') || rawUrl.includes('/properties')) {
        elements.push(
          <button
            key={match.index}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClose) onClose();
              navigate(targetUrl);
            }}
            className="inline-flex items-center gap-1 font-extrabold text-slate-950 bg-sky-400 hover:bg-amber-300 px-2 py-1 rounded-md text-xs transition-all shadow-md shadow-amber-400/20 cursor-pointer border border-amber-300 active:scale-95 text-left"
          >
            <span>{rawLabel}</span>
            <ExternalLink className="w-3 h-3 text-slate-950 shrink-0" />
          </button>
        );
      } else {
        elements.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-sky-500 underline hover:text-amber-300"
          >
            {rawLabel}
          </a>
        );
      }

      lastIdx = linkRegex.lastIndex;
    }

    if (lastIdx < lineText.length) {
      elements.push(lineText.substring(lastIdx));
    }

    return elements.map((el, elIdx) => {
      if (typeof el === 'string') {
        const boldRegex = /\*\*([^*]+)\*\*/g;
        const boldParts = [];
        let bLastIdx = 0;
        let bMatch;

        while ((bMatch = boldRegex.exec(el)) !== null) {
          if (bMatch.index > bLastIdx) {
            boldParts.push(el.substring(bLastIdx, bMatch.index));
          }
          boldParts.push(
            <strong key={bMatch.index} className="font-extrabold text-slate-900">
              {bMatch[1]}
            </strong>
          );
          bLastIdx = boldRegex.lastIndex;
        }
        if (bLastIdx < el.length) {
          boldParts.push(el.substring(bLastIdx));
        }
        return <React.Fragment key={elIdx}>{boldParts}</React.Fragment>;
      }
      return <React.Fragment key={elIdx}>{el}</React.Fragment>;
    });
  };

  // Render text with Markdown Tables, Links, and Bold text
  const renderText = (rawText) => {
    if (!rawText) return null;

    // Check if message contains markdown table syntax
    if (rawText.includes('|') && rawText.includes('\n')) {
      const lines = rawText.split('\n');
      const blocks = [];
      let currentTableLines = [];
      let currentTextLines = [];

      const flushText = () => {
        if (currentTextLines.length > 0) {
          const textBlock = currentTextLines.map((line, idx) => (
            <React.Fragment key={idx}>
              {renderInlineMarkdown(line)}
              {idx < currentTextLines.length - 1 && <br />}
            </React.Fragment>
          ));
          blocks.push(<div key={`text-${blocks.length}`} className="my-1">{textBlock}</div>);
          currentTextLines = [];
        }
      };

      const flushTable = () => {
        if (currentTableLines.length >= 2) {
          const rows = currentTableLines.filter(l => !l.includes('---'));
          if (rows.length > 0) {
            const headerCells = rows[0].split('|').slice(1, -1).map(c => c.trim());
            const dataRows = rows.slice(1).map(r => r.split('|').slice(1, -1).map(c => c.trim()));

            blocks.push(
              <div key={`table-${blocks.length}`} className="my-2.5 overflow-x-auto rounded-xl border border-sky-500/30 bg-slate-50/90 shadow-xl max-w-full">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-white border-b border-sky-500/30 text-sky-500 font-extrabold uppercase tracking-wider">
                    <tr>
                      {headerCells.map((h, hIdx) => (
                        <th key={hIdx} className="px-2.5 py-1.5 border-r border-slate-200/80 last:border-0 whitespace-nowrap">
                          {renderInlineMarkdown(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-700">
                    {dataRows.map((row, rIdx) => {
                      const fullRowText = row.join(' ');
                      return (
                        <tr key={rIdx} className="hover:bg-white/60 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-2.5 py-1.5 border-r border-slate-200/60 last:border-0 whitespace-normal">
                              {renderInlineMarkdown(cell, fullRowText)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          }
          currentTableLines = [];
        }
      };

      lines.forEach((line) => {
        const isTableLine = line.trim().startsWith('|') && line.trim().endsWith('|');
        if (isTableLine) {
          flushText();
          currentTableLines.push(line);
        } else {
          flushTable();
          currentTextLines.push(line);
        }
      });
      flushText();
      flushTable();

      return <div className="space-y-1">{blocks}</div>;
    }

    // Default line-by-line inline markdown parser
    return rawText.split('\n').map((line, lineIdx) => (
      <React.Fragment key={lineIdx}>
        {renderInlineMarkdown(line)}
        {lineIdx < rawText.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 right-6 z-50 w-[380px] glass-panel rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col"
          style={{ height: '560px' }}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border-b border-cyan-500/20 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>Aura AI</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </h3>
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] text-cyan-300 font-semibold">Powered by OpenAI & Live Database</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleReset}
                title="Clear chat"
                className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-500 text-slate-950 font-semibold rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                }`}>
                  {renderText(msg.text)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-900/60 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-cyan-300" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 pb-2 border-t border-slate-200/60 pt-2 bg-slate-50/40 flex gap-1.5 overflow-x-auto flex-shrink-0 scrollbar-hide">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 hover:border-cyan-500 hover:text-cyan-300 transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Aura AI any real estate question..."
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-600 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChatbot;
