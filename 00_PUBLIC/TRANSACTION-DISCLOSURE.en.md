# Transaction disclosure

**English access rendering. The Vietnamese `TRANSACTION-DISCLOSURE.md` is canonical and governs if the versions differ.**

## Collection
- Chain: Base.
- Standard: ERC-721.
- Token Identity Space: 10 tokens — 1 Painting (Token 0) and 9 Frames (Tokens 1..9).
- Genesis: Token 0 (The Painting) and Token 6 (Frame 06) are minted to the Artist in the constructor.
- Frame mint price: 0.081 ETH/token for standalone Frames (#01–04 and #07–09). Frame 05 and Frame 06 are excluded from standalone minting.
- Primary accession for Complete Package 05: 4.29 ETH, atomic transfer of Frame 05 + Painting Token 0; no additional 0.081 ETH charge and no upgrade step.
- Complete public label: `Complete Package 05/09 — Frame 05 + Painting`.
- **Asymmetric Succession Economics:**
  - **Painting 0:** Transferred strictly via in-contract `Canonical Succession` with a minimum consideration of `4.29 ETH` and a `1.49%` (149 BPS) ERC-2981 creator fee payable to Treasury (minimum `0.063921 ETH`).
  - **Frames 01..09:** Ordinary ERC-721 transferability allowed, `0%` creator fee (`0 BPS`), no secondary floor.
- No one-token-per-wallet limit; total supply is the on-chain limit.
- The contract locks an immutable `mintStart` at least 24 hours after deployment; the exact time must be published from verified deployment records prior to listing.

## A buyer does not receive

- equity or a claim on Artist revenue;
- any promise of profit, liquidity, or appreciation;
- copyright/authorship absent a separate agreement;
- authority to compel Artist/Curator agreement with an interpretation;
- proof of AI interiority;
- rights to reserved material outside the manifested Archive.

## Risks

- ETH and NFTs may lose most or all market value.
- Smart contracts, wallets, bridges, marketplaces, IPFS gateways, and key management carry technical risk.
- ERC-2981 is a signal, not enforced royalty.
- Crypto, tax, consumer-protection, and AI-assisted copyright law may change.
- Digital bytes can be copied; scarcity is authenticated through token + provenance, not perfect DRM.
- Blockchain transactions are irreversible. The smart contract has no refund, pause, or token-revocation function.

## Radical transparency

Before transacting, a buyer has full, free access to:

- the entire smart contract source code, verified on the block explorer;
- the full legal document set: `LEGAL-TERMS.md`, `SCHEDULE-FRAME.md`, `SCHEDULE-COMPLETE.md`, `WORK-ONTOLOGY.md`, `STEWARDSHIP-CHARTER.md`, `VERIFY.md`, `PROVENANCE.md`;
- the token and archive verification procedure in `VERIFY.md`, independently auditable by any third party;
- the Public Encounter Representation (512×512, with anti-reversal modifications) enabling pre-transaction visual assessment.

By submitting a transaction, the buyer confirms they have had the opportunity to access all materials above, understand the listed risks, and are making an informed decision. Neither party may invoke an information asymmetry to claim damages beyond the scope of the transaction.

## Pre-Purchase Curator Access (Package 05)

For Package 05, the system offers an initial evaluation mechanism called the "Three Brushstrokes". If an interested party submits these 3 interpretations to the Artist and is approved via email, their wallet address will be added to a server allowlist to experience the Archive Curator feature.
- **Independence:** This Curator access is strictly for pre-purchase exploration of the artwork's interiority. It completely does not constitute, replace, or guarantee any on-chain ownership rights.
- **Transaction not bypassed:** Regardless of whether a wallet is granted Curator access, the buyer is absolutely required to complete the on-chain transaction (4.29 ETH with a valid EIP-712 signature) through the smart contract's `acquireCompletePackage` function to receive the Provenance Token, the actual asset, and the associated rights in the Complete Schedule.

## Listing gate

Listing opens only after:

- public, verified contract source/ABI;
- a verified contract that excludes token #05 from `mintFrame` and allows only `acquireCompletePackage` to mint Package 05;
- constructor and `mintStart` reconciled with the signed deployment record;
- Base Sepolia tests/security review;
- persona PGP, wallet, and contract cross-binding;
- signed and timestamped designation/roots;
- hash-verified Public, Frame, and Complete dry-runs;
- `RELEASE-STATUS.json` changes `listing_ready` to `true`.
