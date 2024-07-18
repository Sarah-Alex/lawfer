// const AccessControl = artifacts.require("Access_Control");

// contract("Access_Control", accounts => {
//     let accessControl;
//     const owner = accounts[0];
//     const sender1 = accounts[1];
//     const sender2 = accounts[2];
//     const user1 = accounts[3];
//     const user2 = accounts[4];

//     before(async () => {
//         accessControl = await AccessControl.deployed();
//     });

//     it("should deploy with the correct owner", async () => {
//         const contractOwner = await accessControl.owner();
//         assert.equal(contractOwner, owner, "Owner should be the deployer");
//     });

//     // User tests
//     it("should allow the owner to add a user", async () => {
//         await accessControl.addUser(sender1, "Alice", "ID123", { from: owner });
//         const user = await accessControl.getuserList(sender1, { from: owner });
//         assert.equal(user[0], "Alice", "Username should be Alice");
//         assert.equal(user[1], "ID123", "UserID should be ID123");
//     });

//     it("should not allow non-owners to add a user", async () => {
//         try {
//             await accessControl.addUser(sender2, "Bob", "ID456", { from: sender1 });
//             assert.fail("Non-owner was able to add a user");
//         } catch (error) {
//             assert(error.message.includes("Caller is not the owner"), "Expected only owner can add user error");
//         }
//     });

//     it("should not allow adding a user that already exists", async () => {
//         try {
//             await accessControl.addUser(sender1, "Alice", "ID123", { from: owner });
//             assert.fail("Able to add an existing user");
//         } catch (error) {
//             assert(error.message.includes("User already exists"), "Expected user already exists error");
//         }
//     });

//     it("should allow the owner to delete a user", async () => {
//         await accessControl.deleteUser(sender1, { from: owner });
//         try {
//             await accessControl.getuserList(sender1, { from: owner });
//             assert.fail("Able to get a deleted user");
//         } catch (error) {
//             assert(error.message.includes(""), "Expected error when getting a deleted user");
//         }
//     });

//     it("should not allow non-owners to delete a user", async () => {
//         await accessControl.addUser(sender1, "Alice", "ID123", { from: owner });
//         try {
//             await accessControl.deleteUser(sender1, { from: sender1 });
//             assert.fail("Non-owner was able to delete a user");
//         } catch (error) {
//             assert(error.message.includes("Caller is not the owner"), "Expected only owner can delete user error");
//         }
//     });

//     it("should not allow deleting a user that does not exist", async () => {
//         try {
//             await accessControl.deleteUser(sender2, { from: owner });
//             assert.fail("Able to delete a non-existing user");
//         } catch (error) {
//             assert(error.message.includes("User does not exist"), "Expected user does not exist error");
//         }
//     });

//     // Sender tests
//     it("should allow the owner to add a sender", async () => {
//         await accessControl.addSender(sender1, "Charlie", { from: owner });
//         const sender = await accessControl.senderList(sender1, { from: owner });
//         assert.equal(sender.sendername, "Charlie", "Sender name should be Charlie");
//     });

//     it("should not allow non-owners to add a sender", async () => {
//         try {
//             await accessControl.addSender(sender2, "David", { from: sender1 });
//             assert.fail("Non-owner was able to add a sender");
//         } catch (error) {
//             assert(error.message.includes("Caller is not the owner"), "Expected only owner can add sender error");
//         }
//     });

//     it("should not allow adding a sender that already exists", async () => {
//         try {
//             await accessControl.addSender(sender1, "Charlie", { from: owner });
//             assert.fail("Able to add an existing sender");
//         } catch (error) {
//             assert(error.message.includes("Sender already exists"), "Expected sender already exists error");
//         }
//     });

//     it("should allow the owner to delete a sender", async () => {
//         await accessControl.deleteSender(sender1, { from: owner });
//         try {
//             await accessControl.senderList(sender1, { from: owner });
//             assert.fail("Able to get a deleted sender");
//         } catch (error) {
//             assert(error.message.includes(""), "Expected error when getting a deleted sender");
//         }
//     });

//     it("should not allow non-owners to delete a sender", async () => {
//         await accessControl.addSender(sender1, "Charlie", { from: owner });
//         try {
//             await accessControl.deleteSender(sender1, { from: sender1 });
//             assert.fail("Non-owner was able to delete a sender");
//         } catch (error) {
//             assert(error.message.includes("Caller is not the owner"), "Expected only owner can delete sender error");
//         }
//     });

