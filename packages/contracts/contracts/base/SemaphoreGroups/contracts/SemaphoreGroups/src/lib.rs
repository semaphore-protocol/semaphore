#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec, Map,Address};
mod FSemaphoreGroups;
use zk_kit_imt::imt::IMT;
use crate::FSemaphoreGroups::*;

#[contract]
pub struct SemaphoreGroups{
    /// @dev Gets a group id and returns its tree data.
    /// The tree is an Incremental Merkle Tree
    /// which is called Lean Incremental Merkle Tree.
    merkleTrees : Map<u128, IMT>,

    /// @dev Gets a group id and returns its admin.
    /// The admin can be an Ethereum account or a smart contract.
    admins: Map<u128, Address>,

    /// @dev Gets a group id and returns any pending admin.
    /// The pending admin can be an Ethereum account or a smart contract.
    pendingAdmins : Map<u128 ,Address>,
}

#[contractimpl]
impl ISemaphoreGroups for SemaphoreGroups{

    /// @dev Checks if the group admin is the transaction sender.
    /// @param groupId: Id of the group.
    fn only_group_admin(&self,&group_id: u128) -> Result<(), SemaphoreError> {
        let caller_address = ;
        let admin_address = self.admins.get(group_id).ok_or(SemaphoreError::CallerIsNotTheGroupAdmin)?;

        // Verificar si el llamador es el administrador
        if caller_address != admin_address {
            return Err(SemaphoreError::CallerIsNotTheGroupAdmin);
        }

        Ok(()) // Si es el administrador, retorna éxito
    }


    /// @dev Checks if the group exists.
    /// @param groupId: Id of the group.
    fn only_existing_group(&self,groupId: u128) -> Result<(), SemaphoreError> {
        
        if self.admins.get(groupId).is_none() {
            return Err(SemaphoreError::GroupDoesNotExist);
        }
        Ok(())
    }

    /// @dev Creates a new group. Only the admin will be able to add or remove members.
    /// @param groupId: Id of the group.
    /// @param admin: Admin of the group.

    fn _createGroup(&self,env: Env,groupId: u128, admin: Address){
        self.admins.set(groupId, admin);


        let mut event = GroupCreated { groupId };
        env.events().publish((symbol_short!("group"), symbol_short!("created")), event);
        
        let mut event = GroupAdminUpdated {
            groupId: groupId,
            oldAdmin: Address::zero(),
            newAdmin: admin,
        };

        env.events().publish((symbol_short("groupAdmin"), symbol_short("updated")), event);
    }

    /// @dev Updates the group admin. In order for the new admin to actually be updated,
    /// they must explicitly accept by calling `_acceptGroupAdmin`.
    /// @param groupId: Id of the group.
    /// @param newAdmin: New admin of the group.

    fn _updateGroupAdmin(&self,env: Env,groupId: u128, newAdmin: Address){
        // @dev onlygroupadmin function
        self.only_group_admin(groupId)?;

        self.pendingAdmins.set(groupId, newAdmin);
        let mut event = GroupAdminPending{groupId,
            oldAdmin : Env::invoker(),
            newAdmin,
            };
        
        env.events().publish((symbol_short("groupAdmin"), symbol_short("pending")), event);
    }

    /// @dev Allows the new admin to accept to update the group admin with their address.
    /// @param groupId: Id of the group.
    
    fn _acceptGroupAdmin(&self,groupId: u128)-> Result<(), SemaphoreError> {
        let caller_address = Env::invoker();

        if self.pendingAdmins.get(groupId).unwrap_or_default() != caller_address {
            return Err(SemaphoreError::CallerIsNotThePendingGroupAdmin);
        }

        let oldAdmin = self.admins.get(groupId).unwrap_or_default();
        self.admins.insert(groupId, caller_address);
        self.pendingAdmins.remove(groupId);
        
        let mut event = GroupAdminUpdated {
            groupId,
            oldAdmin,
            newAdmin: caller_address,
        };

        Env.events().publish((Symbol!("groupAdmin"), Symbol!("accept")), event);
    
        Ok(())
    }

    /// @dev Adds an identity commitment to an existing group.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: New identity commitment.
    /// @return merkleTreeRoot New root hash of the tree.


    fn hash_function(&self,nodes: Vec<String>) -> String {
        nodes.join("-")
    }

    fn _addMember(&self,groupId: u128, identityCommitment: u128)->u128{
        // @dev onlygroupadmin function
        self.only_group_admin(groupId)?;
        let index = Self::getMerkleTreeSize(groupId);
        //initialize tree
        let mut tree = self.merkleTrees
        .get(groupId)
        .unwrap_or_else(|| {
            let newTree = IMT::new(self.hash_function, 10000,zero.clone(),2,vec![]).unwrap();
            self.merkleTrees.insert(groupId, newTree);
            self.merkleTrees.get(groupId).unwrap()
        });

        let merkleTreeRoot = tree.insert(identityCommitment.to_string()).unwrap();
        
    
        Env::emit_event(MemberAdded {
            groupId,
            index,
            identityCommitment,
            merkleTreeRoot,
        });
    
        merkleTreeRoot
    }

