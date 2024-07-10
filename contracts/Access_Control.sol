pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

contract Access_Control{
struct User{
string username;
string userID;
}
struct Sender {
        string sendername;
        string sendID;
}
struct Document{
    string ipfshash;
    string docId;

}
mapping(address=>User) public userList;
mapping(address => Sender) public senderList;
mapping(address=>Document[]) public docAccessList;
address public owner;
constructor() public{
    owner=msg.sender;
}

modifier onlyOwner() {
    require(msg.sender == owner, "Caller is not the owner");
    _;
}

function getuserList(address _add) public view onlyOwner returns(string memory, string memory){
    return (userList[_add].username, userList[_add].userID);
}
function addUser (address _userAddress, string memory _username, string memory _userID) public onlyOwner(){
    require(bytes(userList[_userAddress].username).length == 0, "User already exists");
    User memory new_user;
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
function addSender(address _senderAddress, string memory _senderName) public onlyOwner() {
        require(bytes(senderList[_senderAddress].sendername).length == 0, "Sender already exists");
        Sender memory new_sender;
        new_sender.sendername = _senderName;
        senderList[_senderAddress] = new_sender;
    }

    function deleteSender(address _senderAddress) public onlyOwner() {
        require(bytes(senderList[_senderAddress].sendername).length != 0, "Sender does not exist");
        delete senderList[_senderAddress];
    }

    function verifySender(address _senderAddress, string memory _senderName) public view returns (bool) {
        require(bytes(senderList[_senderAddress].sendername).length != 0, "Sender does not exist");
        if (keccak256(abi.encodePacked(senderList[_senderAddress].sendername)) == keccak256(abi.encodePacked(_senderName))) {
            return true;
        } else {
            return false;
        }
    }
    function addDocument(string memory _ipfshash, string memory _docID, address _userAddress) public
    {
        require(bytes(senderList[msg.sender].sendername).length != 0, "account used is not sender");
        Document memory new_doc;
        new_doc.ipfshash=_ipfshash;
        new_doc.docId = _docID;
        docAccessList[_userAddress].push(new_doc);
    }
    function getDocuments(address _userAddress) public view returns (string[] memory, string[] memory) {
        require(msg.sender==_userAddress,"attempt to access denied");
        uint docCount = docAccessList[_userAddress].length;
        string[] memory ipfshashes = new string[](docCount);
        string[] memory docIds = new string[](docCount);

        for (uint i = 0; i < docCount; i++) {
            Document storage doc = docAccessList[_userAddress][i];
            ipfshashes[i] = doc.ipfshash;
            docIds[i] = doc.docId;
        }

        return (ipfshashes, docIds);
    }

    }
