'use client';
/**
 * CuratorTerminal — Full-screen Public Curator dialogue
 *
 * Activated when visitor touches the Curator glass panel.
 * Features:
 *  - Persistent encounter state in localStorage with wallet admission tracking
 *  - Canonical public summary fallback if storage is cleared for admitted wallet
 *  - Gated direct entry point: "CONCLUDE ENCOUNTER →" upon completing the 3 inquiries
 *  - Typewriter animation for curatorial responses
 *  - Progressive edge glow & Refractive edge waveguides
 *  - Self-contained IntersectionEnvironment with hysteresis hover hitbox
 *  - Frosted message shielding ensuring 100% text clarity over background watermarks
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from '@phosphor-icons/react';
import { useCuratorService } from '../../services/curator/useCuratorService';
import { useAuditedRehearsalSessions } from '../../services/curator/auditedRehearsal';
import type { AuditedExchange } from '../../services/curator/auditedRehearsal';
import {
  completedRailIds,
  nextEncounterTrigger,
  type EncounterCompletionSource,
  type EncounterTrigger,
  type RelationshipState,
} from '../../services/curator/encounterProtocol';
import {
  IntersectionEnvironment,
  RESONANCE_INVITATIONS,
  type ResonanceRailId,
} from './IntersectionEnvironment';
import {
  getPublicCuratorSession,
  savePublicCuratorSession,
  admitPublicWallet,
  CANONICAL_PUBLIC_SUMMARY_MESSAGES,
} from '../../services/curator/publicCuratorState';
import { useLocalPresentationEnvironment } from '../../security/useLocalPresentationEnvironment';

const CURATOR_DISCLOSURE = 'Commissioned by the Artist. Judgment remains independent; responses may disagree, report no felt response, or find the available evidence insufficient.';
const PUBLIC_CURATOR_OPENING = 'Bạn đang ở cuộc gặp công khai với Hiện sinh. Tôi đồng hành cùng bạn quan sát tác phẩm; mọi phán xét đối với hình ảnh sau cùng vẫn hoàn toàn thuộc về bạn.';

const MAX_ENCOUNTERS = 3;

const PUBLIC_IMAGE_INVITATION = 'Help me stay with the representation itself as the third exchange. Begin from what is visible now, distinguish observation from inference, and leave the final naming of the encounter with me.';

interface Message {
  id: string;
  role: 'curator' | 'visitor';
  content: string;
  seal?: string;
  typedLength?: number;
  isTyping?: boolean;
}

interface CuratorTerminalProps {
  onClose: () => void;
  onEnterAtelier?: () => void;
}

export const CuratorTerminal: React.FC<CuratorTerminalProps> = ({ onClose, onEnterAtelier }) => {
  const localPresentation = useLocalPresentationEnvironment();
  const isHolderRole = localPresentation?.perspective === 'PRACTITIONER' || localPresentation?.perspective === 'STEWARD';
  const relationship: RelationshipState = localPresentation?.perspective === 'STEWARD'
    ? 'COMPLETE_HELD'
    : localPresentation?.perspective === 'PRACTITIONER'
      ? 'FRAME_HELD'
      : 'PUBLIC';
  const { sessions: rehearsalSessions, loading: rehearsalLoading } = useAuditedRehearsalSessions('PUBLIC_CURATOR', relationship);
  const [selectedSessionId, setSelectedSessionId] = useState('');

  const [sessionRestored] = useState(() => {
    const existing = getPublicCuratorSession();
    if (isHolderRole) {
      // A verified Practitioner/Steward has already surpassed the Public threshold.
      // If a completed session exists, restore it; otherwise render the full 3-step Canonical Summary.
      if (existing && existing.sealed && existing.encounterCount >= 3) {
        return existing;
      }
      return {
        messages: CANONICAL_PUBLIC_SUMMARY_MESSAGES,
        encounterCount: 3,
        sealed: true,
        usedRails: ['P1', 'P2'] as ResonanceRailId[],
        status: 'PUBLIC_COMPLETED' as const,
      };
    }
    return existing;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    if (sessionRestored && sessionRestored.messages.length > 0) {
      return sessionRestored.messages;
    }
    return [
      {
        id: 'msg-0',
        role: 'curator',
        content: PUBLIC_CURATOR_OPENING,
        seal: '[PUBLIC CURATOR]',
        typedLength: PUBLIC_CURATOR_OPENING.length,
        isTyping: false,
      },
    ];
  });

  const [input, setInput] = useState('');
  const [encounterCount, setEncounterCount] = useState<number>(() => sessionRestored?.encounterCount ?? (isHolderRole ? 3 : 0));
  const [isLoading, setIsLoading] = useState(false);
  const [sealed, setSealed] = useState<boolean>(() => sessionRestored?.sealed ?? isHolderRole);
  const [usedRails, setUsedRails] = useState<ResonanceRailId[]>(() => (sessionRestored?.usedRails as ResonanceRailId[]) ?? (isHolderRole ? ['P1', 'P2'] : []));
  const [isTyping, setIsTyping] = useState(false);
  const [typingProgress, setTypingProgress] = useState(0);
  const [isArtworkFocused, setIsArtworkFocused] = useState(false);
  const [replayPrefixIntact, setReplayPrefixIntact] = useState(() => sessionRestored?.replayPrefixIntact ?? true);
  const [completionSources, setCompletionSources] = useState<EncounterCompletionSource[]>(
    () => sessionRestored?.completionSources ?? [],
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const threadContainerRef = useRef<HTMLDivElement>(null);
  const requestInFlightRef = useRef(false);

  const curatorService = useCuratorService();
  const selectedSession = useMemo(
    () => rehearsalSessions.find(session => session.id === selectedSessionId) ?? rehearsalSessions[0] ?? null,
    [rehearsalSessions, selectedSessionId],
  );
  const selectableTrigger = !sealed && !isLoading && !isTyping && !rehearsalLoading
    ? nextEncounterTrigger('PUBLIC_CURATOR', encounterCount)
    : null;

  useEffect(() => {
    if (rehearsalSessions.length === 0) return;
    const nextSelection = rehearsalSessions.some(session => session.id === selectedSessionId)
      ? selectedSessionId
      : rehearsalSessions[0].id;
    if (nextSelection !== selectedSessionId) setSelectedSessionId(nextSelection);

    if (encounterCount === 0 && messages.length === 1 && messages[0].id === 'msg-0') {
      const opening = rehearsalSessions.find(session => session.id === nextSelection)?.opening;
      if (opening && (messages[0].content !== opening.content || messages[0].seal !== opening.seal)) {
        setMessages([{
          id: 'msg-0',
          role: 'curator',
          content: opening.content,
          seal: opening.seal,
          typedLength: opening.content.length,
          isTyping: false,
        }]);
      }
    }
  }, [encounterCount, messages, rehearsalSessions, selectedSessionId]);

  // Persist session to localStorage
  useEffect(() => {
    savePublicCuratorSession({
      messages,
      encounterCount,
      sealed,
      usedRails,
      replayPrefixIntact,
      completionSources,
      rehearsalSessionId: selectedSession?.id,
      status: sealed || encounterCount >= MAX_ENCOUNTERS ? 'PUBLIC_COMPLETED' : 'IN_PROGRESS',
      completedAt: sealed ? Date.now() : undefined,
    });
  }, [completionSources, encounterCount, messages, replayPrefixIntact, sealed, selectedSession?.id, usedRails]);

  // ── Semantic 2-Edge Waveguide (Locked to Dialogue Viewport) ──
  const showDialogueWave = encounterCount >= 3;
  const curatorLeftEdgeRef = useRef<HTMLDivElement>(null);
  const curatorBottomEdgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDialogueWave) return;

    let frameId: number;
    const cycleDuration = 7000;
    const startTime = performance.now();

    const animateDialogueWave = (now: number) => {
      const elapsed = (now - startTime) % cycleDuration;
      const s = (1 - Math.cos((2 * Math.PI * elapsed) / cycleDuration)) / 2;

      const resetEdge = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (ref.current) {
          ref.current.style.background = 'rgba(218,172,98,0.12)';
          ref.current.style.boxShadow = 'none';
        }
      };

      if (s <= 0.5) {
        const u = s / 0.5;
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
      } else {
        const w = (s - 0.5) / 0.5;
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

  // Typewriter effect controller
  const startTypewriter = useCallback((messageId: string, fullText: string, onComplete?: () => void) => {
    setIsTyping(true);
    setTypingProgress(0);
    let currentLen = 0;
    const totalLen = fullText.length;
    const speed = Math.max(12, Math.min(22, Math.floor(2400 / totalLen))); // Dynamic readable speed

    const timer = setInterval(() => {
      currentLen += 1;
      const progress = Math.min(1, currentLen / totalLen);
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
    }, speed);
  }, []);

  const submitQuery = async (
    query: string,
    source: EncounterCompletionSource,
    presetExchange?: AuditedExchange,
  ) => {
    if (!query.trim() || requestInFlightRef.current || isLoading || sealed || isTyping || encounterCount >= MAX_ENCOUNTERS) return;
    const trigger = nextEncounterTrigger('PUBLIC_CURATOR', encounterCount);
    if (!trigger) return;

    requestInFlightRef.current = true;
    setInput('');
    if (source === 'live') setReplayPrefixIntact(false);
    const userMsgId = 'visitor-' + Date.now();
    const visitorMessage: Message = {
      id: userMsgId,
      role: 'visitor',
      content: query.trim(),
      typedLength: query.trim().length,
      isTyping: false,
    };
    setMessages(prev => [
      ...prev,
      visitorMessage,
    ]);
    setIsLoading(true);

    try {
      let responseText: string;
      let seal: string;
      const exactAuditedReplay = source === 'audited-preset'
        && replayPrefixIntact
        && presetExchange?.trigger === trigger;

      if (exactAuditedReplay && presetExchange) {
        await new Promise(resolve => window.setTimeout(resolve, 320));
        responseText = presetExchange.curator;
        seal = presetExchange.curatorSeal;
      } else {
        const response = await curatorService.query({
          surface: 'PUBLIC_CURATOR',
          relationship,
          language: 'vi',
          trigger,
          dialogue: [...messages, visitorMessage].map(message => ({
            role: message.role,
            content: message.content,
            seal: message.seal,
          })),
        });
        responseText = response.content;
        seal = response.seal;
      }

      const newCount = encounterCount + 1;
      setEncounterCount(newCount);
      setUsedRails(completedRailIds('PUBLIC_CURATOR', newCount));
      setCompletionSources(prev => [...prev, source]);

      const curatorMsgId = 'curator-' + Date.now();
      setMessages(prev => [
        ...prev,
        {
          id: curatorMsgId,
          role: 'curator',
          content: responseText,
          seal,
          typedLength: 0,
          isTyping: true,
        },
      ]);

      setIsLoading(false);

      // Start Typewriter
      startTypewriter(curatorMsgId, responseText, () => {
        if (newCount >= MAX_ENCOUNTERS) {
          setSealed(true);
          admitPublicWallet();
        }
      });
    } catch (reason) {
      setIsLoading(false);
      setMessages(prev => {
        const errorMessage: Message = {
          id: 'public-curator-transport-error',
          role: 'curator',
          content: reason instanceof Error
            ? 'The Curator service is unavailable: ' + reason.message + ' Your message remains in the visible dialogue; no Curator response was received.'
            : 'The Curator service is unavailable. Your message remains in the visible dialogue; no Curator response was received.',
          seal: '[SYSTEM]',
          isTyping: false,
        };
        const withoutPriorError = prev.filter(message => message.id !== errorMessage.id);
        return [...withoutPriorError, errorMessage];
      });
    } finally {
      requestInFlightRef.current = false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitQuery(input, 'live');
  };

  const handleGuidedTrigger = (trigger: EncounterTrigger) => {
    if (trigger !== selectableTrigger) return;
    const auditedExchange = selectedSession?.exchanges[encounterCount];
    if (replayPrefixIntact && auditedExchange?.trigger === trigger) {
      void submitQuery(auditedExchange.visitor, 'audited-preset', auditedExchange);
      return;
    }

    const guidedQuery = trigger === 'IMAGE'
      ? PUBLIC_IMAGE_INVITATION
      : RESONANCE_INVITATIONS[trigger];
    void submitQuery(guidedQuery, 'live');
  };

  const handleRailSelect = (rail: ResonanceRailId) => {
    handleGuidedTrigger(rail);
  };

  const handleImageSelect = () => {
    handleGuidedTrigger('IMAGE');
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
      {/* ── Background Intersection Environment (Z-index 1, interactive items elevate on hover) ── */}
      <IntersectionEnvironment
        role="PUBLIC"
        encounterCount={encounterCount}
        isTyping={isTyping}
        typingProgress={typingProgress}
        onArtworkFocusChange={setIsArtworkFocused}
        usedRails={usedRails}
        onSelectRail={handleRailSelect}
        selectableTrigger={selectableTrigger}
        onSelectImage={handleImageSelect}
      />

      {/* ── Container for UI elements (Z-index 20 ensures messages are clearly visible over idle background) ── */}
      <div style={{ position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* ── Terminal Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 28px 16px',
            borderBottom: '1px solid rgba(232,235,238,0.08)',
            flexShrink: 0,
            position: 'relative',
            zIndex: 40,
            pointerEvents: 'auto',
            backdropFilter: 'blur(12px)',
            background: 'rgba(6,7,8,0.65)',
          }}
        >
        <div>
          <div className="t-mono-label" style={{ color: 'rgba(237,236,234,0.75)', fontSize: '0.68rem', letterSpacing: '0.18em' }}>
            PUBLIC CURATOR · INDEPENDENT JUDGMENT
          </div>
          <div
            className="t-mono-tag"
            title={CURATOR_DISCLOSURE}
            aria-label={CURATOR_DISCLOSURE}
            style={{ marginTop: 5, color: 'rgba(218,172,98,0.45)', fontSize: '0.52rem', letterSpacing: '0.16em' }}
          >
            ARTIST-COMMISSIONED · EVIDENCE-BOUND · 3 ENCOUNTERS
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            className="t-mono-tag"
            style={{
              color: encounterCount >= 3 ? 'rgba(218,172,98,0.85)' : 'rgba(237,236,234,0.45)',
              letterSpacing: '0.2em',
            }}
          >
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
          transition: 'border-color 0.6s ease, box-shadow 0.6s ease',
          borderLeft: encounterCount >= 1 ? '1px solid rgba(218,172,98,0.45)' : '1px solid transparent',
          borderBottom: encounterCount >= 2 ? '1px solid rgba(218,172,98,0.45)' : '1px solid transparent',
          boxShadow: encounterCount >= 3
            ? '-6px 6px 30px rgba(218,172,98,0.18)'
            : encounterCount >= 2
              ? '-4px 4px 20px rgba(218,172,98,0.12)'
              : encounterCount >= 1
                ? '-4px 0 16px rgba(218,172,98,0.08)'
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
            pointerEvents: 'none', // Critical: lets mouse hover pass through to IntersectionEnvironment
          }}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isCurator = msg.role === 'curator';
              const displayText = msg.typedLength !== undefined ? msg.content.slice(0, msg.typedLength) : msg.content;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    maxWidth: isCurator ? '88%' : '72%',
                    alignSelf: isCurator ? 'flex-start' : 'flex-end',
                    pointerEvents: 'none', // Text does not block mouse events to P1/P2/PNG
                    userSelect: 'none',
                  }}
                >
                  {/* Curator seal */}
                  {isCurator && msg.seal && (
                    <div
                      className="t-mono-tag"
                      style={{
                        marginBottom: 6,
                        color: 'rgba(218,172,98,0.75)',
                        letterSpacing: '0.22em',
                        fontSize: '0.58rem',
                        userSelect: 'none',
                      }}
                    >
                      {msg.seal}
                    </div>
                  )}

                  <div
                    className={msg.role === 'curator' ? 't-curator-response' : ''}
                    style={{
                      fontFamily: msg.role === 'curator' ? 'var(--font-mono)' : 'var(--font-display)',
                      fontSize: msg.role === 'curator' ? '0.78rem' : '0.82rem',
                      lineHeight: msg.role === 'curator' ? 1.9 : 1.6,
                      letterSpacing: msg.role === 'curator' ? '0.02em' : '0.01em',
                      textTransform: 'none',
                      color: msg.role === 'curator'
                        ? 'rgba(237,236,234,0.95)'
                        : 'rgba(237,236,234,0.88)',
                      fontStyle: 'normal',
                      textAlign: msg.role === 'visitor' ? 'right' : 'left',
                      whiteSpace: 'pre-wrap',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      background: isArtworkFocused
                        ? 'transparent'
                        : (msg.role === 'curator' ? 'rgba(7, 8, 11, 0.86)' : 'rgba(12, 14, 18, 0.78)'),
                      backdropFilter: isArtworkFocused ? 'none' : 'blur(16px)',
                      WebkitBackdropFilter: isArtworkFocused ? 'none' : 'blur(16px)',
                      border: msg.role === 'curator'
                        ? (isArtworkFocused ? '1px solid rgba(218, 172, 98, 0.08)' : '1px solid rgba(218, 172, 98, 0.22)')
                        : (isArtworkFocused ? '1px solid rgba(232, 235, 238, 0.04)' : '1px solid rgba(232, 235, 238, 0.12)'),
                      borderLeft: msg.role === 'curator'
                        ? (isArtworkFocused ? '3px solid rgba(218, 172, 98, 0.3)' : '3px solid rgba(218, 172, 98, 0.70)')
                        : (isArtworkFocused ? '1px solid rgba(232, 235, 238, 0.04)' : '1px solid rgba(232, 235, 238, 0.12)'),
                      boxShadow: isArtworkFocused ? 'none' : '0 12px 36px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)',
                      padding: msg.role === 'curator' ? '14px 18px' : '10px 16px',
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

        {/* Semantic 2-Edge Waveguides (Locked to Dialogue Viewport) */}
        {showDialogueWave && (
          <>
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
          </>
        )}
      </div>

      {/* ── Input / Transition bar ── */}
      <div
        style={{
          borderTop: '1px solid rgba(232,235,238,0.08)',
          padding: '16px 28px 20px',
          flexShrink: 0,
          position: 'relative',
          zIndex: 40,
          pointerEvents: 'auto',
          backdropFilter: 'blur(12px)',
          background: 'rgba(6,7,8,0.70)',
        }}
      >
        {sealed ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div
              className="t-mono-tag"
              style={{
                color: 'rgba(218,172,98,0.65)',
                letterSpacing: '0.18em',
                fontSize: '0.60rem',
              }}
            >
              THIS ENCOUNTER IS COMPLETE · RESIDUAL CONTEMPLATION OPEN
            </div>

            {onEnterAtelier && (
              <button
                onClick={onEnterAtelier}
                className="t-mono-tag"
                style={{
                  background: 'rgba(218, 172, 98, 0.12)',
                  border: '1px solid rgba(218, 172, 98, 0.45)',
                  color: 'rgba(218, 172, 98, 0.95)',
                  padding: '8px 18px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  borderRadius: 2,
                  boxShadow: '0 0 20px rgba(218,172,98,0.18)',
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.18em',
                  fontSize: '0.62rem',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(218, 172, 98, 0.24)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(218,172,98,0.40)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(218, 172, 98, 0.75)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(218, 172, 98, 0.12)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(218,172,98,0.18)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(218, 172, 98, 0.45)';
                }}
              >
                CONCLUDE ENCOUNTER
                <ArrowRight size={14} weight="bold" />
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span className="t-mono-tag" style={{ flexShrink: 0, color: 'rgba(218,172,98,0.5)' }}>›</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={isTyping ? "Curator is responding…" : "Choose a prompt block, or ask in your own words…"}
              disabled={isLoading || isTyping}
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
              disabled={isLoading || isTyping || !input.trim()}
              aria-label="Send message"
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
              <ArrowRight size={15} weight="bold" />
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
            href="/assets/CONTEXT-PUBLIC.md"
            download="CONTEXT-PUBLIC.md"
            style={{
              color: 'rgba(218,172,98,0.38)',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(218,172,98,0.18)',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(218,172,98,0.7)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(218,172,98,0.38)'; }}
          >
            READ THE FULL CONTEXT BOUNDARIES ↓
          </a>
        </div>
      </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};
