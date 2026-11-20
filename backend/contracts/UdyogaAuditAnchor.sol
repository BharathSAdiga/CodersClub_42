// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UdyogaAuditAnchor
 * @notice Immutable cryptographic anchor contract deployed on Quai Network (Cyprus-1, Chain ID 15000).
 * @dev Anchors DPDP-compliant SHA-256 digests of MSME credit assessments and underwriter decisions.
 * Zero PII is stored on-chain. Only cryptographic digests, timestamps, and public keys are recorded.
 */
contract UdyogaAuditAnchor {
    
    struct AssessmentRecord {
        bytes32 digestHash;         // SHA-256 digest of normalized ACIE scorecard snapshot
        string applicationId;       // Public application identifier (e.g. APP-2026-0891)
        uint16 vitalityScore;       // 0 - 900 ACIE vitality score
        string scoreBand;           // PRIME, MODERATE, DEVELOPING, SUBPRIME
        uint256 blockTimestamp;     // Block timestamp when anchored
        address recordedBy;         // Address of relayer or underwriter
        bool exists;
    }

    struct UnderwritingAttestation {
        bytes32 attestationHash;    // SHA-256 of sanction/covenant terms
        string applicationId;
        string decision;            // APPROVE, APPROVE_WITH_COVENANTS, DECLINE
        uint256 sanctionedAmount;   // Amount in INR
        uint256 timestamp;
        address underwriterAddress;
    }

    // Storage mappings
    mapping(string => AssessmentRecord) private _assessments;
    mapping(string => UnderwritingAttestation[]) private _attestations;
    
    // Ordered list of application IDs for enumeration
    string[] private _applicationIds;

    // Contract administrator / relayer
    address public immutable owner;

    // Events for real-time Quai block explorer / webhook listening
    event AssessmentAnchored(
        string indexed applicationId,
        bytes32 indexed digestHash,
        uint16 vitalityScore,
        string scoreBand,
        address indexed recordedBy,
        uint256 timestamp
    );

    event UnderwritingAttested(
        string indexed applicationId,
        string decision,
        uint256 sanctionedAmount,
        address indexed underwriterAddress,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "UdyogaAuditAnchor: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Anchor an ACIE assessment snapshot digest onto Quai Cyprus-1.
     * @param applicationId The unique application ID.
     * @param digestHash The canonical SHA-256 hash of the ACIE assessment.
     * @param vitalityScore Score between 0 and 900.
     * @param scoreBand Classification (PRIME, MODERATE, etc.)
     */
    function anchorAssessment(
        string calldata applicationId,
        bytes32 digestHash,
        uint16 vitalityScore,
        string calldata scoreBand
    ) external {
        require(bytes(applicationId).length > 0, "Invalid application ID");
        require(digestHash != bytes32(0), "Invalid digest hash");
        require(!_assessments[applicationId].exists, "Assessment already anchored for this application");

        _assessments[applicationId] = AssessmentRecord({
            digestHash: digestHash,
            applicationId: applicationId,
            vitalityScore: vitalityScore,
            scoreBand: scoreBand,
            blockTimestamp: block.timestamp,
            recordedBy: msg.sender,
            exists: true
        });

        _applicationIds.push(applicationId);

        emit AssessmentAnchored(
            applicationId,
            digestHash,
            vitalityScore,
            scoreBand,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Institutional lender records an on-chain attestation for loan sanctioning.
     */
    function recordUnderwritingAttestation(
        string calldata applicationId,
        bytes32 attestationHash,
        string calldata decision,
        uint256 sanctionedAmount
    ) external {
        require(_assessments[applicationId].exists, "Assessment must be anchored before attestation");

        UnderwritingAttestation memory attestation = UnderwritingAttestation({
            attestationHash: attestationHash,
            applicationId: applicationId,
            decision: decision,
            sanctionedAmount: sanctionedAmount,
            timestamp: block.timestamp,
            underwriterAddress: msg.sender
        });

        _attestations[applicationId].push(attestation);

        emit UnderwritingAttested(
            applicationId,
            decision,
            sanctionedAmount,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Verify whether a given local assessment digest matches the anchored Quai Cyprus-1 record.
     */
    function verifyAssessment(
        string calldata applicationId,
        bytes32 expectedDigest
    ) external view returns (bool isAuthentic, uint256 anchoredAt, address recordedBy) {
        AssessmentRecord memory record = _assessments[applicationId];
        if (!record.exists) {
            return (false, 0, address(0));
        }
        return (record.digestHash == expectedDigest, record.blockTimestamp, record.recordedBy);
    }

    /**
     * @notice Retrieve an anchored assessment record.
     */
    function getAssessment(string calldata applicationId) external view returns (AssessmentRecord memory) {
        require(_assessments[applicationId].exists, "Assessment not found");
        return _assessments[applicationId];
    }

    /**
     * @notice Get all underwriting attestations for an application.
     */
    function getAttestations(string calldata applicationId) external view returns (UnderwritingAttestation[] memory) {
        return _attestations[applicationId];
    }

    /**
     * @notice Total number of anchored applications.
     */
    function totalAnchored() external view returns (uint256) {
        return _applicationIds.length;
    }
}
