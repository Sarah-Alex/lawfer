pragma solidity ^0.5.16;

contract Access_Control{
struct user{
string username;
string userID;
}
address public owner;
constructor() public{
    owner=msg.sender;
}



modifier onlyOwner() {
    require(msg.sender == owner, "Caller is not the owner");
    _;
}
mapping(address=>user) userList;
function getuserList(address add) public view onlyOwner returns(string memory, string memory){
    return (userList[add].username, userList[add].userID);
}
function addUser(address userAddress, string memory username, string memory userID) public onlyOwner(){
    require(bytes(userList[userAddress].username).length == 0, "User already exists");
    user memory new_user;
    new_user.username=username;
    new_user.userID=userID;
    userList[userAddress]=new_user;
}
function deleteUser(address userAddress) public onlyOwner()
{
    require(bytes(userList[userAddress].username).length != 0, "User does not exist");
    delete userList[userAddress];
}

}