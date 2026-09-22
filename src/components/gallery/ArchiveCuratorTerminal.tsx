'use client';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from '@phosphor-icons/react';
import { useCuratorService } from '../../services/curator/useCuratorService';
import { useAuditedRehearsalSessions } from '../../services/curator/auditedRehearsal';
import type { AuditedExchange } from '../../services/curator/auditedRehearsal';
import {
  IntersectionEnvironment,
  RESONANCE_INVITATIONS,
  type ResonanceRailId,
} from './IntersectionEnvironment';
import {
  getBuyerCuratorSession,
  saveBuyerCuratorSession,
} from '../../services/curator/buyerCuratorState';
import {
  resolveSessionConversationalLanguage,
  restoreConversationalLanguage,
} from '../../services/curator/conversationLanguage';
import {
  completedRailIds,
  nextEncounterTrigger,
  type EncounterCompletionSource,
  type EncounterTrigger,
  type RelationshipState,
} from '../../services/curator/encounterProtocol';
import { useUnvisitedMaterialsNotice } from '../../services/useUnvisitedMaterialsNotice';

const ARCHIVE_CURATOR_DISCLOSURE = 'Commissioned by the Artist. Judgment remains independent and bounded by the current Frame or Complete archive context; archive custody and token records do not certify lived stewardship.';

const archiveCuratorOpening = (role: 'PRACTITIONER' | 'STEWARD') => {
  const intro = 'The public threshold has closed.';
  return role === 'PRACTITIONER'
    ? `${intro} What in this Frame practice would you like to examine?`
    : `${intro} What in the canonical archive would you like to examine?`;
};

const MAX_ENCOUNTERS = 3;
interface Message {
  id: string;
  role: 'curator' | 'visitor';
  content: string;
  seal?: string;
  typedLength?: number;
  isTyping?: boolean;
}

interface ArchiveCuratorTerminalProps {
  onClose: () => void;
  role?: 'PRACTITIONER' | 'STEWARD';
  stewardImageUrl?: string | null;
  frameId?: string;
  relationship?: RelationshipState;
  walletAddress?: string;
}

