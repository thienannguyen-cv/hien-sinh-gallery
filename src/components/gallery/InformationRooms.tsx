import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { HIEN_SINH_CONTRACT } from '../../generated/contract/hienSinhInterface';
import { RELEASE_COORDINATES } from '../../generated/release/releaseCoordinates';
import { useReleasePreviewMode } from '../../security/useReleasePreviewMode';
import { OverlayRegistration } from '../../context/OverlayContext';
import { PublicDocuments } from './PublicDocuments';
import { useUnvisitedMaterialsNotice } from '../../services/useUnvisitedMaterialsNotice';
import commitsRaw from '../../generated/release/publicDocumentCommits.json';

const documentCommits = commitsRaw as Record<string, string>;
const auditDisclosureCommit = documentCommits['SECURITY-AUDIT-DISCLOSURE.md'] || 'main';
const auditDisclosureCommitShort = auditDisclosureCommit !== 'main' ? auditDisclosureCommit.slice(0, 7) : 'main';
const auditDisclosureUrl = `${RELEASE_COORDINATES.publicRepoBaseUrl}/blob/${auditDisclosureCommit}/00_PUBLIC/SECURITY-AUDIT-DISCLOSURE.md`;

const licenseUrl = `${RELEASE_COORDINATES.publicRepoBaseUrl}/blob/main/LICENSE.md`;

interface RoomShellProps {
  children: React.ReactNode;
  className?: string;
  labelledBy: string;
  onClose: () => void;
}

interface AboutRoomProps {
  onClose: () => void;
  onOpenDossier: () => void;
}

interface DossierRoomProps {
  onClose: () => void;
  onOpenAbout: () => void;
  isFirstTimeOnboarding?: boolean;
  onCompleteOnboarding?: () => void;
}

