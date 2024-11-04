#![no_std]
use soroban_sdk::{Address,Vec,String,Env};


#[derive(Debug)]
pub enum SemaphoreError {
    GroupDoesNotExist,
    CallerIsNotTheGroupAdmin,
    CallerIsNotThePendingGroupAdmin,
    WrongSiblingNodes,
    LeafGreaterThanSnarkScalarField,
    LeafCannotBeZero,
    LeafAlreadyExists,
    LeafDoesNotExist,

}

//eventos afuera del trait luego llamamos dichos eventos en las funciones


/// @dev Event emitted when a new group is created.
/// @param groupId: Id of the group.

pub struct GroupCreated {
    pub groupId: u128,
}

/// @dev Event emitted when a new admin is assigned to a group.
/// @param groupId: Id of the group.
/// @param oldAdmin: Old admin of the group.
/// @param newAdmin: New admin of the group.

pub struct GroupAdminUpdated {
    pub groupId: u128,
    pub oldAdmin: Address,
    pub newAdmin: Address,
}

/// @dev Event emitted when a group admin is being updated.
/// @param groupId: Id of the group.
/// @param oldAdmin: Old admin of the group.
/// @param newAdmin: New admin of the group.

pub struct GroupAdminPending {
    pub groupId: u128,
    pub oldAdmin: Address,
    pub newAdmin: Address,
}

/// @dev Event emitted when a new identity commitment is added.
/// @param groupId: Group id of the group.
/// @param index: Merkle tree leaf index.
/// @param identityCommitment: New identity commitment.
/// @param merkleTreeRoot: New root hash of the tree.

pub struct MemberAdded {
    pub groupId: u128,
    pub index: u128,
    pub identityCommitment: u128,
    pub merkleTreeRoot: u128,
}


/// @dev Event emitted when many identity commitments are added at the same time.
/// @param groupId: Group id of the group.
/// @param startIndex: Index of the first element of the new identity commitments in the merkle tree.
/// @param identityCommitments: The new identity commitments.
/// @param merkleTreeRoot: New root hash of the tree.

pub struct MembersAdded {
    pub groupId: u128,
    pub index: u128,
    pub identityCommitment: Vec<u128>,
    pub merkleTreeRoot: u128,
}

/// @dev Event emitted when an identity commitment is updated.
/// @param groupId: Group id of the group.
/// @param index: Identity commitment index.
/// @param identityCommitment: Existing identity commitment to be updated.
/// @param newIdentityCommitment: New identity commitment.
/// @param merkleTreeRoot: New root hash of the tree.

pub struct MemberUpdated {
    pub groupId: u128,
    pub index: u128,
    pub identityCommitment: u128,
    pub newIdentityCommitment: u128,
    pub merkleTreeRoot: u128,
    
}

/// @dev Event emitted when a new identity commitment is removed.
/// @param groupId: Group id of the group.
/// @param index: Identity commitment index.
/// @param identityCommitment: Existing identity commitment to be removed.
/// @param merkleTreeRoot: New root hash of the tree.

pub struct MemberRemoved {
    pub groupId: u128,
    pub index: u128,
    pub identityCommitment: u128,
    pub merkleTreeRoot: u128,
}

//finished events

pub trait ISemaphoreGroups{
    /// @dev Returns the address of the group admin. The group admin can be an Ethereum account or a smart contract.
    /// @param groupId: Id of the group.
    /// @return Address of the group admin.
    fn getGroupAdmin(&self, groupId: u128) -> Address;

     /// @dev Returns true if a member exists in a group.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: Identity commitment.
    /// @return True if the member exists, false otherwise.
    fn hasMember(&self,groupId: u128, identityCommitment: u128) -> bool;

    /// @dev Returns the index of a member.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: Identity commitment.
    /// @return Index of member.
    fn indexOf(&self,groupId: u128, identityCommitment: u128) -> Result<u128, SemaphoreError> ;

        /// @dev Returns the last root hash of a group.
    /// @param groupId: Id of the group.
    /// @return Root hash of the group.
    fn getMerkleTreeRoot(&self,groupId: u128) -> u128;

    /// @dev Returns the depth of the tree of a group.
    /// @param groupId: Id of the group.
    /// @return Depth of the group tree.
    fn getMerkleTreeDepth(&self,groupId: u128)  -> u128;

    /// @dev Returns the number of tree leaves of a group.
    /// @param groupId: Id of the group.
    /// @return Number of tree leaves.
    fn getMerkleTreeSize(&self,groupId: u128)  -> u128;

    fn _removeMember(&self,groupId:u128,identityCommitment: u128,merkleProofSiblings: Vec<u128>)-> u128;

    fn _updateMember(&self,groupId: u128, oldIdentityCommitment: u128, newIdentityCommitment: u128,merkleProofSiblings : Vec<u128>)-> u128;

    fn _addMember(&self,groupId: u128, identityCommitment: u128)->u128;

    fn hash_function(&self,nodes: Vec<String>) -> String;

    fn _acceptGroupAdmin(&self,groupId: u128)-> Result<(), SemaphoreError>;

    fn _updateGroupAdmin(&self,env: Env,groupId: u128, newAdmin: Address);

    fn _createGroup(&self,env: Env,groupId: u128, admin: Address);

    fn only_existing_group(&self,groupId: u128) -> Result<(), SemaphoreError> ;


    fn only_group_admin(&self,groupId: u128) -> Result<(), SemaphoreError>;

}