export const ArchiveCuratorTerminal: React.FC<ArchiveCuratorTerminalProps> = ({
  onClose,
  role = 'STEWARD',
  stewardImageUrl,
  frameId,
  relationship: propRelationship,
  walletAddress,
}) => {
  const relationship: RelationshipState = propRelationship ?? (role === 'STEWARD' ? 'COMPLETE_HELD' : 'FRAME_HELD');
  const { sessions: rehearsalSessions, loading: rehearsalLoading } = useAuditedRehearsalSessions('FRAME_CURATOR', relationship);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [sessionRestored] = useState(() => {
    const existing = getBuyerCuratorSession(role);
    // A zero-progress transcript made only of failed transport attempts is not
    // an artistic encounter and must not shadow the audited DEVELOP rehearsal.
    if (existing?.encounterCount === 0 && existing.messages.some(message => message.seal === '[SYSTEM]')) {
      return null;
    }
    return existing;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    if (sessionRestored && sessionRestored.messages.length > 0) {
      return sessionRestored.messages;
    }
    return [
      {
        id: 'buyer-open-0',
        role: 'curator',
        content: archiveCuratorOpening(role),
        seal: '[FRAME CURATOR]',
        typedLength: archiveCuratorOpening(role).length,
        isTyping: false,
      },
    ];
  });
  const [input, setInput] = useState('');
  const [sessionConversationalLanguage, setSessionConversationalLanguage] = useState(
    () => restoreConversationalLanguage(sessionRestored?.sessionConversationalLanguage),
  );
  const [encounterCount, setEncounterCount] = useState(() => sessionRestored ? sessionRestored.encounterCount : 0);
  const [isLoading, setIsLoading] = useState(false);
  const [sealed, setSealed] = useState(() => Boolean(sessionRestored?.sealed));
  const [usedRails, setUsedRails] = useState<ResonanceRailId[]>(() => (sessionRestored?.usedRails as ResonanceRailId[]) || []);
  const [replayPrefixIntact, setReplayPrefixIntact] = useState(() => sessionRestored?.replayPrefixIntact ?? true);
  const { hasUnvisitedMaterials } = useUnvisitedMaterialsNotice();
  const [failedQueryRetry, setFailedQueryRetry] = useState<{
    query: string;
    source: FrameCompletionSource;
    inputSource: 'FREE_TEXT' | 'P_BLOCK';
  } | null>(null);
  const [completionSources, setCompletionSources] = useState<FrameCompletionSource[]>(
    () => sessionRestored?.completionSources ?? [],
  );
  const selectableTrigger = !sealed && !isLoading && !rehearsalLoading
    ? nextEncounterTrigger('FRAME_CURATOR', encounterCount)
    : null;

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const threadContainerRef = useRef<HTMLDivElement>(null);
  const requestInFlightRef = useRef(false);
  const curatorService = useCuratorService();
  const selectedSession = useMemo(
    () => rehearsalSessions.find(session => session.id === selectedSessionId) ?? rehearsalSessions[0] ?? null,
    [rehearsalSessions, selectedSessionId],
  );

  useEffect(() => {
    if (rehearsalSessions.length === 0) return;
    const nextSelection = rehearsalSessions.some(session => session.id === selectedSessionId)
      ? selectedSessionId
      : rehearsalSessions[0].id;
    if (nextSelection !== selectedSessionId) setSelectedSessionId(nextSelection);

    if (encounterCount === 0 && messages.length === 1 && messages[0].id === 'buyer-open-0') {
      const opening = rehearsalSessions.find(session => session.id === nextSelection)?.opening;
      if (opening && (messages[0].content !== opening.content || messages[0].seal !== opening.seal)) {
        setMessages([{
          id: 'buyer-open-0',
          role: 'curator',
          content: opening.content,
          seal: opening.seal,
          typedLength: opening.content.length,
          isTyping: false,
        }]);
      }
    }
  }, [encounterCount, messages, rehearsalSessions, selectedSessionId]);

  const [isTyping, setIsTyping] = useState(false);
  const [typingProgress, setTypingProgress] = useState(0);
  const [isArtworkFocused, setIsArtworkFocused] = useState(false);

  const showDialogueWave = encounterCount >= 3 || sealed;
  const curatorLeftEdgeRef = useRef<HTMLDivElement>(null);
  const curatorBottomEdgeRef = useRef<HTMLDivElement>(null);
  const curatorRightEdgeRef = useRef<HTMLDivElement>(null);
  const curatorTopEdgeRef = useRef<HTMLDivElement>(null);

  // Typewriter effect controller
  const startTypewriter = useCallback((messageId: string, fullText: string, onComplete?: () => void) => {
    setIsTyping(true);
    setTypingProgress(0);
    let currentLen = 0;
    const totalLen = fullText.length;
    const typingSpeed = 22; // ms per character

    const timer = setInterval(() => {
      currentLen += 1;
      const progress = currentLen / totalLen;
      setTypingProgress(progress);

      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, typedLength: currentLen, isTyping: currentLen < totalLen } : m))
      );

      if (currentLen >= totalLen) {
        clearInterval(timer);
        setIsTyping(false);
        setTypingProgress(1);
        onComplete?.();
      }
    }, typingSpeed);
  }, []);

  useEffect(() => {
    if (!showDialogueWave) return;

    let frameId: number;
    const cycleDuration = 8000;
    const startTime = performance.now();

    const animateDialogueWave = (now: number) => {
      const elapsed = (now - startTime) % cycleDuration;
      const theta = elapsed / cycleDuration;

      const resetEdge = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (ref.current) {
          ref.current.style.background = 'rgba(218,172,98,0.12)';
          ref.current.style.boxShadow = 'none';
        }
      };

      if (theta < 0.25) {
        // Left Edge (Top -> Bottom)
        const u = theta / 0.25;
        const intensity = Math.pow(Math.sin(Math.PI * u), 1.1);
        const uPct = u * 100;
        const uStart = Math.max(0, uPct - 18).toFixed(1);
        const uEnd = Math.min(100, uPct + 18).toFixed(1);
        const peakAlpha = (0.15 + 0.65 * intensity).toFixed(2);
        const dispersion = `-1px 0 ${(intensity * 8).toFixed(1)}px rgba(218,172,98,${(intensity * 0.40).toFixed(2)})`;
        const gradient = `linear-gradient(to bottom, rgba(218,172,98,0.12) 0%, rgba(218,172,98,0.12) ${uStart}%, rgba(218,172,98,${peakAlpha}) ${uPct.toFixed(1)}%, rgba(218,172,98,0.12) ${uEnd}%, rgba(218,172,98,0.12) 100%)`;

        if (curatorLeftEdgeRef.current) {
          curatorLeftEdgeRef.current.style.background = gradient;
          curatorLeftEdgeRef.current.style.boxShadow = dispersion;
        }
        resetEdge(curatorBottomEdgeRef);
        resetEdge(curatorRightEdgeRef);
        resetEdge(curatorTopEdgeRef);
      } else if (theta < 0.50) {
        // Bottom Edge (Left -> Right)
        const w = (theta - 0.25) / 0.25;
        const intensity = Math.pow(Math.sin(Math.PI * w), 1.1);
        const wPct = w * 100;
        const wStart = Math.max(0, wPct - 18).toFixed(1);
        const wEnd = Math.min(100, wPct + 18).toFixed(1);
        const peakAlpha = (0.15 + 0.65 * intensity).toFixed(2);
        const dispersion = `0 1px ${(intensity * 8).toFixed(1)}px rgba(218,172,98,${(intensity * 0.40).toFixed(2)})`;
        const gradient = `linear-gradient(to right, rgba(218,172,98,0.12) 0%, rgba(218,172,98,0.12) ${wStart}%, rgba(218,172,98,${peakAlpha}) ${wPct.toFixed(1)}%, rgba(218,172,98,0.12) ${wEnd}%, rgba(218,172,98,0.12) 100%)`;

        if (curatorBottomEdgeRef.current) {
          curatorBottomEdgeRef.current.style.background = gradient;
          curatorBottomEdgeRef.current.style.boxShadow = dispersion;
        }
        resetEdge(curatorLeftEdgeRef);
        resetEdge(curatorRightEdgeRef);
        resetEdge(curatorTopEdgeRef);
      } else if (theta < 0.75) {
        // Right Edge (Bottom -> Top)
        const v = (theta - 0.50) / 0.25;
        const intensity = Math.pow(Math.sin(Math.PI * v), 1.1);
        const vPct = v * 100;
        const vStart = Math.max(0, vPct - 18).toFixed(1);
        const vEnd = Math.min(100, vPct + 18).toFixed(1);
        const peakAlpha = (0.15 + 0.65 * intensity).toFixed(2);
        const dispersion = `1px 0 ${(intensity * 8).toFixed(1)}px rgba(218,172,98,${(intensity * 0.40).toFixed(2)})`;
        const gradient = `linear-gradient(to top, rgba(218,172,98,0.12) 0%, rgba(218,172,98,0.12) ${vStart}%, rgba(218,172,98,${peakAlpha}) ${vPct.toFixed(1)}%, rgba(218,172,98,0.12) ${vEnd}%, rgba(218,172,98,0.12) 100%)`;

        if (curatorRightEdgeRef.current) {
          curatorRightEdgeRef.current.style.background = gradient;
          curatorRightEdgeRef.current.style.boxShadow = dispersion;
        }
        resetEdge(curatorLeftEdgeRef);
        resetEdge(curatorBottomEdgeRef);
        resetEdge(curatorTopEdgeRef);
      } else {
        // Top Edge (Right -> Left)
        const z = (theta - 0.75) / 0.25;
        const intensity = Math.pow(Math.sin(Math.PI * z), 1.1);
        const zPct = z * 100;
        const zStart = Math.max(0, zPct - 18).toFixed(1);
        const zEnd = Math.min(100, zPct + 18).toFixed(1);
        const peakAlpha = (0.15 + 0.65 * intensity).toFixed(2);
        const dispersion = `0 -1px ${(intensity * 8).toFixed(1)}px rgba(218,172,98,${(intensity * 0.40).toFixed(2)})`;
        const gradient = `linear-gradient(to left, rgba(218,172,98,0.12) 0%, rgba(218,172,98,0.12) ${zStart}%, rgba(218,172,98,${peakAlpha}) ${zPct.toFixed(1)}%, rgba(218,172,98,0.12) ${zEnd}%, rgba(218,172,98,0.12) 100%)`;

        if (curatorTopEdgeRef.current) {
          curatorTopEdgeRef.current.style.background = gradient;
          curatorTopEdgeRef.current.style.boxShadow = dispersion;
        }
        resetEdge(curatorLeftEdgeRef);
        resetEdge(curatorBottomEdgeRef);
        resetEdge(curatorRightEdgeRef);
      }

      frameId = requestAnimationFrame(animateDialogueWave);
    };

    frameId = requestAnimationFrame(animateDialogueWave);
    return () => cancelAnimationFrame(frameId);
  }, [showDialogueWave]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!sealed) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [sealed]);

  const submitQuery = async (
    query: string,
    source: FrameCompletionSource,
    presetExchange?: AuditedExchange,
    inputSource: 'FREE_TEXT' | 'P_BLOCK' = 'FREE_TEXT',
  ) => {
      if (!query.trim() || requestInFlightRef.current || isLoading || isTyping || sealed || encounterCount >= MAX_ENCOUNTERS) return;
      const trigger = nextEncounterTrigger('FRAME_CURATOR', encounterCount);
      if (!trigger) return;
      
      const trimmed = query.trim();
      // Prepared prompts and audited canonical text do not choose the visitor's language.
      const nextConversationLanguage = inputSource === 'FREE_TEXT'
        ? resolveSessionConversationalLanguage(sessionConversationalLanguage, trimmed)
        : sessionConversationalLanguage;
      setSessionConversationalLanguage(nextConversationLanguage);
      const nextReplayPrefixIntact = source === 'live' ? false : replayPrefixIntact;
      requestInFlightRef.current = true;
      setInput('');
      if (source === 'live') setReplayPrefixIntact(false);
      const userMsg: Message = { id: `visitor-${Date.now()}`, role: 'visitor', content: trimmed, typedLength: trimmed.length, isTyping: false };
      // Strip any prior transport error notices and unfulfilled visitor queries that had no curator answer
      const validMessages = messages.filter(m => m.id !== 'frame-curator-transport-error' && m.seal !== '[SYSTEM]');
      const cleanHistory: Message[] = [];
      for (let i = 0; i < validMessages.length; i++) {
        const msg = validMessages[i];
        if (msg.role === 'visitor') {
          const next = validMessages[i + 1];
          // Only keep a prior visitor turn if it was successfully answered by a curator turn
          if (next && next.role === 'curator') {
            cleanHistory.push(msg);
          }
        } else {
          cleanHistory.push(msg);
        }
      }
      const nextMessages = [...cleanHistory, userMsg];
      setMessages(nextMessages);
      setIsLoading(true);
  
      try {
        let responseContent: string;
        let responseSeal: string;
        const exactAuditedReplay = source === 'audited-preset'
          && replayPrefixIntact
          && presetExchange?.trigger === trigger;

        if (exactAuditedReplay && presetExchange) {
          await new Promise(resolve => window.setTimeout(resolve, 320));
          responseContent = presetExchange.curator;
          responseSeal = presetExchange.curatorSeal;
        } else {
          const response = await curatorService.query({
            surface: 'FRAME_CURATOR',
            relationship,
            language: nextConversationLanguage,
            trigger,
            dialogue: nextMessages.map(message => ({
              role: message.role,
              content: message.content,
              seal: message.seal,
            })),
            frameId,
            walletAddress,
          });
          responseContent = response.content;
          responseSeal = response.seal;
        }
        const newCount = encounterCount + 1;
        setEncounterCount(newCount);
        setCompletionSources(prev => [...prev, source]);
  
        const curatorMsgId = `curator-${Date.now()}`;
        setMessages(prev => [
          ...prev,
          {
            id: curatorMsgId,
            role: 'curator',
            content: responseContent,
            seal: responseSeal,
            typedLength: 0,
            isTyping: true,
          },
        ]);
        
        setIsLoading(false);

        startTypewriter(curatorMsgId, responseContent, () => {
          const nextRails = completedRailIds('FRAME_CURATOR', newCount);
          setUsedRails(nextRails);
          const isCompleted = newCount >= MAX_ENCOUNTERS;
          if (isCompleted) {
            setSealed(true);
          }
    
          setMessages(prev => {
            saveBuyerCuratorSession({
              messages: prev,
              encounterCount: newCount,
              sealed: isCompleted,
              usedRails: nextRails,
              status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
              replayPrefixIntact: nextReplayPrefixIntact,
              completionSources: [...completionSources, source],
              rehearsalSessionId: selectedSession?.id,
              sessionConversationalLanguage: nextConversationLanguage,
            }, role);
            return prev;
          });
        });
      } catch (err: any) {
        setFailedQueryRetry({
          query: trimmed,
          source,
          inputSource,
        });
        setMessages(prev => {
          let content = 'The Curator is temporarily unavailable. Your message remains in the visible dialogue; no Curator response was received.';
          if (err instanceof Error && err.message.includes('FRAME_MATERIAL_INCOMPLETE')) {
            content = 'The structural elements required for this Frame are currently out of reach. The practice cannot proceed at this moment.';
          }
          const errorMessage: Message = {
            id: 'frame-curator-transport-error',
            role: 'curator',
            content,
            seal: '[SYSTEM]',
          };
          const withoutPriorError = prev.filter(message => message.id !== errorMessage.id);
          return [...withoutPriorError, errorMessage];
        });
        setTimeout(() => inputRef.current?.focus(), 100);
      } finally {
        requestInFlightRef.current = false;
        setIsLoading(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sealed || encounterCount >= MAX_ENCOUNTERS) return;
    void submitQuery(input, 'live');
  };

  const handleGuidedTrigger = (trigger: EncounterTrigger) => {
    if (trigger !== selectableTrigger || isLoading || sealed || trigger === 'IMAGE') return;
    const auditedExchange = selectedSession?.exchanges[encounterCount];
    if (replayPrefixIntact && auditedExchange?.trigger === trigger) {
      void submitQuery(auditedExchange.visitor, 'audited-preset', auditedExchange, 'P_BLOCK');
      return;
    }

    const guidedQuery = RESONANCE_INVITATIONS[trigger];
    if (guidedQuery) {
      void submitQuery(guidedQuery, 'live', undefined, 'P_BLOCK');
    }
  };

  const handleRailSelect = (rail: ResonanceRailId) => {
    handleGuidedTrigger(rail);
  };

  const handleImageSelect = () => {
    inputRef.current?.focus();
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (threadContainerRef.current) {
      threadContainerRef.current.scrollTop += e.deltaY;
    }
  };

  return (
    <div
      onWheel={handleWheel}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Translucent backdrop — separate layer so backdropFilter doesn't create a
          compositing context that breaks backgroundImage rendering inside IntersectionEnvironment */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(6,7,8,0.52)',
        backdropFilter: 'blur(8px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <IntersectionEnvironment
        role={role}
        relationship={relationship}
        walletAddress={walletAddress}
        encounterCount={encounterCount}
        usedRails={usedRails}
        isTyping={isTyping}
        typingProgress={typingProgress}
        onArtworkFocusChange={setIsArtworkFocused}
        onSelectRail={handleRailSelect}
        selectableTrigger={selectableTrigger}
        onSelectImage={handleImageSelect}
        stewardImageUrl={stewardImageUrl}
        ritualContentMode="held"
      />
      {/* Glass reflection top edge */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 25%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.14) 75%, transparent 100%)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Ambient glass glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 70% 20%, rgba(218,172,98,0.04) 0%, transparent 55%)',
        pointerEvents: 'none',
      }} />

      {/* Container for UI elements */}
      <div style={{ position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* Terminal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 28px 16px',
          borderBottom: '1px solid rgba(232,235,238,0.08)',
          flexShrink: 0,
          position: 'relative',
          zIndex: 40,
          pointerEvents: 'auto',
          background: 'rgba(6,7,8,0.65)',
          backdropFilter: 'blur(12px)',
        }}>
          <div>
            <div className="t-mono-label" style={{ color: 'rgba(237,236,234,0.85)', fontSize: '0.68rem', letterSpacing: '0.18em' }}>
              FRAME CURATOR V2 · INDEPENDENT JUDGMENT
            </div>
            <div
              className="t-mono-tag"
              title={ARCHIVE_CURATOR_DISCLOSURE}
              aria-label={ARCHIVE_CURATOR_DISCLOSURE}
              style={{ marginTop: 5, color: 'rgba(218,172,98,0.5)', fontSize: '0.52rem', letterSpacing: '0.16em' }}
            >
              {role === 'PRACTITIONER' ? 'FRAME PRACTICE · P3–P4 · 3 ENCOUNTERS' : 'COMPLETE ARCHIVE · 3 ENCOUNTERS'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div className="t-mono-tag" style={{ color: 'rgba(150,165,185,0.6)', letterSpacing: '0.2em' }}>
              {encounterCount} / {MAX_ENCOUNTERS}
            </div>
            <button
              onClick={onClose}
              aria-label="Close Curator Terminal"
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

        {/* ── Message thread container (Relative non-scrolling wrapper with semantic waveguides) ── */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderLeft: '1px solid rgba(218,172,98,0.35)',
            borderBottom: '1px solid rgba(218,172,98,0.35)',
            borderRight: encounterCount >= 1 ? '1px solid rgba(218,172,98,0.35)' : '1px solid transparent',
            borderTop: encounterCount >= 2 ? '1px solid rgba(218,172,98,0.35)' : '1px solid transparent',
            boxShadow: encounterCount >= 3
              ? '0 0 35px rgba(218,172,98,0.16)'
              : encounterCount >= 2
                ? '-4px 4px 20px rgba(218,172,98,0.10)'
                : encounterCount >= 1
                  ? '-4px 0 16px rgba(218,172,98,0.06)'
                  : 'none',
          }}
        >
          <div
            ref={threadContainerRef}
            className="no-scrollbar"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              pointerEvents: 'none',
            }}
          >
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => {
                const isCurator = msg.role === 'curator';
                const isSystem = msg.seal === '[SYSTEM]';
                const displayText = msg.typedLength !== undefined ? msg.content.slice(0, msg.typedLength) : msg.content;
                
                return (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      maxWidth: !isCurator ? '70%' : '88%',
                      alignSelf: !isCurator ? 'flex-end' : 'flex-start',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    {/* Curator seal or System tag */}
                    {isCurator && msg.seal && (
                      <div className="t-mono-tag" style={{
                        marginBottom: 6,
                        color: isSystem ? 'rgba(218,172,98,0.55)' : 'rgba(218,172,98,0.75)',
                        letterSpacing: '0.22em',
                        fontSize: '0.58rem',
                        userSelect: 'none',
                      }}
                      >
                        {/^[0-9a-fA-F]{64}$/.test(msg.seal) ? '[FRAME CURATOR]' : msg.seal}
                      </div>
                    )}

                    <div
                      className={isCurator && !isSystem ? 't-curator-response' : ''}
                      style={{
                        fontFamily: isCurator ? 'var(--font-mono)' : 'var(--font-display)',
                        fontSize: isCurator ? '0.78rem' : '0.82rem',
                        lineHeight: isCurator ? 1.9 : 1.6,
                        letterSpacing: isCurator ? '0.02em' : '0.01em',
                        textTransform: 'none',
                        color: isSystem
                          ? 'rgba(237,236,234,0.75)'
                          : isCurator
                          ? 'rgba(237,236,234,0.95)'
                          : 'rgba(237,236,234,0.88)',
                        fontStyle: isSystem ? 'italic' : 'normal',
                        textAlign: !isCurator ? 'right' : 'left',
                        whiteSpace: 'pre-wrap',
                        userSelect: 'none',
                        pointerEvents: 'none',
                        background: isArtworkFocused
                          ? 'transparent'
                          : (isSystem ? 'rgba(14, 16, 22, 0.85)' : isCurator ? 'rgba(7, 8, 11, 0.86)' : 'rgba(12, 14, 18, 0.78)'),
                        backdropFilter: isArtworkFocused ? 'none' : 'blur(16px)',
                        WebkitBackdropFilter: isArtworkFocused ? 'none' : 'blur(16px)',
                        border: isSystem
                          ? '1px solid rgba(218, 172, 98, 0.18)'
                          : isCurator
                          ? (isArtworkFocused ? '1px solid rgba(218, 172, 98, 0.08)' : '1px solid rgba(218, 172, 98, 0.22)')
                          : (isArtworkFocused ? '1px solid rgba(232, 235, 238, 0.04)' : '1px solid rgba(232, 235, 238, 0.12)'),
                        borderLeft: isSystem
                          ? '3px solid rgba(218, 172, 98, 0.45)'
                          : isCurator
                          ? (isArtworkFocused ? '3px solid rgba(218, 172, 98, 0.3)' : '3px solid rgba(218, 172, 98, 0.70)')
                          : (isArtworkFocused ? '1px solid rgba(232, 235, 238, 0.04)' : '1px solid rgba(232, 235, 238, 0.12)'),
                        boxShadow: isArtworkFocused ? 'none' : '0 12px 36px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)',
                        padding: isCurator ? '14px 18px' : '10px 16px',
                        transition: 'background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
                      }}
                    >
                      {displayText}
                      {msg.isTyping && (
                        <span
                          style={{
                            display: 'inline-block',
                            width: 6,
                            height: 12,
                            background: 'rgba(218,172,98,0.85)',
                            marginLeft: 4,
                            verticalAlign: 'middle',
                            animation: 'blink 0.8s infinite',
                          }}
                        />
                      )}
                    </div>
                    {isSystem && failedQueryRetry && (
                      <div style={{ position: 'relative', display: 'inline-block', pointerEvents: 'auto' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const retry = failedQueryRetry;
                            if (!retry || isLoading || isTyping) return;
                            setFailedQueryRetry(null);
                            setMessages(prev => prev.filter(m => m.id !== 'frame-curator-transport-error' && m.id !== msg.id));
                            if (retry.inputSource === 'FREE_TEXT') {
                              setInput(retry.query);
                              setTimeout(() => inputRef.current?.focus(), 100);
                            } else {
                              void submitQuery(retry.query, retry.source, undefined, retry.inputSource);
                            }
                          }}
                          disabled={isLoading || isTyping}
                          className="t-mono-tag"
                          style={{
                            marginTop: 8,
                            background: 'transparent',
                            border: '1px solid rgba(218,172,98,0.44)',
                            color: 'rgba(218,172,98,0.92)',
                            cursor: isLoading || isTyping ? 'default' : 'pointer',
                            padding: '6px 10px',
                            letterSpacing: '0.16em',
                            fontSize: '0.54rem',
                          }}
                          title="Retry with the Frame Curator. Resend your inquiry when connection is available."
                        >
                          RETRY
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Contemplation indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="t-mono-tag"
                style={{
                  color: 'rgba(218,172,98,0.75)',
                  padding: '8px 14px',
                  background: 'rgba(7, 8, 11, 0.8)',
                  backdropFilter: 'blur(12px)',
                  display: 'inline-block',
                  maxWidth: 260,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                THE CURATOR IS CONTEMPLATING —
                <span style={{ display: 'inline-block', animation: 'pulse 1.4s ease-in-out infinite' }}>
                  {' '}···
                </span>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Semantic 4-Edge Counter-Clockwise Waveguide on Dialogue Viewport */}
          {showDialogueWave && (
            <>
              {/* Left edge */}
              <div
                ref={curatorLeftEdgeRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: 1.5,
                  pointerEvents: 'none',
                  zIndex: 25,
                  background: 'rgba(218,172,98,0.12)',
                  transition: 'box-shadow 0.1s ease',
                }}
              />
              {/* Bottom edge */}
              <div
                ref={curatorBottomEdgeRef}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 1.5,
                  pointerEvents: 'none',
                  zIndex: 25,
                  background: 'rgba(218,172,98,0.12)',
                  transition: 'box-shadow 0.1s ease',
                }}
              />
              {/* Right edge */}
              <div
                ref={curatorRightEdgeRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: 1.5,
                  pointerEvents: 'none',
                  zIndex: 25,
                  background: 'rgba(218,172,98,0.12)',
                  transition: 'box-shadow 0.1s ease',
                }}
              />
              {/* Top edge */}
              <div
                ref={curatorTopEdgeRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1.5,
                  pointerEvents: 'none',
                  zIndex: 25,
                  background: 'rgba(218,172,98,0.12)',
                  transition: 'box-shadow 0.1s ease',
                }}
              />
            </>
          )}
        </div>

        {/* Input */}
        <div style={{
          borderTop: '1px solid rgba(232,235,238,0.08)',
          padding: '16px 28px 20px',
          flexShrink: 0,
          position: 'relative',
          zIndex: 40,
          pointerEvents: 'auto',
          background: 'rgba(6,7,8,0.70)',
          backdropFilter: 'blur(12px)',
        }}>
          {sealed ? (
            <div className="t-mono-tag" style={{
              color: 'rgba(218,172,98,0.5)',
              textAlign: 'center',
              letterSpacing: '0.2em',
            }}>
              THIS SESSION IS COMPLETE
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="t-mono-tag" style={{ flexShrink: 0, color: 'rgba(218,172,98,0.5)' }}>›</span>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isTyping ? "Curator is responding..." : "Choose an added frame edge, or ask in your own words..."}
                disabled={isLoading || isTyping || sealed || encounterCount >= MAX_ENCOUNTERS}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.06em',
                  color: 'rgba(237,236,234,0.85)',
                  caretColor: 'rgba(218,172,98,0.85)',
                }}
              />
              <button
                type="submit"
                disabled={isLoading || isTyping || sealed || encounterCount >= MAX_ENCOUNTERS || !input.trim()}
                aria-label="Send query"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: input.trim() && !isLoading && !isTyping ? 'pointer' : 'default',
                  color: input.trim() && !isLoading && !isTyping
                    ? 'rgba(218,172,98,0.85)'
                    : 'rgba(237,236,234,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s ease',
                  padding: 0,
                }}
              >
                <ArrowRight size={14} weight="bold" />
              </button>
            </form>
          )}
          <div 
            className="t-mono-tag"
            style={{
              marginTop: 20,
              paddingTop: 12,
              borderTop: '1px solid rgba(232,235,238,0.04)',
              color: 'rgba(237,236,234,0.22)',
              fontSize: '0.42rem',
              lineHeight: 1.8,
              letterSpacing: '0.14em',
              textAlign: 'center',
            }}
          >
            AI-GENERATED · FOR THE AESTHETIC ENCOUNTER ONLY · NOT LEGAL OR FINANCIAL COMMITMENTS.{' '}
            DO NOT SUBMIT CONFIDENTIAL INFORMATION.{' '}
            <a
              href="/gallery/materials"
              target="_blank"
              rel="noopener noreferrer"
              className={hasUnvisitedMaterials ? 'materials-beacon-pulse' : ''}
              style={{
                color: 'rgba(218,172,98,0.38)',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(218,172,98,0.18)',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(218,172,98,0.7)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(218,172,98,0.38)'; }}
            >
              RETRIEVE YOUR CURATOR MATERIALS ↗
            </a>
          </div>
        </div>
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
type FrameCompletionSource = Exclude<EncounterCompletionSource, 'fallback'>;
