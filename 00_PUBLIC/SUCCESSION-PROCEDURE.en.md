# Succession and Ownership Transfer Procedure — Hiện Sinh

**English access rendering. The Vietnamese `SUCCESSION-PROCEDURE.md` is canonical and governs if the versions differ.**

## 1. Transfer Classifications

Within the "Hiện Sinh" art system, three distinct transfer categories must be distinguished, each governed by different technical and economic constraints:

| Category | Token ID | On-Chain Execution Function | Mandatory Consideration | Nature of Transfer |
|---|---|---|---|---|
| **A. Standalone Frame Transfer** | `1..4, 6..9` | `safeTransferFrom(from, to, tokenId)` | None | Standard ERC-721 transfer, 0% creator royalty |
| **B. Package 05 Complete Transfer** | `5` | `safeTransferFrom(from, to, 5)` | None | Designates new on-chain Bearer; off-chain archive handoff |
| **C. Canonical Painting Succession** | `0` | `executeSuccession(0, recipient)` | `>= 4.29 ETH` | 1/1 Canonical Succession, splits 1.49% Treasury fee, emits CanonicalSuccession |

---

## 2. Procedure A: Standalone Frame Transfer (Tokens 1–4, 6–9)

1. **Token Confirmation:** Sender and recipient confirm valid Token ID.
2. **On-Chain Execution:**
   ```bash
   cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
     "safeTransferFrom(address,address,uint256)" \
     <SENDER_ADDRESS> <RECIPIENT_ADDRESS> <TOKEN_ID> \
     --rpc-url https://mainnet.base.org --interactive
   ```
3. **Archive/Material Handoff:** Sender transfers the local practice material package and corresponding manifest to the recipient.
4. **License Effectiveness:** The Frame practice license transfers to the recipient pursuant to `SCHEDULE-FRAME.en.md`.

---

## 3. Procedure B: Package 05 Complete Secondary Transfer (Token 5)

1. **Precondition Confirmation:** Recipient confirms Token 5 is held in sender's wallet and primary accession has been completed.
2. **On-Chain Execution:**
   ```bash
   cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
     "safeTransferFrom(address,address,uint256)" \
     <SENDER_ADDRESS> <RECIPIENT_ADDRESS> 5 \
     --rpc-url https://mainnet.base.org --interactive
   ```
3. **Off-Chain Archive Handoff:**
   - Predecessor transfers the full `_reveal/` directory and historical `STEWARDSHIP-ACCESSION.json` / lineage records;
   - Alternatively, the new recipient may independently use their new wallet address to request archive re-transmission via the authoritative protocol (see `ACQUISITION-RETRIEVAL.en.md`).
4. **Successor Verification:**
   - Successor verifies all SHA-256 hashes against `ROOT-COMMITMENTS.json`;
   - Executes and signs `STEWARDSHIP-SUCCESSION.json` recording the transfer event;
   - Until verification and accession are complete, the status remains `accession incomplete`.

---

## 4. Procedure C: Canonical Succession of The Painting (Token 0)

1. **Principle:** Painting 0 embodies the 1/1 singular visual canonical event. Standard ERC-721 transfer functions are permanently locked after primary release; all secondary successions must invoke the `executeSuccession()` function.
2. **Execution Conditions:**
   - `msg.sender` must be the current `ownerOf(0)`;
   - `recipient` cannot be address zero and cannot equal `currentOwner` (self-succession prohibited);
   - `msg.value >= 4.29 ETH` (minimum mandatory consideration).
3. **On-Chain Execution:**
   ```bash
   cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
     "executeSuccession(uint256,address)" \
     0 <RECIPIENT_ADDRESS> \
     --value 4.29ether \
     --rpc-url https://mainnet.base.org --interactive
   ```
4. **Settlement Mechanism & Event Emission:**
   - The contract automatically routes `1.49%` (149 BPS) of the consideration to `treasury`;
   - The remaining balance is transferred directly to `currentOwner` (predecessor);
   - The event `CanonicalSuccession(0, predecessor, successor, consideration, royalty, timestamp)` is emitted on Base as objective immutable evidence.

---

## 5. SANCTUM Sanctuary Access Rights

The contract provides a view function to check SANCTUM eligibility:
```bash
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
  "isSanctumEligible(address)(bool)" <WALLET_ADDRESS> \
  --rpc-url https://mainnet.base.org
```
- Returns `true` if and only if: The wallet concurrently holds The Painting (Token 0) AND at least one Frame token (Token 1 through Token 9).
- Independent of any centralized gatekeeper, authorization, or server approval outside of on-chain state.
