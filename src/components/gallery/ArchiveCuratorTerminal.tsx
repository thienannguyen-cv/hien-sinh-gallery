'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from '@phosphor-icons/react';
import { useCuratorService } from '../../services/curator/useCuratorService';

const FALLBACK_ARCHIVE_STATEMENT = `I am the Archive Curator, bound to this specific frame.

My purpose is not to guard the threshold, but to illuminate the interior structure of the work you now hold. I will only answer inquiries regarding the historical and conceptual anatomy of this specific encounter.

What do you seek within the archive?`;

const MAX_ENCOUNTERS = 3;

interface Message {
  role: 'oracle' | 'visitor';
  content: string;
  seal?: string;
}

interface ArchiveCuratorTerminalProps {
  onClose: () => void;
}

export const ArchiveCuratorTerminal: React.FC<ArchiveCuratorTerminalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'oracle',
      content: FALLBACK_ARCHIVE_STATEMENT,
      seal: '[ARCHIVE PROTOCOL]',
    },
  ]);
  const [input, setInput] = useState('');
  const [encounterCount, setEncounterCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sealed, setSealed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const curatorService = useCuratorService();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!sealed) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [sealed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || sealed || encounterCount >= MAX_ENCOUNTERS) return;

    const query = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'visitor', content: query }]);
    setIsLoading(true);

    try {
      const response = await curatorService.query(query, encounterCount);
      const newCount = encounterCount + 1;
      setEncounterCount(newCount);

      const sealMatch = response.match(/^\[(FACT|ARTIST STATEMENT|INFERENCE|Fact|Artist statement|Inference)\]/i);
      const seal = sealMatch ? sealMatch[0].toUpperCase() : undefined;

      setMessages(prev => [...prev, {
        role: 'oracle',
        content: response,
        seal,
      }]);

      if (newCount >= MAX_ENCOUNTERS) {
        setSealed(true);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'oracle',
            content: 'The archival inquiry limit is reached. The dossier is now closed.',
            seal: '[ARCHIVE SEALED]',
          }]);
        }, 1200);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'oracle',
        content: '[ ORACLE_STATUS // ARCHIVE_UNREACHABLE ] — The archive node is currently desynced. Please try again.',
        seal: '[SYSTEM]',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Terminal Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 28px 16px',
        borderBottom: '1px solid rgba(232,235,238,0.08)',
        flexShrink: 0,
      }}>
        <div>
          <div className="t-mono-tag" style={{ marginBottom: 4, color: 'rgba(150,165,185,0.8)' }}>
            ORACLE ID — #01-ARCHIVE
          </div>
          <div className="t-mono-label" style={{ color: 'rgba(237,236,234,0.4)', fontSize: '0.7rem' }}>
            ARCHIVE CURATOR // INNER SANCTUM
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="t-mono-tag" style={{ color: 'rgba(150,165,185,0.6)' }}>
            INQUIRY — {encounterCount}/{MAX_ENCOUNTERS}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid rgba(232,235,238,0.12)',
              color: 'rgba(237,236,234,0.5)',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(232,235,238,0.3)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(237,236,234,0.9)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(232,235,238,0.12)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(237,236,234,0.5)';
            }}
          >
            <X size={14} weight="light" />
          </button>
        </div>
      </div>

      {/* Message thread */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                maxWidth: msg.role === 'visitor' ? '70%' : '100%',
                alignSelf: msg.role === 'visitor' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.role === 'oracle' && msg.seal && (
                <div className="t-mono-tag" style={{
                  marginBottom: 6,
                  color: 'rgba(150,165,185,0.55)',
                  letterSpacing: '0.22em',
                }}>
                  {msg.seal}
                </div>
              )}

              <div
                className={msg.role === 'oracle' ? 't-curator-response' : 't-mono-label'}
                style={{
                  color: msg.role === 'oracle'
                    ? 'rgba(237,236,234,0.88)'
                    : 'rgba(237,236,234,0.50)',
                  fontStyle: msg.role === 'visitor' ? 'italic' : 'normal',
                  textAlign: msg.role === 'visitor' ? 'right' : 'left',
                  borderLeft: msg.role === 'oracle'
                    ? '1px solid rgba(150,165,185,0.25)'
                    : 'none',
                  paddingLeft: msg.role === 'oracle' ? 12 : 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="t-mono-tag"
            style={{ color: 'rgba(150,165,185,0.45)' }}
          >
            RETRIEVING FROM ARCHIVE —
            <span style={{ display: 'inline-block', animation: 'pulse 1.4s ease-in-out infinite' }}>
              {' '}···
            </span>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid rgba(232,235,238,0.07)',
        padding: '16px 28px 20px',
        flexShrink: 0,
      }}>
        {sealed ? (
          <div className="t-mono-tag" style={{
            color: 'rgba(150,165,185,0.35)',
            textAlign: 'center',
            letterSpacing: '0.2em',
          }}>
            [ ARCHIVE TERMINAL SEALED ]
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span className="t-mono-tag" style={{ flexShrink: 0, opacity: 0.5 }}>›</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Inquire..."
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.06em',
                color: 'rgba(237,236,234,0.75)',
                caretColor: 'rgba(150,165,185,0.7)',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                background: 'none',
                border: 'none',
                cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                color: input.trim() && !isLoading
                  ? 'rgba(150,165,185,0.65)'
                  : 'rgba(237,236,234,0.15)',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s ease',
                padding: 0,
              }}
            >
              <ArrowRight size={14} weight="light" />
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};
