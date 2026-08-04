// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HienSinhGallery
 * @notice Smart Contract cho tác phẩm "Hiện Sinh" — một thực hành quan hệ trên blockchain.
 *         "Not a painting, not a token: A relational practice on blockchain."
 *
 * @dev ERC-721 (Non-Fungible Token) + ERC-2981 (Royalty Standard)
 *      9 Canonical Axes Frame Editions (Token IDs 1-9)
 *      Duy nhất 1 Frame có thể mang danh hiệu DESIGNATED_STEWARD (Complete 1/1)
 *      Non-upgradeable. Canonical hashes locked on deployment.
 *
 * Network: Base Mainnet (Chain ID: 8453) / Base Sepolia Testnet (Chain ID: 84532)
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract HienSinhGallery is ERC721URIStorage, IERC2981, Ownable, ReentrancyGuard {

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

    uint256 public constant TOTAL_SUPPLY = 9;           // 9 Canonical Axes
    uint256 public constant ARTIST_ANCHOR_ID = 0;       // Frame 00 — Artist's Anchor (not for sale)
    uint256 public constant FRAME_PRICE = 0.081 ether;  // Per Frame Edition
    uint256 public constant ACCESSION_FEE = 4.29 ether; // Complete Stewardship Accession

    uint96 public constant ROYALTY_BPS = 1000; // 10% secondary royalty (ERC-2981)

    // ─────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────

    uint256 private _nextTokenId = 1; // Collector frames start at Token ID 1

    /// @notice Token ID that holds the DESIGNATED_STEWARD designation (0 = unassigned)
    uint256 public designatedStewardTokenId;
    bool public stewardDesignated;

    /// @notice Mapping from tokenId => whether this frame is the designated steward
    mapping(uint256 => bool) public isDesignatedSteward;

    /// @notice Whether the primary mint is active
    bool public mintActive;

    // ─────────────────────────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────────────────────────

    event FrameMinted(address indexed collector, uint256 indexed tokenId);
    event StewardDesignated(address indexed steward, uint256 indexed tokenId, uint256 accessionFee);
    event MintToggled(bool active);
    event FundsWithdrawn(address indexed to, uint256 amount);

    // ─────────────────────────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────────────────────────

    constructor(address artistWallet)
        ERC721("Hien Sinh", "HISNGH")
        Ownable(artistWallet)
    {
        mintActive = false; // Artist controls when minting opens
    }

    // ─────────────────────────────────────────────────────────────
    // MINTING
    // ─────────────────────────────────────────────────────────────

    /**
     * @notice Mint a Frame Edition (Token IDs 1-8, collectors only)
     * @dev Token ID 0 is reserved for the Artist's Anchor and is NOT mintable.
     *      Maximum 8 collector frames (total supply 9, artist keeps frame 00).
     */
    function mintFrame() external payable nonReentrant {
        require(mintActive, "MINT_NOT_ACTIVE");
        require(_nextTokenId <= 8, "SUPPLY_EXHAUSTED"); // 8 collector frames max
        require(msg.value == FRAME_PRICE, "INCORRECT_PRICE");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        emit FrameMinted(msg.sender, tokenId);
    }

    /**
     * @notice Artist mints the Anchor Frame (Token ID 0) to their own wallet.
     *         Can only be called once by the contract owner.
     */
    function mintArtistAnchor() external onlyOwner {
        require(!_exists(0), "ANCHOR_ALREADY_MINTED");
        _safeMint(owner(), 0);
        emit FrameMinted(owner(), 0);
    }

    // ─────────────────────────────────────────────────────────────
    // STEWARDSHIP ACCESSION
    // ─────────────────────────────────────────────────────────────

    /**
     * @notice A Frame holder initiates the Accession ritual by paying the accession fee.
     *         The Artist must have already confirmed encounter evidence off-chain
     *         and sent a Stewardship Invitation. This on-chain call records the designation.
     * @param tokenId The Frame token the collector holds and wishes to elevate to Steward.
     */
    function accede(uint256 tokenId) external payable nonReentrant {
        require(!stewardDesignated, "STEWARD_ALREADY_DESIGNATED");
        require(ownerOf(tokenId) == msg.sender, "NOT_TOKEN_OWNER");
        require(tokenId != 0, "ARTIST_ANCHOR_CANNOT_ACCEDE");
        require(msg.value == ACCESSION_FEE, "INCORRECT_ACCESSION_FEE");

        stewardDesignated = true;
        designatedStewardTokenId = tokenId;
        isDesignatedSteward[tokenId] = true;

        emit StewardDesignated(msg.sender, tokenId, msg.value);
    }

    /**
     * @notice On token transfer, the Steward designation follows the token.
     *         Stewardship is attached to the token (not the address).
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    // ─────────────────────────────────────────────────────────────
    // ROYALTIES (ERC-2981)
    // ─────────────────────────────────────────────────────────────

    function royaltyInfo(uint256, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        return (owner(), (salePrice * ROYALTY_BPS) / 10000);
    }

    // ─────────────────────────────────────────────────────────────
    // OWNER CONTROLS
    // ─────────────────────────────────────────────────────────────

    function toggleMint(bool active) external onlyOwner {
        mintActive = active;
        emit MintToggled(active);
    }

    function setTokenURI(uint256 tokenId, string calldata uri) external onlyOwner {
        _setTokenURI(tokenId, uri);
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "NO_FUNDS");
        (bool ok, ) = payable(owner()).call{value: balance}("");
        require(ok, "TRANSFER_FAILED");
        emit FundsWithdrawn(owner(), balance);
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

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /// @notice Returns how many collector frames have been minted so far
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }
}
