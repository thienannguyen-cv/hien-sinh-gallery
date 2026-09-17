'use client';
/**
 * CuratorTerminal — Full-screen Public Curator dialogue
 *
 * Activated when visitor touches the Curator glass panel.
 * Features:
 *  - Persistent encounter state in localStorage with wallet admission tracking
 *  - Canonical public summary fallback if storage is cleared for admitted wallet
 *  - Gated direct entry point: "CONCLUDE ENCOUNTER →" upon completing the 3 inquiries
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
import { useCuratorService, emitCuratorDiagnostic, type CuratorReply } from '../../services/curator/useCuratorService';
import { publicCapacityFallback } from '../../services/curator/publicCapacityFallback';
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
  CANONICAL_PUBLIC_SUMMARY_MESSAGES,
  notifyPublicCompletionWitnessed,
} from '../../services/curator/publicCuratorState';
import { useLocalPresentationEnvironment } from '../../security/useLocalPresentationEnvironment';
import {
  DEFAULT_CONVERSATIONAL_LANGUAGE,
  resolveSessionConversationalLanguage,
  type ConversationLanguage,
} from '../../services/curator/conversationLanguage';

const CURATOR_DISCLOSURE = 'Commissioned by the Artist. Judgment remains independent; responses may disagree, report no felt response, or find the available evidence insufficient.';
const PUBLIC_CURATOR_OPENING = 'You are in a public encounter with Hiện Sinh. I am here to accompany your looking; your judgment of the image remains entirely your own.';
const LEGACY_PUBLIC_CURATOR_OPENING = 'Bạn đang ở cuộc gặp công khai với Hiện sinh. Tôi đồng hành cùng bạn quan sát tác phẩm; mọi phán xét đối với hình ảnh sau cùng vẫn hoàn toàn thuộc về bạn.';

const MAX_ENCOUNTERS = 3;

const PUBLIC_IMAGE_INVITATION = 'Help me stay with the representation itself as the third exchange. Begin from what is visible now, distinguish observation from inference, and leave the final naming of the encounter with me.';

interface Message {
  id: string;
  role: 'curator' | 'visitor' | 'system';
  content: string;
  seal?: string;
  typedLength?: number;
  isTyping?: boolean;
  responseSource?: 'provider' | 'fallback' | 'system_notice';
}

interface CommittedFallbackRetry {
  visitorMessage: Message;
  transcriptBefore: Message[];
  countBefore: number;
  completionSourcesBefore: EncounterCompletionSource[];
  language: ConversationLanguage;
  trigger: EncounterTrigger;
}

type PublicInputSource = 'P_BLOCK' | 'FREE_TEXT';

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
      const isLegacyOpeningOnly = sessionRestored.encounterCount === 0
        && sessionRestored.messages.length === 1
        && sessionRestored.messages[0].role === 'curator'
        && sessionRestored.messages[0].content === LEGACY_PUBLIC_CURATOR_OPENING;
      if (isLegacyOpeningOnly) {
        return [{
          id: 'msg-0',
          role: 'curator',
          content: PUBLIC_CURATOR_OPENING,
          seal: '[PUBLIC CURATOR]',
          typedLength: PUBLIC_CURATOR_OPENING.length,
          isTyping: false,
        }];
      }
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
  const [fallbackTooltipId, setFallbackTooltipId] = useState<string | null>(null);
  const [sealed, setSealed] = useState<boolean>(() => sessionRestored?.sealed ?? isHolderRole);
  const [completionWitnessed, setCompletionWitnessed] = useState<boolean>(
    () => sessionRestored?.completionWitnessed ?? sessionRestored?.sealed ?? isHolderRole,
  );
  const [committedFallbackRetries, setCommittedFallbackRetries] = useState<Record<string, CommittedFallbackRetry>>({});
  const [usedRails, setUsedRails] = useState<ResonanceRailId[]>(() => (sessionRestored?.usedRails as ResonanceRailId[]) ?? (isHolderRole ? ['P1', 'P2'] : []));
  const [isTyping, setIsTyping] = useState(false);
  const [typingProgress, setTypingProgress] = useState(0);
  const [isArtworkFocused, setIsArtworkFocused] = useState(false);
  const [replayPrefixIntact, setReplayPrefixIntact] = useState(() => sessionRestored?.replayPrefixIntact ?? true);
  const [completionSources, setCompletionSources] = useState<EncounterCompletionSource[]>(
    () => sessionRestored?.completionSources ?? [],
  );
  const [sessionConversationalLanguage, setSessionConversationalLanguage] = useState<ConversationLanguage>(
    () => sessionRestored?.sessionConversationalLanguage ?? DEFAULT_CONVERSATIONAL_LANGUAGE,
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
  // Witnessed completion is epistemic access only. It does not supply any
  // wallet, purchaser, practitioner, Steward, or SANCTUM authority.
  const canConcludeEncounter = sealed || completionWitnessed;

  useEffect(() => {
    if (rehearsalSessions.length === 0) return;
    const nextSelection = rehearsalSessions.some(session => session.id === selectedSessionId)
      ? selectedSessionId
      : rehearsalSessions[0].id;
    if (nextSelection !== selectedSessionId) setSelectedSessionId(nextSelection);

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
      completionWitnessed,
      rehearsalSessionId: selectedSession?.id,
      sessionConversationalLanguage,
      status: completionWitnessed ? 'PUBLIC_COMPLETED' : 'IN_PROGRESS',
      completedAt: sealed ? Date.now() : undefined,
    });
  }, [completionSources, completionWitnessed, encounterCount, messages, replayPrefixIntact, sealed, selectedSession?.id, sessionConversationalLanguage, usedRails]);

  useEffect(() => {
    if (completionWitnessed) notifyPublicCompletionWitnessed();
  }, [completionWitnessed]);

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
    retryExistingVisitor = false,
    inputSource: PublicInputSource = 'FREE_TEXT',
  ) => {
    if (!query.trim() || requestInFlightRef.current || isLoading || sealed || isTyping || encounterCount >= MAX_ENCOUNTERS) return;
    const trigger = nextEncounterTrigger('PUBLIC_CURATOR', encounterCount);
    if (!trigger) return;

    requestInFlightRef.current = true;
    setInput('');
    if (source === 'live') setReplayPrefixIntact(false);
    const existingVisitor = retryExistingVisitor
      ? [...messages].reverse().find(message => message.role === 'visitor' && message.content === query.trim())
      : undefined;
    const userMsgId = 'visitor-' + Date.now();
    const visitorMessage: Message = existingVisitor ?? { id: userMsgId, role: 'visitor', content: query.trim(), typedLength: query.trim().length, isTyping: false };
    const nextConversationLanguage = resolveSessionConversationalLanguage(sessionConversationalLanguage, visitorMessage.content);
    const transcriptBefore = messages;
    const countBefore = encounterCount;
    const completionSourcesBefore = completionSources;
    setSessionConversationalLanguage(nextConversationLanguage);
    if (!existingVisitor) setMessages(prev => [...prev, visitorMessage]);
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
          language: nextConversationLanguage,
          trigger,
          dialogue: (existingVisitor ? messages : [...messages, visitorMessage]).map(message => ({
            role: message.role === 'system' ? 'curator' : message.role,
            content: message.content,
            seal: message.seal,
          })),
        });
        responseText = response.content;
        seal = response.seal;
        await emitCuratorDiagnostic('persisted', response as CuratorReply);
      }

      const newCount = countBefore + 1;
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
          responseSource: 'provider',
          typedLength: 0,
          isTyping: true,
        },
      ]);

      setIsLoading(false);

      // Start Typewriter
      startTypewriter(curatorMsgId, responseText, () => {
        if (newCount >= MAX_ENCOUNTERS) {
          setCompletionWitnessed(true);
          setSealed(true);
        }
      });
    } catch (reason) {
      setIsLoading(false);
      const newCount = countBefore + 1;
      setEncounterCount(newCount);
      setUsedRails(completedRailIds('PUBLIC_CURATOR', newCount));

      if (inputSource === 'FREE_TEXT') {
        // A failed request is status-only, never a Curator utterance. Transport,
        // malformed, authentication, and unknown failures preserve the visitor turn.
        // The Curator could not be reached. Your exchange has been preserved.
        const noticeMsgId = 'system-notice-' + Date.now();
        const noticeText = 'The Curator could not be reached. Your exchange has been preserved.';
        setCompletionSources(prev => [...prev, 'live']);
        setMessages(prev => [
          ...prev,
          {
            id: noticeMsgId,
            role: 'system',
            content: noticeText,
            seal: '[SYSTEM NOTICE]',
            responseSource: 'system_notice',
            typedLength: noticeText.length,
            isTyping: false,
          },
        ]);
        if (newCount >= MAX_ENCOUNTERS) {
          setCompletionWitnessed(true);
          setSealed(true);
        }
      } else {
        // Prompt block (P1/P2/IMAGE/etc.) -> documented canonical fallback response
        // reason.code === 'HOSTED_CURATOR_CAPACITY_UNAVAILABLE' or general provider failure
        const responseText = publicCapacityFallback(trigger);
        setCompletionSources(prev => [...prev, 'fallback']);
        const curatorMsgId = 'curator-fallback-' + Date.now();
        setMessages(prev => [
          ...prev,
          {
            id: curatorMsgId,
            role: 'curator',
            content: responseText,
            seal: '[PUBLIC CURATOR · FALLBACK]',
            responseSource: 'fallback',
            typedLength: 0,
            isTyping: true,
          },
        ]);
        setCommittedFallbackRetries(previous => ({
          ...previous,
          [curatorMsgId]: {
            visitorMessage,
            transcriptBefore,
            countBefore,
            completionSourcesBefore,
            language: nextConversationLanguage,
            trigger,
          },
        }));
        startTypewriter(curatorMsgId, responseText, () => {
          if (newCount >= MAX_ENCOUNTERS) {
            setCompletionWitnessed(true);
            setSealed(true);
          }
        });
      }
    } finally {
      requestInFlightRef.current = false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitQuery(input, 'live', undefined, false, 'FREE_TEXT');
  };

  const retryCommittedFallback = (fallbackMessageId: string) => {
    const retry = committedFallbackRetries[fallbackMessageId];
    if (!retry || requestInFlightRef.current || isLoading || isTyping) return;

    // Rewind back to encounter n: remove visitor query and fallback response at n,
    // restore previous transcript, restore count to countBefore, and allow visitor to
    // re-enter text or choose another prompt block.
    setMessages(retry.transcriptBefore);
    setEncounterCount(retry.countBefore);
    setUsedRails(completedRailIds('PUBLIC_CURATOR', retry.countBefore));
    setCompletionSources(retry.completionSourcesBefore);
    setSealed(false);
    setCompletionWitnessed(false);
    setCommittedFallbackRetries(prev => {
      const next = { ...prev };
      delete next[fallbackMessageId];
      return next;
    });

    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleGuidedTrigger = (trigger: EncounterTrigger) => {
    if (trigger !== selectableTrigger) return;
    const auditedExchange = selectedSession?.exchanges[encounterCount];
    if (replayPrefixIntact && auditedExchange?.trigger === trigger) {
      void submitQuery(auditedExchange.visitor, 'audited-preset', auditedExchange, false, 'P_BLOCK');
      return;
    }

    const guidedQuery = trigger === 'IMAGE'
      ? PUBLIC_IMAGE_INVITATION
      : RESONANCE_INVITATIONS[trigger];
    void submitQuery(guidedQuery, 'live', undefined, false, 'P_BLOCK');
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
            PUBLIC CURATOR V2 · INDEPENDENT JUDGMENT
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
              const isSystem = msg.role === 'system' || msg.responseSource === 'system_notice';
              const displayText = msg.typedLength !== undefined ? msg.content.slice(0, msg.typedLength) : msg.content;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    maxWidth: isCurator || isSystem ? '88%' : '72%',
                    alignSelf: isCurator || isSystem ? 'flex-start' : 'flex-end',
                    pointerEvents: 'none', // Text does not block mouse events to P1/P2/PNG
                    userSelect: 'none',
                  }}
                >
                  {/* Curator seal or System Notice */}
                  {(isCurator || isSystem) && msg.seal && (
                    <div
                      className="t-mono-tag"
                      style={{
                        marginBottom: 6,
                        color: isSystem ? 'rgba(218,172,98,0.55)' : 'rgba(218,172,98,0.75)',
                        letterSpacing: '0.22em',
                        fontSize: '0.58rem',
                        userSelect: 'none',
                      }}
                    >
                      {msg.seal}
                    </div>
                  )}

                  <div
                    className={isCurator ? 't-curator-response' : ''}
                    style={{
                      fontFamily: isCurator || isSystem ? 'var(--font-mono)' : 'var(--font-display)',
                      fontSize: isCurator || isSystem ? '0.78rem' : '0.82rem',
                      lineHeight: isCurator || isSystem ? 1.9 : 1.6,
                      letterSpacing: isCurator || isSystem ? '0.02em' : '0.01em',
                      textTransform: 'none',
                      fontStyle: isSystem ? 'italic' : 'normal',
                      color: isSystem
                        ? 'rgba(237,236,234,0.75)'
                        : isCurator
                        ? 'rgba(237,236,234,0.95)'
                        : 'rgba(237,236,234,0.88)',
                      textAlign: msg.role === 'visitor' ? 'right' : 'left',
                      whiteSpace: 'pre-wrap',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      background: isArtworkFocused
                        ? 'transparent'
                        : isSystem
                        ? 'rgba(14, 16, 22, 0.85)'
                        : isCurator
                        ? 'rgba(7, 8, 11, 0.86)'
                        : 'rgba(12, 14, 18, 0.78)',
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
                      padding: isCurator || isSystem ? '14px 18px' : '10px 16px',
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
                  {msg.responseSource === 'fallback' && committedFallbackRetries[msg.id] && (
                    <div style={{ position: 'relative', display: 'inline-block', pointerEvents: 'auto' }}>
                      <button
                        type="button"
                        title="Retry with the Curator. Replace this prepared response with a Curator response when available."
                        aria-label="Retry with the Curator. Replace this prepared response with a Curator response when available."
                        aria-describedby={`fallback-retry-tooltip-${msg.id}`}
                        onClick={() => void retryCommittedFallback(msg.id)}
                        onMouseEnter={() => setFallbackTooltipId(msg.id)}
                        onMouseLeave={() => setFallbackTooltipId(null)}
                        onFocus={() => setFallbackTooltipId(msg.id)}
                        onBlur={() => setFallbackTooltipId(null)}
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
                      >
                        RETRY
                      </button>
                      {fallbackTooltipId === msg.id && (
                        <div
                          id={`fallback-retry-tooltip-${msg.id}`}
                          role="tooltip"
                          style={{
                            position: 'absolute', left: 0, bottom: 'calc(100% + 6px)', width: 220,
                            padding: '8px 10px', background: 'rgba(7,8,11,0.96)',
                            border: '1px solid rgba(218,172,98,0.28)', color: 'rgba(237,236,234,0.78)',
                            fontSize: '0.53rem', lineHeight: 1.55, letterSpacing: '0.08em', zIndex: 60,
                          }}
                        >
                          Retry with the Curator. Replace this prepared response with a Curator response when available.
                        </div>
                      )}
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
        {canConcludeEncounter && (
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
              {sealed
                ? 'THIS ENCOUNTER IS COMPLETE · RESIDUAL CONTEMPLATION OPEN'
                : 'PUBLIC COMPLETION REMAINS WITNESSED · ACTIVE DIALOGUE MAY CONTINUE'}
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
        )}
        {!sealed && (
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
            href="https://github.com/thienannguyen-cv/hien-sinh-gallery/blob/main/00_PUBLIC/effective-verbal-context.md"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'rgba(218,172,98,0.38)',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(218,172,98,0.18)',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(218,172,98,0.7)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(218,172,98,0.38)'; }}
          >
            READ THE PUBLIC CURATOR CONTEXT ↗
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
