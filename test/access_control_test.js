const AccessControl = artifacts.require("Access_Control");

contract("Access_Control", accounts => {
    let accessControl;
    const owner = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];

    before(async () => {
        accessControl = await AccessControl.deployed();
    });

    it("should deploy with the correct owner", async () => {
        const contractOwner = await accessControl.owner();
        assert.equal(contractOwner, owner, "Owner should be the deployer");
    });

    it("should allow the owner to add a user", async () => {
        await accessControl.addUser(user1, "Alice", "ID123", { from: owner });
        const user = await accessControl.getuserList(user1, { from: owner });
        assert.equal(user[0], "Alice", "Username should be Alice");
        assert.equal(user[1], "ID123", "UserID should be ID123");
    });

    it("should not allow non-owners to add a user", async () => {
        try {
            await accessControl.addUser(user2, "Bob", "ID456", { from: user1 });
            assert.fail("Non-owner was able to add a user");
        } catch (error) {
            assert(error.message.includes("Caller is not the owner"), "Expected only owner can add user error");
        }
    });

    it("should not allow adding a user that already exists", async () => {
        try {
            await accessControl.addUser(user1, "Alice", "ID123", { from: owner });
            assert.fail("Able to add an existing user");
        } catch (error) {
            assert(error.message.includes("User already exists"), "Expected user already exists error");
        }
    });

    it("should allow the owner to delete a user", async () => {
        await accessControl.deleteUser(user1, { from: owner });
        try {
            await accessControl.getuserList(user1, { from: owner });
            assert.fail("Able to get a deleted user");
        } catch (error) {
            assert(error.message.includes(""), "Expected error when getting a deleted user");
        }
    });

    it("should not allow non-owners to delete a user", async () => {
        await accessControl.addUser(user1, "Alice", "ID123", { from: owner });
        try {
            await accessControl.deleteUser(user1, { from: user1 });
            assert.fail("Non-owner was able to delete a user");
        } catch (error) {
            assert(error.message.includes("Caller is not the owner"), "Expected only owner can delete user error");
        }
    });

    it("should not allow deleting a user that does not exist", async () => {
        try {
            await accessControl.deleteUser(user2, { from: owner });
            assert.fail("Able to delete a non-existing user");
        } catch (error) {
            assert(error.message.includes("User does not exist"), "Expected user does not exist error");
        }
    });
});
