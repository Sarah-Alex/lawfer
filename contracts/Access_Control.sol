pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

contract Access_Control{
struct User{
string username;
string userID;
address useraddress;

}
// struct Sender {
//         string username;
//         string sendID;
// }
struct Document{
    string docname;
    string ipfshash;
    string docID;

}
mapping(address=>User) public receiverList;
//mapping(address => Sender) public senderList;
mapping(address => User) public senderList;
mapping(string=>User) public userFromName;

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
    return (receiverList[_add].username, receiverList[_add].userID);
}
function addUser (address _userAddress, string memory _username, string memory _userID, bool sender) public onlyOwner(){

    require((sender && bytes(senderList[_userAddress].username).length == 0) || 
        (bytes(receiverList[_userAddress].username).length == 0), 
        "sender/user already exists");

    //require(bytes(receiverList[_userAddress].username).length == 0, "User already exists");

    User memory new_user;
    new_user.username=_username;
    new_user.userID=_userID;
    new_user.useraddress=_userAddress;
    if (sender){
        senderList[_userAddress]=new_user;
    }
    else{
        userFromName[_username]=new_user;
        receiverList[_userAddress]=new_user;
    }
    
}
function deleteUser (address _userAddress, bool sender) public onlyOwner()
{
    require(sender && (bytes(senderList[_userAddress].username).length != 0)||
    (bytes(receiverList[_userAddress].username).length != 0), "user/sender does not exist"
    );
    if(sender)
    {
       delete senderList[_userAddress]; 
    }
    else{
        delete userFromName[receiverList[_userAddress].username];
        delete receiverList[_userAddress];
    }
    
}


//returns 0 for unverified, 1 for sender, 2 for user
function verifyUser(address _userAddress, string memory _username, string memory _userID) public view returns (uint8) {
    require((bytes(receiverList[_userAddress].username).length != 0)||(bytes(senderList[_userAddress].username).length != 0), "User does not exist");
    if (keccak256(abi.encodePacked(receiverList[_userAddress].username)) == keccak256(abi.encodePacked(_username)) &&
        keccak256(abi.encodePacked(receiverList[_userAddress].userID)) == keccak256(abi.encodePacked(_userID))) {
        return 2;
    }  if(keccak256(abi.encodePacked(senderList[_userAddress].username)) == keccak256(abi.encodePacked(_username)) &&
        keccak256(abi.encodePacked(senderList[_userAddress].userID)) == keccak256(abi.encodePacked(_userID))) {
        return 1;
    }
    return 0;
}
// function addSender(address _senderAddress, string memory _senderName, string memory _senderID) public onlyOwner() {
//         require(bytes(senderList[_senderAddress].username).length == 0, "Sender already exists");
//         Sender memory new_sender;
//         new_sender.username = _senderName;
//         senderList[_senderAddress] = new_sender;
//     }

//     function deleteSender(address _senderAddress) public onlyOwner() {
//         require(bytes(senderList[_senderAddress].username).length != 0, "Sender does not exist");
//         delete senderList[_senderAddress];
//     }

//     function verifySender(address _senderAddress, string memory _senderName) public view returns (bool) {
//         require(bytes(senderList[_senderAddress].username).length != 0, "Sender does not exist");
//         if (keccak256(abi.encodePacked(senderList[_senderAddress].username)) == keccak256(abi.encodePacked(_senderName))) {
//             return true;
//         } else {
//             return false;
//         }
//     }
    function addDocument(string memory _docname, string memory _ipfshash, string memory _docID, address _userAddress) public
    {
        require(bytes(senderList[msg.sender].username).length != 0, "account used is not sender");
        Document memory new_doc;
        new_doc.docname = _docname;
        new_doc.ipfshash=_ipfshash;
        new_doc.docID = _docID;
        docAccessList[_userAddress].push(new_doc);
    }
    function getDocuments(address _userAddress) public view returns (string[] memory) {
        require(msg.sender==_userAddress,"attempt to access denied");
        uint docCount = docAccessList[_userAddress].length;
        //string[] memory ipfshashes = new string[](docCount);
        string[] memory docnames = new string[](docCount);
        //string[] memory docIds = new string[](docCount);

        for (uint i = 0; i < docCount; i++) {
            Document storage doc = docAccessList[_userAddress][i];
            docnames[i] = doc.docname;
            //docIds[i] = doc.docID;
        }

        return (docnames);
    }
    function getIPFSHashFromDocname(address _userAddress, string memory _docname) public view returns (string memory) {
        require(msg.sender == _userAddress, "attempt to access denied");
        Document[] storage documents = docAccessList[_userAddress];

        for (uint i = 0; i < documents.length; i++) {
            if (keccak256(abi.encodePacked(documents[i].docname)) == keccak256(abi.encodePacked(_docname))) {
                return documents[i].ipfshash;
            }
        }
        revert("Document ID not found");
    }

    }
