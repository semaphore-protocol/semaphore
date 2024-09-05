// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// This interface has been copied & pasted from MACI.
/// https://github.com/privacy-scaling-explorations/maci/blob/dev/contracts/contracts/interfaces/IHats.sol
/// with commit hash bb429aece0eed2eed5d526e2a23522722c42ba5c.
/// credits to Spencer Graham (https://github.com/spengrah) for writing this.

/// @title IHatsMinimal
/// @notice Minimal interface for the Hats Protocol contract.
/// @dev Includes only the functions required for the HatsExcubia and associated tests.
interface IHatsMinimal {
    /// @notice Creates and mints a Hat that is its own admin, i.e. a "topHat"
    /// @dev A topHat has no eligibility and no toggle
    /// @param _target The address to which the newly created topHat is minted
    /// @param _details A description of the Hat [optional]. Should not be larger than 7000 bytes
    ///                 (enforced in changeHatDetails)
    /// @param _imageURI The image uri for this top hat and the fallback for its
    ///                  downstream hats [optional]. Should not be larger than 7000 bytes
    ///                  (enforced in changeHatImageURI)
    /// @return topHatId The id of the newly created topHat
    function mintTopHat(
        address _target,
        string calldata _details,
        string calldata _imageURI
    ) external returns (uint256);

    /// @notice Creates a new hat. The msg.sender must wear the `_admin` hat.
    /// @dev Initializes a new Hat struct, but does not mint any tokens.
    /// @param _details A description of the Hat. Should not be larger than 7000 bytes (enforced in changeHatDetails)
    /// @param _maxSupply The total instances of the Hat that can be worn at once
    /// @param _admin The id of the Hat that will control who wears the newly created hat
    /// @param _eligibility The address that can report on the Hat wearer's status
    /// @param _toggle The address that can deactivate the Hat
    /// @param _mutable Whether the hat's properties are changeable after creation
    /// @param _imageURI The image uri for this hat and the fallback for its
    ///   downstream hats [optional]. Should not be larger than 7000 bytes (enforced in changeHatImageURI)
    /// @return newHatId The id of the newly created Hat
    function createHat(
        uint256 _admin,
        string calldata _details,
        uint32 _maxSupply,
        address _eligibility,
        address _toggle,
        bool _mutable,
        string calldata _imageURI
    ) external returns (uint256);

    /// @notice Mints an ERC1155-similar token of the Hat to an eligible recipient, who then "wears" the hat
    /// @dev The msg.sender must wear an admin Hat of `_hatId`, and the recipient must be eligible to wear `_hatId`
    /// @param _hatId The id of the Hat to mint
    /// @param _wearer The address to which the Hat is minted
    /// @return success Whether the mint succeeded
    function mintHat(uint256 _hatId, address _wearer) external returns (bool success);

    /// @notice Checks whether a given address wears a given Hat
    /// @dev Convenience function that wraps `balanceOf`
    /// @param account The address in question
    /// @param hat The id of the Hat that the `_user` might wear
    /// @return isWearer Whether the `_user` wears the Hat.
    function isWearerOfHat(address account, uint256 hat) external view returns (bool);
}
