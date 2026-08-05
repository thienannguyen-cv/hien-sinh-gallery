// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HienSinhGallery
 * @notice Smart Contract cho tác phẩm "Hiện Sinh" — một thực hành quan hệ trên blockchain.
 *         "Not a painting, not a token: A relational practice on blockchain."
 *
 * @dev ERC-721 (Non-Fungible Token) + ERC-2981 (Royalty Standard) + EIP-712 Signature Verification
 *      9 Canonical Axes Frame Editions (Token IDs 1-9)
 *      Duy nhất 1 Frame có thể mang danh hiệu DESIGNATED_STEWARD (Complete 1/1)
 *      Immutable & Ownerless: Không ai có thể làm thay đổi metadata hay rút tiền đi đâu ngoài ví Treasury cố định.
 *
 * Network: Base Mainnet (Chain ID: 8453) / Base Sepolia Testnet (Chain ID: 84532)
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract HienSinhGallery is ERC721URIStorage, IERC2981, EIP712, ReentrancyGuard {
    using ECDSA for bytes32;

    // ─────────────────────────────────────────────────────────────
    // CANONICAL COMMITMENTS (Immutable — locked at deployment)
    // ─────────────────────────────────────────────────────────────

    /// @notice SHA-256 of the Canonical Painting PNG (H_CORE)
    bytes32 public constant H_CORE =
        0x190dfcfc8439c1613c149e72088c0bd32eefa66f2ded7cfbc0f250640b146d8e;

    /// @notice SHA-256 of the Scar-code (H_CONSTITUTIVE)
    bytes32 public constant H_CONSTITUTIVE_SCAR =
        0x370e115eb052e1cf9b575840da35d2ec6544daa8ad45d3020ed6d6cd9dce9378;

    /// @notice SHA-256 of the Ritual Transcript (H_CONSTITUTIVE)
    bytes32 public constant H_CONSTITUTIVE_RITUAL =
        0x3d8e7c0b130f4f8b76bc5d0d4b643b08e03a3bdfb5633317647a2f680c6c0a11;

    // ─────────────────────────────────────────────────────────────
    // SUPPLY & PRICING CONSTANTS
    // ─────────────────────────────────────────────────────────────

    uint256 public constant TOTAL_SUPPLY = 9;           // 9 Canonical Axes (Token IDs 1-9)
    uint256 public constant FRAME_PRICE = 0.081 ether;  // Per Frame Edition (0.081 ETH)
    uint256 public constant ACCESSION_FEE = 4.29 ether; // Complete Stewardship Accession (4.29 ETH)

    uint96 public constant ROYALTY_BPS = 500; // 5% secondary royalty (ERC-2981 standard)

    /// @notice Immutable Artist Treasury Address (Fixed receiver for all funds & royalties)
    address public immutable ARTIST_TREASURY;

    // ─────────────────────────────────────────────────────────────
    // EIP-712 STEWARDSHIP INVITATION TYPEHASH
    // ─────────────────────────────────────────────────────────────

    bytes32 public constant STEWARDSHIP_INVITATION_TYPEHASH = keccak256(
        "StewardshipInvitation(uint256 tokenId,bytes32 designationHash,bytes32 archiveCommitment,bytes32 licenseHash,uint256 deadline,uint256 nonce)"
    );

    // ─────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────

    uint256 private _nextTokenId = 1; // All 9 Collector frames are Token IDs 1 to 9

    /// @notice Token ID that holds the DESIGNATED_STEWARD designation (0 = unassigned)
    uint256 public designatedStewardTokenId;
    bool public stewardDesignated;

    /// @notice Mapping from tokenId => whether this frame is the designated steward
    mapping(uint256 => bool) public isDesignatedSteward;

    /// @notice Mapping for used EIP-712 nonces to prevent replay attacks
    mapping(uint256 => bool) public usedNonces;

    /// @notice Whether public minting is active
    bool public mintActive = true;

    // ─────────────────────────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────────────────────────

    event FrameMinted(address indexed collector, uint256 indexed tokenId);
    event StewardDesignated(
        address indexed steward,
        uint256 indexed tokenId,
        bytes32 designationHash,
        bytes32 archiveCommitment,
        uint256 accessionFee
    );
    event FundsWithdrawn(address indexed to, uint256 amount);

    // ─────────────────────────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────────────────────────

    constructor(address artistTreasury)
        ERC721("Hien Sinh", "HIENSINH")
        EIP712("Hien Sinh", "1")
    {
        require(artistTreasury != address(0), "INVALID_TREASURY");
        ARTIST_TREASURY = artistTreasury;
    }

    // ─────────────────────────────────────────────────────────────
    // MINTING (Token IDs 1-9)
    // ─────────────────────────────────────────────────────────────

    /**
     * @notice Mint a Frame Edition (Token IDs 1-9)
     * @dev All 9 Canonical Axes are available to collectors at 0.081 ETH each.
     */
    function mintFrame() external payable nonReentrant {
        require(mintActive, "MINT_NOT_ACTIVE");
        require(_nextTokenId <= TOTAL_SUPPLY, "SUPPLY_EXHAUSTED"); // Max 9 frames
        require(msg.value == FRAME_PRICE, "INCORRECT_PRICE");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        emit FrameMinted(msg.sender, tokenId);
    }

    // ─────────────────────────────────────────────────────────────
    // STEWARDSHIP ACCESSION (EIP-712 Cryptographic Verification)
    // ─────────────────────────────────────────────────────────────

    /**
     * @notice Accepts the Stewardship Invitation after off-chain "Three Brushstrokes" ritual.
     * @dev Requires valid EIP-712 cryptographic signature from ARTIST_TREASURY.
     * @param tokenId The Frame token held by collector to elevate to Steward.
     * @param designationHash Hash of the Stewardship Designation record.
     * @param archiveCommitment Hash of the Archive Package commitment.
     * @param licenseHash Hash of the legal schedule (SCHEDULE-COMPLETE.md).
     * @param deadline Expiration timestamp of the invitation signature.
     * @param nonce Unique nonce for replay protection.
     * @param artistSignature EIP-712 signature generated off-chain by the Artist.
     */
    function acceptStewardship(
        uint256 tokenId,
        bytes32 designationHash,
        bytes32 archiveCommitment,
        bytes32 licenseHash,
        uint256 deadline,
        uint256 nonce,
        bytes calldata artistSignature
    ) external payable nonReentrant {
        require(!stewardDesignated, "STEWARD_ALREADY_DESIGNATED");
        require(ownerOf(tokenId) == msg.sender, "NOT_TOKEN_OWNER");
        require(msg.value == ACCESSION_FEE, "INCORRECT_ACCESSION_FEE");
        require(block.timestamp <= deadline, "INVITATION_EXPIRED");
        require(!usedNonces[nonce], "NONCE_ALREADY_USED");

        // Verify EIP-712 Signature from Artist
        bytes32 structHash = keccak256(
            abi.encode(
                STEWARDSHIP_INVITATION_TYPEHASH,
                tokenId,
                designationHash,
                archiveCommitment,
                licenseHash,
                deadline,
                nonce
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, artistSignature);
        require(signer == ARTIST_TREASURY, "INVALID_ARTIST_SIGNATURE");

        // Record Designation
        usedNonces[nonce] = true;
        stewardDesignated = true;
        designatedStewardTokenId = tokenId;
        isDesignatedSteward[tokenId] = true;

        emit StewardDesignated(
            msg.sender,
            tokenId,
            designationHash,
            archiveCommitment,
            msg.value
        );
    }

    // ─────────────────────────────────────────────────────────────
    // ROYALTIES (ERC-2981 — 5% to ARTIST_TREASURY)
    // ─────────────────────────────────────────────────────────────

    function royaltyInfo(uint256, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        return (ARTIST_TREASURY, (salePrice * ROYALTY_BPS) / 10000);
    }

    // ─────────────────────────────────────────────────────────────
    // PERMISSIONLESS WITHDRAWAL (Immutable & Ownerless)
    // ─────────────────────────────────────────────────────────────

    /**
     * @notice Permissionless withdrawal. Anyone can call this function;
     *         100% of funds are automatically sent to ARTIST_TREASURY.
     */
    function withdraw() external nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "NO_FUNDS");
        (bool ok, ) = payable(ARTIST_TREASURY).call{value: balance}("");
        require(ok, "TRANSFER_FAILED");
        emit FundsWithdrawn(ARTIST_TREASURY, balance);
    }

    // ─────────────────────────────────────────────────────────────
    // INTERFACE SUPPORT
    // ─────────────────────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    // ─────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────

    /// @notice Returns how many collector frames have been minted so far
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }
}