//     it("should not allow deleting a sender that does not exist", async () => {
//         try {
//             await accessControl.deleteSender(sender2, { from: owner });
//             assert.fail("Able to delete a non-existing sender");
//         } catch (error) {
//             assert(error.message.includes("Sender does not exist"), "Expected sender does not exist error");
//         }
//     });

//     it("should allow verifying a sender", async () => {
//         const result = await accessControl.verifySender(sender1, "Charlie", { from: owner });
//         assert.equal(result, true, "Sender verification failed");
//     });

//     it("should return false for incorrect sender verification", async () => {
//         const result = await accessControl.verifySender(sender1, "WrongName", { from: owner });
//         assert.equal(result, false, "Sender verification should fail for incorrect details");
//     });
//         // Document tests
//         it("should allow a valid sender to add a document", async () => {
//             await accessControl.addDocument("QmHash123", "DocID123", user1, { from: sender1 });
//             const documents = await accessControl.getDocuments(user1, { from: user1 });
//             assert.equal(documents[0][0], "QmHash123", "IPFS hash should be QmHash123");
//             assert.equal(documents[1][0], "DocID123", "Document ID should be DocID123");
//         });
    
//         it("should not allow a non-sender to add a document", async () => {
//             try {
//                 await accessControl.addDocument("doc1name","QmHash456", "DocID456", user1, { from: sender2 });
//                 assert.fail("Non-sender was able to add a document");
//             } catch (error) {
//                 assert(error.message.includes("account used is not sender"), "Expected sender not valid error");
//             }
//         });
    
//         // it("should not allow adding a document for a non-existent user", async () => {
//         //     try {
//         //         await accessControl.addDocument("QmHash789", "DocID789", accounts[4], { from: user1 });
//         //         assert.fail("Able to add a document for a non-existent user");
//         //     } catch (error) {
//         //         assert(error.message.includes("account used is not sender"), "account used is not sender");
//         //     }
//         // });
    
//         it("should allow a user to retrieve their documents", async () => {
//             const documents = await accessControl.getDocuments(user1, { from: user1 });
//             assert.equal(documents[0][0], "QmHash123", "IPFS hash should be QmHash123");
//             assert.equal(documents[1][0], "DocID123", "Document ID should be DocID123");
//         });
    
//         it("should not allow another user to retrieve someone else's documents", async () => {
//             try {
//                 await accessControl.getDocuments(user1, { from: sender1 });
//                 assert.fail("Able to retrieve documents of another user");
//             } catch (error) {
//                 assert(error.message.includes("attempt to access denied"), "Expected access denied error");
//             }
//         });
// });

// test/AccessControl.test.js
const AccessControl = artifacts.require("Access_Control");
const truffleAssert = require('truffle-assertions');

