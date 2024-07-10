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
function getuserList(address _add) public view onlyOwner returns(string memory, string memory){
    return (userList[_add].username, userList[_add].userID);
}
function addUser (address _userAddress, string memory _username, string memory _userID) public onlyOwner(){
    require(bytes(userList[_userAddress].username).length == 0, "User already exists");
    user memory new_user;
    new_user.username=_username;
    new_user.userID=_userID;
    userList[_userAddress]=new_user;
}
function deleteUser (address _userAddress) public onlyOwner()
{
    require(bytes(userList[_userAddress].username).length != 0, "User does not exist");
    delete userList[_userAddress];
}
function verifyUser(address _userAddress, string memory _username, string memory _userID) public view returns (bool) {
    require(bytes(userList[_userAddress].username).length != 0, "User does not exist");
    if (keccak256(abi.encodePacked(userList[_userAddress].username)) == keccak256(abi.encodePacked(_username)) &&
        keccak256(abi.encodePacked(userList[_userAddress].userID)) == keccak256(abi.encodePacked(_userID))) {
        return true;
    } else {
        return false;
    }
}

}