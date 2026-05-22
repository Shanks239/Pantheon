// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PantheonNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    // tokenId => debate hash
    mapping(uint256 => bytes32) public debateHash;

    // tokenId => whether post-tournament content is unlocked
    mapping(uint256 => bool) public verdictRevealed;

    event VerdictMinted(address indexed minter, uint256 tokenId, bytes32 debateHash);
    event VerdictRevealed(uint256 tokenId);

    constructor() ERC721("Pantheon XI", "PXXI") Ownable(msg.sender) {}

    // ── Mint a verdict NFT ────────────────────────────────────────────────
    function mintVerdict(
        string calldata tokenURI,
        bytes32 _debateHash
    ) external returns (uint256) {
        _tokenIds++;
        uint256 newId = _tokenIds;

        _safeMint(msg.sender, newId);
        _setTokenURI(newId, tokenURI);
        debateHash[newId] = _debateHash;

        emit VerdictMinted(msg.sender, newId, _debateHash);
        return newId;
    }

    // ── Owner unlocks post-tournament content for a token ─────────────────
    function revealVerdict(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        verdictRevealed[tokenId] = true;
        emit VerdictRevealed(tokenId);
    }

    // ── Check if caller owns a token and verdict is revealed ──────────────
    function canAccessVerdict(uint256 tokenId) external view returns (bool) {
        return (
            ownerOf(tokenId) == msg.sender &&
            verdictRevealed[tokenId]
        );
    }

    // ── Total minted ──────────────────────────────────────────────────────
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }
}