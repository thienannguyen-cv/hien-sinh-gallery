'use client';

import React from 'react';
import { ArrowRight, ArrowUpRight, Compass, ShieldCheck } from 'lucide-react';

interface SMapWorksRootProps {
  onNavigateToGallery: () => void;
}

export const SMapWorksRoot: React.FC<SMapWorksRootProps> = ({ onNavigateToGallery }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--g-black, #060708)',
        color: 'var(--g-text-primary, #edecea)',
        fontFamily: 'var(--font-display, "Be Vietnam Pro", system-ui, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* ── Top Header / Masthead ── */}
      <header className="smapworks-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'var(--g-text-accent, rgba(218, 172, 98, 0.9))',
              boxShadow: '0 0 10px rgba(218, 172, 98, 0.5)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '0.85rem',
              letterSpacing: '0.22em',
              fontWeight: 500,
              color: '#edecea',
            }}
          >
            SMAPWORKS
          </span>
          <span
            className="smapworks-header__location"
            style={{
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              color: 'rgba(237, 236, 234, 0.35)',
              marginLeft: 8,
            }}
          >
            DA NANG, VIETNAM
          </span>
        </div>

        <nav className="smapworks-header__nav">
          <button
            onClick={onNavigateToGallery}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--g-text-accent, #daac62)',
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '0.75rem',
              letterSpacing: '0.16em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderLeft: '1px solid rgba(218, 172, 98, 0.3)',
              transition: 'opacity 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <span className="smapworks-desktop-only">GALLERY / </span>HIỆN SINH <ArrowRight size={13} />
          </button>
          <a
            href="https://www.etsy.com/shop/SMapWorks"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'rgba(237, 236, 234, 0.4)',
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'color 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(237, 236, 234, 0.85)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237, 236, 234, 0.4)')}
          >
            PRINTABLES <ArrowUpRight size={12} />
          </a>
        </nav>
      </header>

      {/* ── Main Surface ── */}
      <main className="smapworks-main">
        {/* Studio Statement / Manifesto */}
        <section style={{ marginBottom: 96 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px',
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '0.68rem',
              letterSpacing: '0.18em',
              color: 'rgba(237, 236, 234, 0.45)',
              marginBottom: 24,
            }}
          >
            <Compass size={12} style={{ color: 'var(--g-text-accent, #daac62)' }} />
            COMPUTATIONAL ART STUDIO
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display, "Be Vietnam Pro", sans-serif)',
              fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
              fontWeight: 300,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: '#edecea',
              marginBottom: 28,
              maxWidth: 820,
            }}
          >
            Where Data Becomes Art
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-literary, "EB Garamond", serif)',
              fontSize: 'clamp(1.15rem, 2vw, 1.35rem)',
              lineHeight: 1.65,
              color: 'rgba(237, 236, 234, 0.72)',
              maxWidth: 720,
              marginBottom: 28,
            }}
          >
            SMapWorks is an independent computational art studio exploring how data, geometry,
            structure, and light become visual artifacts.
          </p>

          <p
            style={{
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '0.78rem',
              letterSpacing: '0.08em',
              color: 'rgba(237, 236, 234, 0.4)',
              borderLeft: '2px solid var(--g-text-accent, #daac62)',
              paddingLeft: 14,
            }}
          >
            Artist-directed. AI-assisted. Created through selection, refinement, inspection, and
            curation.
          </p>
        </section>

        {/* ── Studio Portfolio & Encounters ── */}
        <section style={{ marginBottom: 96 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: 12,
              marginBottom: 36,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
                color: 'rgba(237, 236, 234, 0.4)',
              }}
            >
              SELECTED WORKS & PROTOCOLS
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                color: 'rgba(237, 236, 234, 0.25)',
              }}
            >
              01 — 03
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Primary Encounter: Hiện Sinh */}
            <div className="smapworks-card smapworks-card--featured">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.18em',
                  color: 'var(--g-text-accent, #daac62)',
                  marginBottom: 14,
                }}
              >
                <ShieldCheck size={14} />
                CANONICAL EXHIBITION · BASE MAINNET
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 20,
                  marginBottom: 18,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display, "Be Vietnam Pro", sans-serif)',
                      fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                      fontWeight: 400,
                      letterSpacing: '0.04em',
                      color: '#edecea',
                      marginBottom: 6,
                    }}
                  >
                    HIỆN SINH
                  </h2>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                      fontSize: '0.78rem',
                      color: 'rgba(237, 236, 234, 0.45)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    10 Canonical ERC-721 Identities · Painting 0 and Frames 01–09
                  </div>
                </div>

                <button
                  onClick={onNavigateToGallery}
                  style={{
                    backgroundColor: 'rgba(218, 172, 98, 0.12)',
                    border: '1px solid rgba(218, 172, 98, 0.5)',
                    color: '#edecea',
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    fontSize: '0.78rem',
                    letterSpacing: '0.14em',
                    padding: '12px 22px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(218, 172, 98, 0.25)';
                    e.currentTarget.style.borderColor = 'rgba(218, 172, 98, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(218, 172, 98, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(218, 172, 98, 0.5)';
                  }}
                >
                  ENTER THE GALLERY <ArrowRight size={14} />
                </button>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-literary, "EB Garamond", serif)',
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  color: 'rgba(237, 236, 234, 0.68)',
                  marginBottom: 20,
                  maxWidth: 720,
                }}
              >
                A conceptual artwork by{' '}
                <a
                  href="https://smapworks.art/project-contact"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(237, 236, 234, 0.75)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237, 236, 234, 0.35)')}
                >
                  Quinn T.
                </a>
                . Its relational protocol is represented on Base
                Mainnet through ten canonical ERC-721 identities. The execution substrate carries
                these relational transitions; it does not constitute the artwork itself.
              </p>

              <div
                style={{
                  fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.08em',
                  color: 'rgba(237, 236, 234, 0.32)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <span>CONTRACT: 0xdf12...9FD8</span>
                <span>CHAIN ID: 8453</span>
                <span>SOURCE VERIFIED: EXACT MATCH</span>
              </div>
            </div>

            {/* Second-Order: STEM */}
            <div
              className="smapworks-card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 20,
              }}
            >
              <div style={{ maxWidth: 620 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.14em',
                    color: 'rgba(237, 236, 234, 0.35)',
                    marginBottom: 6,
                  }}
                >
                  SECOND-ORDER INTEGRATIVE WORK
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display, "Be Vietnam Pro", sans-serif)',
                    fontSize: '1.25rem',
                    fontWeight: 400,
                    letterSpacing: '0.02em',
                    color: '#edecea',
                    marginBottom: 8,
                  }}
                >
                  STEM
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-literary, "EB Garamond", serif)',
                    fontSize: '1.02rem',
                    lineHeight: 1.55,
                    color: 'rgba(237, 236, 234, 0.58)',
                  }}
                >
                  Four autonomous forms enter one continuous spatial field, making their common
                  world perceptible without surrendering their differences.
                </p>
              </div>

              <a
                href="https://www.etsy.com/shop/SMapWorks"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'rgba(237, 236, 234, 0.55)',
                  fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.12em',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#edecea';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(237, 236, 234, 0.55)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                COLLECTIONS <ArrowUpRight size={12} />
              </a>
            </div>

            {/* Foundational Series: A-Z */}
            <div
              className="smapworks-card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 20,
              }}
            >
              <div style={{ maxWidth: 620 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.14em',
                    color: 'rgba(237, 236, 234, 0.35)',
                    marginBottom: 6,
                  }}
                >
                  FOUNDATIONAL COMPUTATIONAL ALPHABET
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display, "Be Vietnam Pro", sans-serif)',
                    fontSize: '1.25rem',
                    fontWeight: 400,
                    letterSpacing: '0.02em',
                    color: '#edecea',
                    marginBottom: 8,
                  }}
                >
                  Cyber Alphabet A–Z
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-literary, "EB Garamond", serif)',
                    fontSize: '1.02rem',
                    lineHeight: 1.55,
                    color: 'rgba(237, 236, 234, 0.58)',
                  }}
                >
                  26 concept-anchored computational letterworks developed through data, topology,
                  structure, and signal-derived visual language.
                </p>
              </div>

              <a
                href="https://www.etsy.com/shop/SMapWorks"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'rgba(237, 236, 234, 0.55)',
                  fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.12em',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#edecea';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(237, 236, 234, 0.55)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                COLLECTIONS <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </section>

        {/* Studio Colophon */}
        <section
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: 36,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 24,
            fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
            fontSize: '0.72rem',
            color: 'rgba(237, 236, 234, 0.35)',
            letterSpacing: '0.08em',
          }}
        >
          <div>
            <div>SMAPWORKS · DA NANG, VIETNAM</div>
            <div style={{ marginTop: 4 }}>
              © 2026 Thien An L. Nguyen · SMapWorks. All rights reserved.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <a
              href="/whitepaper"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(237, 236, 234, 0.75)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237, 236, 234, 0.35)')}
            >
              WHITEPAPER ↗
            </a>
            <a
              href="https://github.com/thienannguyen-cv/hien-sinh-gallery/blob/main/LICENSE.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(237, 236, 234, 0.75)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237, 236, 234, 0.35)')}
            >
              LICENSE ↗
            </a>
            <a
              href="https://github.com/thienannguyen-cv/hien-sinh-gallery"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(237, 236, 234, 0.75)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237, 236, 234, 0.35)')}
            >
              GITHUB ↗
            </a>
            <a
              href="https://basescan.org/address/0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8#code"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(237, 236, 234, 0.75)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237, 236, 234, 0.35)')}
            >
              BASESCAN ↗
            </a>
            <a
              href="https://www.etsy.com/shop/SMapWorks"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(237, 236, 234, 0.75)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237, 236, 234, 0.35)')}
            >
              ETSY ↗
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};