    /// @dev Adds new members to an existing group.
    /// @param groupId: Id of the group.
    /// @param identityCommitments: New identity commitments.
    /// @return merkleTreeRoot New root hash of the tree.
    
    /*fn _addMembers(groupId: u128,identityCommitments: Vec<u128>)->u128{
        
        // @dev onlygroupadmin function
        self.only_group_admin(groupId)?;    
        let startIndex = self.getMerkleTreeSize(groupId);

        //@ dev incomplete
        let merkleTreeRoot = self.merkleTrees


        Env::emit_event(MembersAdded {
            groupId,
            startIndex,
            identityCommitment,
            merkleTreeRoot,
        });

        merkleTreeRoot
    }*/


    /// @dev Updates an identity commitment of an existing group. A proof of membership is
    /// needed to check if the node to be updated is part of the tree.
    /// @param groupId: Id of the group.
    /// @param oldIdentityCommitment: Existing identity commitment to be updated.
    /// @param newIdentityCommitment: New identity commitment.
    /// @param merkleProofSiblings: Array of the sibling nodes of the proof of membership.
    /// @return merkleTreeRoot New root hash of the tree.
    fn _updateMember(&self,groupId: u128, oldIdentityCommitment: u128, newIdentityCommitment: u128,merkleProofSiblings : Vec<u128>)-> u128{
       // @dev onlygroupadmin function
       self.only_group_admin(groupId)?;

       let index = Self::indexOf(groupId,newIdentityCommitment);
       let merkleTreeRoot = self.merkleTrees.get(groupId).unwrap_or_default().update(index,newIdentityCommitment);

       Env::emit_event(MemberUpdated{
        groupId,
        index,
        oldIdentityCommitment,
        newIdentityCommitment,
       });

       merkleTreeRoot

    }

    /// @dev Removes an identity commitment from an existing group. A proof of membership is
    /// needed to check if the node to be deleted is part of the tree.
    /// @param groupId: Id of the group.
    /// @param identityCommitment: Existing identity commitment to be removed.
    /// @param merkleProofSiblings: Array of the sibling nodes of the proof of membership.
    /// @return merkleTreeRoot New root hash of the tree.
    fn _removeMember(&self,groupId:u128,identityCommitment: u128,merkleProofSiblings: Vec<u128>)-> u128{
        self.only_group_admin(groupId)?;
        let index = Self::indexOf(&groupId,identityCommitment);
        let merkleTreeRoot = self.merkleTrees.get(groupId).unwrap_or_default().delete(index);

        Env::emit_event(MemberRemoved{
            groupId,
            index,
            identityCommitment,
            merkleTreeRoot,
        });
        
        merkleTreeRoot
    }



    /// @dev See {ISemaphoreGroups-getGroupAdmin}.
    fn  getGroupAdmin(&self,groupId:u128) -> Address {
        self.admins.get(groupId).unwrap_or_default()
    }

    /// @dev See {ISemaphoreGroups-hasMember}.
    fn hasMember(&self,groupId:u128,identityCommitment:u128) -> bool {
        self.merkleTrees.get(groupId).unwrap_or_default().leaves.get(&identityCommitment).map_or(false, |&value| value != 0)
    }

    
    /// @dev See {ISemaphoreGroups-indexOf}.
    fn indexOf(&self,groupId : u128, identityCommitment: u128) -> Result<u128, SemaphoreError> {
        
        match self.merkleTrees.get(groupId).unwrap_or_default().leaves.get(&identityCommitment) {
            Some(&index) => Ok(index - 1), // Devolver el índice si existe
            None => Err(SemaphoreError::LeafDoesNotExist), // Retornar error si no existe
        }
            
    }

    /// @dev See {ISemaphoreGroups-getMerkleTreeRoot}.
    fn getMerkleTreeRoot(&self,groupId:u128) -> u128 {
        self.merkleTrees.get(groupId).unwrap_or_default().root()
    }

    /// @dev See {ISemaphoreGroups-getMerkleTreeDepth}.
    fn getMerkleTreeDepth(&self,groupId:u128) -> u128 {
        self.merkleTrees.get(groupId).unwrap_or_default().depth()
    }

    /// @dev See {ISemaphoreGroups-getMerkleTreeSize}.
    fn getMerkleTreeSize(&self,groupId:u128)  -> u128  {
        self.merkleTrees.get(groupId).unwrap_or_default().leaves.len()
    }

}

mod test;