contract("Access_Control", (accounts) => {
    let instance;

    beforeEach(async () => {
        instance = await AccessControl.new({ from: accounts[0] });
    });

    it("should add a new user", async () => {
        await instance.addUser(accounts[1], "user1", "userID1", false, { from: accounts[0] });
        const user = await instance.getuserList(accounts[1]);
        
        assert.equal(user[0], "user1", "Username should be user1");
        assert.equal(user[1], "userID1", "UserID should be userID1");
    });

    it("should add a new sender", async () => {
        await instance.addUser(accounts[2], "sender1", "sendID1", true, { from: accounts[0] });
        const sender = await instance.senderList(accounts[2]);
        assert.equal(sender.username, "sender1", "Sender username should be sender1");
        assert.equal(sender.userID, "sendID1", "Sender ID should be sendID1");
    });

    it("should not allow non-owner to add users or senders", async () => {
        await truffleAssert.reverts(
            instance.addUser(accounts[3], "user1", "userID1", false, { from: accounts[1] }),
            "Caller is not the owner"
        );
    });

    it("should delete a user", async () => {
        await instance.addUser(accounts[1], "user1", "userID1", false, { from: accounts[0] });
        await instance.deleteUser(accounts[1], false, { from: accounts[0] });
        const user = await instance.receiverList(accounts[2]);
        assert.equal(user.username, "", "Sender should be deleted");
        assert.equal(user.userID, "", "Sender ID should be deleted");
        
    });

    it("should delete a sender", async () => {
        await instance.addUser(accounts[2], "sender1", "sendID1", true, { from: accounts[0] });
        await instance.deleteUser(accounts[2], true, { from: accounts[0] });
        const sender = await instance.senderList(accounts[2]);
        assert.equal(sender.username, "", "Sender should be deleted");
        assert.equal(sender.userID, "", "Sender ID should be deleted");
    });

    it("should verify a user", async () => {
        await instance.addUser(accounts[1], "user1", "userID1", false, { from: accounts[0] });
        const verification = await instance.verifyUser(accounts[1], "user1", "userID1");
        assert.equal(verification, 2, "Verification should return 2 for user");
    });

    it("should verify a sender", async () => {
        await instance.addUser(accounts[2], "sender1", "sendID1", true, { from: accounts[0] });
        const verification = await instance.verifyUser(accounts[2], "sender1", "sendID1");
        assert.equal(verification, 1, "Verification should return 1 for sender");
    });

    it("should return 0 for  wrong credentials", async () => {
        await instance.addUser(accounts[3], "sender1", "sendID1", true, { from: accounts[0] })
        const verification = await instance.verifyUser(accounts[3], "nonUser", "nonUserID");
        assert.equal(verification, 0, "Verification should return 0 for non-user and non-sender");
    });

    it("should add a document by sender", async () => {
        await instance.addUser(accounts[1], "user1", "userID1", false, { from: accounts[0] });
        await instance.addUser(accounts[2], "sender1", "sendID1", true, { from: accounts[0] });

        await instance.addDocument("doc1", "ipfsHash1", "docID1", accounts[1], { from: accounts[2] });
        const documents = await instance.getDocuments(accounts[1], { from: accounts[1] });

        assert.equal(documents[0], "doc1", "name should be doc1");
        //assert.equal(documents[1][0], "docID1", "Document ID should be docID1");
    });

    it("should not allow non-user to get documents", async () => {
        await instance.addUser(accounts[1], "user1", "userID1", false, { from: accounts[0] });
        await instance.addUser(accounts[2], "sender1", "sendID1", true, { from: accounts[0] });

        await instance.addDocument("doc1", "ipfsHash1", "docID1", accounts[1], { from: accounts[2] });

        await truffleAssert.reverts(
            instance.getDocuments(accounts[1], { from: accounts[2] }),
            "attempt to access denied"
        );
    });
    it("should get IPFS hash by document name", async () => {
        await instance.addUser(accounts[1], "user1", "userID1", false, { from: accounts[0] });
        await instance.addUser(accounts[2], "sender1", "sendID1", true, { from: accounts[0] });

        await instance.addDocument("doc1", "ipfsHash1", "docID1", accounts[1], { from: accounts[2] });

        const ipfsHash = await instance.getIPFSHashFromDocname(accounts[1], "doc1", { from: accounts[1] });
        assert.equal(ipfsHash, "ipfsHash1", "IPFS hash should match");
    });

    it("should revert when getting IPFS hash with incorrect document name", async () => {
        await instance.addUser(accounts[1], "user1", "userID1", false, { from: accounts[0] });
        await instance.addUser(accounts[2], "sender1", "sendID1", true, { from: accounts[0] });

        await instance.addDocument("doc1", "ipfsHash1", "docID1", accounts[1], { from: accounts[2] });

        await truffleAssert.reverts(
            instance.getIPFSHashFromDocname(accounts[1], "nonExistingDoc", { from: accounts[1] }),
            "Document ID not found"
        );
    });

    it("should get documents for the correct user", async () => {
        await instance.addUser(accounts[1], "user1", "userID1", false, { from: accounts[0] });
        await instance.addUser(accounts[2], "sender1", "sendID1", true, { from: accounts[0] });

        await instance.addDocument("doc1", "ipfsHash1", "docID1", accounts[1], { from: accounts[2] });
        await instance.addDocument("doc2", "ipfsHash2", "docID2", accounts[1], { from: accounts[2] });

        const documents = await instance.getDocuments(accounts[1], { from: accounts[1] });

        assert.equal(documents.length, 2, "User should have two documents");
        assert.equal(documents[0], "doc1", "First document name should be doc1");
        assert.equal(documents[1], "doc2", "Second document name should be doc2");
    });

});