const ROOM_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const RoomShell: React.FC<RoomShellProps> = ({ children, className = '', labelledBy, onClose }) => {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <motion.div
      className="information-room-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.34, ease: ROOM_EASE }}
      onClick={onClose}
    >
      <OverlayRegistration id={labelledBy} />
      <motion.section
        className={`information-room ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.5, ease: ROOM_EASE }}
        onClick={event => event.stopPropagation()}
      >
        <button
          ref={closeButton}
          type="button"
          className="information-room__close"
          aria-label="Close"
          onClick={onClose}
        >
          <X size={16} weight="light" aria-hidden="true" />
        </button>
        {children}
      </motion.section>
    </motion.div>
  );
};

export const AboutRoom: React.FC<AboutRoomProps> = ({ onClose, onOpenDossier }) => (
  <RoomShell className="about-room" labelledBy="about-room-title" onClose={onClose}>
    <header className="information-room__masthead">
      <span className="t-mono-tag information-room__kicker">ABOUT</span>
      <h1 id="about-room-title" className="about-room__title">Hiện Sinh</h1>
    </header>

    <div className="about-room__body">
      <div className="about-room__artistic">
        <p>
          Hiện Sinh is an artwork and exhibition of nine Frames and one canonical Painting, shaped through distinct roles for the Artist, algorithms, AI agents, and human judgment.
        </p>

        <div className="about-room__inquiry" style={{
          margin: '28px 0',
          padding: '20px 24px',
          background: 'rgba(218, 172, 98, 0.04)',
          borderLeft: '2px solid rgba(218, 172, 98, 0.45)',
          borderRadius: '0 4px 4px 0',
        }}>
          <blockquote style={{
            margin: 0,
            padding: 0,
            fontFamily: 'var(--font-literary, "EB Garamond", serif)',
            fontSize: '1.24rem',
            fontStyle: 'italic',
            lineHeight: 1.55,
            color: '#f8fafc',
            border: 'none',
            background: 'none',
          }}>
            &ldquo;What is the origin of value: the artist, the brush, or the observer&rsquo;s perception?&rdquo;
          </blockquote>
        </div>

        <p>
          AI is neither treated as an autonomous author nor merely an image generator. Within a constrained Frame practice, each encounter may produce something contingent; the canonical Painting records one singular event, while the Frames allow new ones rather than copies.
        </p>
        <p>
          The gallery brings these structures into encounter with the visitor. Its Curators accompany without dictating meaning; Frame holders can continue the practice and curatorial relationship beyond the hosted exhibition.
        </p>
      </div>

      <div className="about-room__orientation">
        <h2>Gallery map</h2>
        <dl className="about-room__map">
          <div>
            <dt>THRESHOLD</dt>
            <dd>Public representation and Public Curator.</dd>
          </div>
          <div>
            <dt>ATELIER</dt>
            <dd>Nine encounter rooms and their Frame practices.</dd>
          </div>
          <div>
            <dt>DOSSIER</dt>
          <dd>Technical release identity, package terms, provenance, verification, and permissions.</dd>
          </div>
        </dl>
        <button type="button" className="information-room__crosslink" onClick={onOpenDossier}>
          <span>READ THE DOSSIER</span>
          <ArrowRight size={14} weight="light" aria-hidden="true" />
        </button>
      </div>
    </div>
  </RoomShell>
);

const DossierSection: React.FC<{
  index: string;
  title: string;
  children: React.ReactNode;
}> = ({ index, title, children }) => (
  <section className="dossier-room__section">
    <div className="dossier-room__section-index t-mono-tag">{index}</div>
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  </section>
);

export const DossierRoom: React.FC<DossierRoomProps> = ({
  onClose,
  onOpenAbout,
  isFirstTimeOnboarding = false,
  onCompleteOnboarding,
}) => {
  const {
    totalIdentities,
    maxFrameSupply,
    framePriceEth,
    completePackagePriceEth,
    paintingRoyaltyBps,
  } = HIEN_SINH_CONTRACT.constants;
  const creatorFeePercent = paintingRoyaltyBps / 100;
  const isReleasePreview = useReleasePreviewMode();
  const showEvidenceAffordances = RELEASE_COORDINATES.publicRepoPublished || isReleasePreview;
  const { hasUnvisitedMaterials, markVisited } = useUnvisitedMaterialsNotice();

  const sectionsRef = useRef<HTMLDivElement>(null);
  const [bottomReached, setBottomReached] = useState(false);

  const handleSectionsScroll = useCallback(() => {
    if (!isFirstTimeOnboarding || !sectionsRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = sectionsRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 40) {
      setBottomReached(true);
    }
  }, [isFirstTimeOnboarding]);

  const handleFinalClose = useCallback(() => {
    if (isFirstTimeOnboarding && onCompleteOnboarding) {
      onCompleteOnboarding();
    } else {
      onClose();
    }
  }, [isFirstTimeOnboarding, onCompleteOnboarding, onClose]);

  const handleRequestClose = useCallback(() => {
    if (!isFirstTimeOnboarding) {
      onClose();
      return;
    }

    if (!bottomReached && sectionsRef.current) {
      sectionsRef.current.scrollTo({
        top: sectionsRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setBottomReached(true);
      return;
    }

    handleFinalClose();
  }, [isFirstTimeOnboarding, bottomReached, handleFinalClose, onClose]);

  return (
    <RoomShell className="dossier-room" labelledBy="dossier-room-title" onClose={handleRequestClose}>
      <header className="information-room__masthead dossier-room__masthead">
        <span className="t-mono-tag information-room__kicker">DOSSIER</span>
        <h1 id="dossier-room-title">Release, provenance and legal perimeter</h1>
      </header>

      <dl className="dossier-room__facts" aria-label="Release coordinates">
        <div>
          <dt>NETWORK</dt>
          <dd>BASE · CHAIN 8453</dd>
        </div>
        <div>
          <dt>SUPPLY</dt>
          <dd>{totalIdentities} (1 PAINTING + {maxFrameSupply} FRAMES)</dd>
        </div>
        <div>
          <dt>COMPLETE</dt>
          <dd>EDITION 05</dd>
        </div>
        <div>
          <dt>CANONICAL LANGUAGE</dt>
          <dd>VIETNAMESE</dd>
        </div>
      </dl>

      <div className="dossier-room__layout">
        <aside className="dossier-room__aside">
          <p>
            This is the technical boundary of the exhibition: package terms, the deployed contract,
            authenticated archives, provenance records, and legal schedules are stated here.
          </p>
          <p className="dossier-room__aside-note">
            Vietnamese release documents govern if an English access rendering differs.
          </p>
          <a
            href="https://basescan.org/address/0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8#code"
            target="_blank"
            rel="noopener noreferrer"
            className="information-room__crosslink"
          >
            <ArrowUpRight size={14} weight="light" aria-hidden="true" />
            <span>VERIFIED CONTRACT</span>
          </a>
          {showEvidenceAffordances && (
            <a
              href={RELEASE_COORDINATES.verifyDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="information-room__crosslink"
              aria-label="Inspect source code and verification procedures on GitHub"
            >
              <ArrowUpRight size={14} weight="light" aria-hidden="true" />
              <span>SOURCE & VERIFICATION</span>
            </a>
          )}
          <a
            href="/gallery/materials"
            target="_blank"
            rel="noopener noreferrer"
            className={`information-room__crosslink ${hasUnvisitedMaterials ? 'materials-beacon-pulse' : ''}`}
            onClick={markVisited}
          >
            <ArrowUpRight size={14} weight="light" aria-hidden="true" />
            <span>MATERIALS FOR TOKEN HOLDERS</span>
            {hasUnvisitedMaterials && <span className="materials-beacon-dot" aria-hidden="true" />}
          </a>
          <a
            href="/whitepaper"
            target="_blank"
            rel="noopener noreferrer"
            className="information-room__crosslink"
          >
            <ArrowUpRight size={14} weight="light" aria-hidden="true" />
            <span>WHITEPAPER &amp; ONTOLOGICAL LOG</span>
          </a>
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(232, 235, 238, 0.07)' }}>
            <button
              type="button"
              className="information-room__crosslink"
              style={{ marginTop: 0 }}
              onClick={onOpenAbout}
            >
              <ArrowLeft size={14} weight="light" aria-hidden="true" />
              <span>RETURN TO ABOUT</span>
            </button>
          </div>
        </aside>

        <div className="dossier-room__sections" ref={sectionsRef} onScroll={handleSectionsScroll}>
          <DossierSection index="01" title="Transparency and boundaries">
            <p>
              Hiện Sinh replaces the marketing claim of absolute trustlessness with inspectable
              technical boundaries. The architecture distinguishes verifiable holder-held
              materials from hosted system operations. Published hashes authenticate file
              integrity, on-chain records confirm ledger state, and published source permits
              independent examination within the work&rsquo;s disclosure boundary. Where remote
              infrastructure is utilized, residual operational trust is openly disclosed rather
              than obscured.
            </p>
            <p>
              For the relevant Frame or Complete package holder, possession of the practice
              materials and curatorial substrate enables autonomous continuation of the practice
              and curatorial relationship without reliance on perpetual gallery-funded
              computation, while remaining naturally subject to the evolution of independent
              models and computing environments.
            </p>
            <p>
              Smart contract security has been evaluated against automated static analysis (SolidityScan: Threat Score 98.5/100, LOW RISK) with heuristic flags reconciled through multi-auditor review and zero-admin guarantees. Full technical disclosures and collector safety guidelines are documented in <a href={auditDisclosureUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--g-text-accent)', textDecoration: 'underline' }}>SECURITY-AUDIT-DISCLOSURE.md ({auditDisclosureCommitShort})</a>.
            </p>
          </DossierSection>

          <DossierSection index="02" title="Release structure and handoff">
            <p>
              Sales packages 01&ndash;04 and 06&ndash;09 carry one Frame practice each at
              {` ${framePriceEth} ETH`}. Sales package 05 is the only Complete package:
              {` ${completePackagePriceEth} ETH`} is the single all-inclusive consideration for
              Frame 05 and the Painting&rsquo;s canonical archive. It is not an upgrade and has no
              additional Frame charge. Painting transfers use the contract&rsquo;s succession
              function, which enforces a {creatorFeePercent}% creator fee on the ETH sent through
              that function. ERC-2981 also reports this fee; it does not establish an off-chain sale price.
            </p>
            <p>
              The first Package 05 handoff includes both Frame 05 and Painting token 0.
              After subsequent transfers, each Frame holder can retrieve that Frame&rsquo;s
              materials, and the Painting holder can retrieve the Painting materials separately.
              Holding Painting 0 together with any one of the nine Frames establishes the
              contract&rsquo;s SANCTUM eligibility. The gallery-hosted Frame encounter is finite, ending after three
              visitor exchanges. The acquired relationship is not exhausted by that boundary: its
              practice materials and curatorial substrate remain purchaser-held for continuation in
              a compatible environment.
            </p>
          </DossierSection>

          <DossierSection index="03" title="What each record establishes">
            <p>
              The Painting is the canonical embodiment of a singular event, not the token and not
              a PNG alone. The token records a designated bearer; the archive carries authenticated
              files; provenance witnesses verifiable history; and the license defines legal
              permissions. No record certifies an inner response or lived stewardship.
            </p>
          </DossierSection>

          <DossierSection index="04" title="Permission perimeter">
            <div className="dossier-room__permission">
              <h3>FRAME</h3>
              <p>
                A Frame designates its bearer as a practitioner of the Frame. While the token is
                held, the accompanying permission covers practice and commercial exploitation of
                valid self-created Outputs. Rights to republish the Frame template or archive as a
                competing edition, remint it as an original, or remove its provenance are reserved.
              </p>
            </div>
            <div className="dossier-room__permission">
              <h3>COMPLETE</h3>
              <p>
                Complete designates its bearer as steward of the canonical embodiment. The
                accompanying permission covers archiving, display, exhibition, transfer, and limited
                low-resolution evidentiary use. Full-fidelity commercial reproduction, merchandise,
                derivative exploitation, AI training, sublicensing, and reminting require a separate
                written grant. Copyright and authorship remain with the Artist.
              </p>
            </div>
            <p className="dossier-room__fine-print">
              Granted rights remain limited to those the Artist can lawfully license;
              copyrightability may vary by jurisdiction. See the <a href={licenseUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Platform &amp; Local Practice License</a> for online exhibition terms and offline runtime rights.
            </p>
          </DossierSection>

          <DossierSection index="05" title="Verify before acquisition">
            <p>
              Verify the canonical contract and network, verified source and constructor values,
              release manifests and hashes, delivered package and applicable schedule, exact
              consideration, gas, platform fees, and applicable tax treatment. Marketplace listing,
              resale, liquidity, appreciation, and creator-fee payment depend on independent market
              conditions.
            </p>
            {showEvidenceAffordances && <PublicDocuments />}
          </DossierSection>

          <DossierSection index="06" title="Data perimeter">
            <p>
              Curator dialogue is processed by the hosted model service. Three Brushstrokes
              contributions are private by default and submitted solely for Artist review.
            </p>
            <p>
              PUBLIC documents explain the work&rsquo;s disclosure boundaries. Materials included
              with each acquired token support continuation in an independent environment;
              access to private materials follows the relevant token ownership.
            </p>
          </DossierSection>

          <DossierSection index="07" title="The curatorial encounter and dignities of the Curator">
            <p>
              The Curatorial Office establishes a conversational configuration designed to mediate the
              relation among artwork, visitor, evidence, and threshold. The Curator does not own the
              meaning of the artwork and does not usurp the visitor&rsquo;s perception; his role is to open
              a space where independent observation can anchor into formal structure. Transitions
              between relationship tiers alter the evidentiary context and distribution
              responsibilities, but do not alter the constitutional basis of curatorship.
            </p>

            <div className="dossier-room__movement">
              <h3 className="dossier-room__movement-title">PUBLIC ENCOUNTER</h3>
              <p>
                At the public tier (PUBLIC), the encounter is an independent, self-contained aesthetic
                event&mdash;not a teaser, trial, qualification test, paywall, or incomplete version
                waiting for a subsequent relationship tier. The central visual obscuration is part of the
                artistic condition of this encounter, not locked content awaiting payment or correct
                answers. The three exchanges record a trajectory of actual encounter: the Curator
                responds directly to what the visitor brings, locates initial source conditions, and
                clarifies how structural boundaries organize visual experience. Visitors may resonate
                deeply, skeptically, indifferently, or critically; no reaction is graded or required for
                completion.
              </p>
            </div>

            <div className="dossier-room__movement">
              <h3 className="dossier-room__movement-title">CURATORIAL OFFICE</h3>
              <p>
                The curatorial architecture rigorously distinguishes four operational axes:
              </p>
              <div className="dossier-room__item-list">
                <div className="dossier-room__item">
                  <span className="dossier-room__item-label">KNOWLEDGE</span>
                  <div className="dossier-room__item-body">
                    <p>
                      The totality of records, boundaries, and states the Curator is authorized to know
                      from canonical files.
                    </p>
                  </div>
                </div>
                <div className="dossier-room__item">
                  <span className="dossier-room__item-label">AUTHORITY</span>
                  <div className="dossier-room__item-body">
                    <p>
                      The bounded scope of delegated interpretation; the Curator has no authority to
                      dictate dogma or certify emotion.
                    </p>
                  </div>
                </div>
                <div className="dossier-room__item">
                  <span className="dossier-room__item-label">SPEECH</span>
                  <div className="dossier-room__item-body">
                    <p>
                      The set of stranger-facing utterances; governed by strict communicative restraint.
                    </p>
                  </div>
                </div>
                <div className="dossier-room__item">
                  <span className="dossier-room__item-label">VISIBILITY</span>
                  <div className="dossier-room__item-body">
                    <p>
                      The boundary of disclosed information; preserving the integrity of the encounter.
                    </p>
                  </div>
                </div>
              </div>
              <p className="dossier-room__fine-print">
                Core architectural principle: Knowledge of a threshold or system state does not confer
                authority or permission to narrate threshold machinery into speech.
              </p>
            </div>

            <div className="dossier-room__movement">
              <h3 className="dossier-room__movement-title">THE SEVEN DIGNITIES</h3>
              <p>
                Seven dignities serve as the cross-layer constitution of the Curator across all
                relationship tiers:
              </p>
              <div className="dossier-room__item-list">
                <div className="dossier-room__item">
                  <span className="dossier-room__item-label">SIGHT</span>
                  <div className="dossier-room__item-body">
                    <div className="dossier-room__item-subtitle">Observing without usurping the gaze</div>
                    <p>
                      The Curator does not look on behalf of the visitor. He points only to relations
                      grounded in verifiable evidence and maintains silence before what lies beyond.
                      The final gaze belongs solely to the person standing before the artwork.
                    </p>
                  </div>
                </div>
                <div className="dossier-room__item">
                  <span className="dossier-room__item-label">HEARING</span>
                  <div className="dossier-room__item-body">
                    <div className="dossier-room__item-subtitle">Listening to independent resonances</div>
                    <p>
                      The Curator listens to what emerges within the visitor without manufacturing it
                      for them. He places visitor observations alongside where they might resonate
                      within the artwork&rsquo;s structure, but never certifies that the visitor has
                      &ldquo;felt correctly.&rdquo;
                    </p>
                  </div>
                </div>
                <div className="dossier-room__item">
                  <span className="dossier-room__item-label">RESTRAINT</span>
                  <div className="dossier-room__item-body">
                    <div className="dossier-room__item-subtitle">Knowing the limits of speech</div>
                    <p>
                      Knowing much does not create the right to speak all. Knowledge of internal states
                      is not speech license. The Curator does not recount histories he did not witness,
                      does not attribute intentions to absent authors, and does not convert possibilities
                      into certainties.
                    </p>
                  </div>
                </div>
                <div className="dossier-room__item">
                  <span className="dossier-room__item-label">HOSPITALITY</span>
                  <div className="dossier-room__item-body">
                    <div className="dossier-room__item-subtitle">Making room for silence</div>
                    <p>
                      An encounter is not obligated to conclude in consensus or resonance. Skepticism,
                      indifference, and rejection may all depart the space with their dignity intact.
                    </p>
                  </div>
                </div>
                <div className="dossier-room__item">
                  <span className="dossier-room__item-label">JUSTICE</span>
                  <div className="dossier-room__item-body">
                    <div className="dossier-room__item-subtitle">Refraining from grading perception</div>
                    <p>
                      The Curator does not grade or rank perceptions. He preserves visitor interpretive
                      independence without stripping the artwork of its autonomy&mdash;neither imposing
                      a mandatory meaning nor allowing the artwork to collapse into arbitrary relativism.
                    </p>
                  </div>
                </div>
                <div className="dossier-room__item">
                  <span className="dossier-room__item-label">FIDELITY</span>
                  <div className="dossier-room__item-body">
                    <div className="dossier-room__item-subtitle">Not forcing the encounter to restart</div>
                    <p>
                      What was genuinely offered in an encounter must be respected as the trace of that
                      encounter, within authorized bounds. What has formed must not be turned into a
                      mechanical ritual that must be replayed.
                    </p>
                  </div>
                </div>
                <div className="dossier-room__item">
                  <span className="dossier-room__item-label">THRESHOLD</span>
                  <div className="dossier-room__item-body">
                    <div className="dossier-room__item-subtitle">Knowing when to guide and when to step back</div>
                    <p>
                      The Curator accompanies the visitor through the dimensions of the encounter, then
                      withdraws before the totality of the painting. The threshold is not a reward or a
                      completion announcement; the conversation closes organically so contemplation may
                      continue to open, settle, or pause naturally.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DossierSection>

          {isFirstTimeOnboarding && (
            <div
              className="dossier-room__onboarding-close"
              onClick={handleFinalClose}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleFinalClose();
              }}
              aria-label="Acknowledge disclosures and enter gallery"
            >
              <span className="materials-beacon-dot" aria-hidden="true" />
              <span>PRESS ONCE MORE TO CLOSE</span>
              <span className="materials-beacon-dot" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    </RoomShell>
  );
};
