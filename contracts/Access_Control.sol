pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

contract Access_Control {
    struct User {
        string username;
        string userID;
        address useraddress;
    }

    struct Document {
        string docname;
        string ipfshash;
        string docID;
        string symmkey;
    }
    
    mapping(address => User) public receiverList;
    mapping(address => User) public senderList;
    mapping(string => User) public userFromNameMap;
    mapping(address=> string) public publickey;
    mapping(address => Document[]) public docAccessList;
    mapping(address => bytes32) public userPhoneHashes;
    mapping(address => bool) public isUserRegistered;
    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    event UserAdded(address userAddress, string username, string userID, bool sender);
    event UserDeleted(address userAddress, bool sender);
    event DocumentAdded(address sender, address userAddress, string docname, string ipfshash, string docID);
    event DocumentAccessed(address userAddress, Document document);
    //event DocumentAccessedHash(address userAddress, string dochash);
    event DocumentsListed(address userAdress, string[] docnames);
    event AccessDenied(address sender, address userAddress, string message);

    function registerPublicKey(string memory _publicKey) public {
        publickey[msg.sender] = _publicKey;
    }

    function getuserList(address _add) public view onlyOwner returns (string memory, string memory) {
        return (receiverList[_add].username, receiverList[_add].userID);
    }

    function registerPhoneNumber(bytes32 phoneHash) public {
        require(!isUserRegistered[msg.sender], "User already registered");
        userPhoneHashes[msg.sender] = phoneHash;
        isUserRegistered[msg.sender] = true;
    }

    function verifyPhoneNumber(bytes32 phoneHash) public view returns (bool) {
        return userPhoneHashes[msg.sender] == phoneHash;
    }

    function addUser(address _userAddress, string memory _username, string memory _userID, bool sender) public onlyOwner {
        require((sender && bytes(senderList[_userAddress].username).length == 0) ||
            (bytes(receiverList[_userAddress].username).length == 0),
            "sender/user already exists");

        User memory new_user;
        new_user.username = _username;
        new_user.userID = _userID;
        new_user.useraddress = _userAddress;

        if (sender) {
            senderList[_userAddress] = new_user;
        } else {
            userFromNameMap[_username] = new_user;
            receiverList[_userAddress] = new_user;
        }
        
        emit UserAdded(_userAddress, _username, _userID, sender);
    }

    function deleteUser(address _userAddress, bool sender) public onlyOwner {
        require((sender && bytes(senderList[_userAddress].username).length != 0) ||
            (bytes(receiverList[_userAddress].username).length != 0), "user/sender does not exist");

        if (sender) {
            delete senderList[_userAddress];
        } else {
            delete userFromNameMap[receiverList[_userAddress].username];
            delete receiverList[_userAddress];
        }
        
        emit UserDeleted(_userAddress, sender);
    }

    function verifyUser(address _userAddress, string memory _username, string memory _userID) public view returns (uint8) {
        require((bytes(receiverList[_userAddress].username).length != 0) || (bytes(senderList[_userAddress].username).length != 0), "User does not exist");

        if (keccak256(abi.encodePacked(receiverList[_userAddress].username)) == keccak256(abi.encodePacked(_username)) &&
            keccak256(abi.encodePacked(receiverList[_userAddress].userID)) == keccak256(abi.encodePacked(_userID))) {
            return 2;
        } 
        if (keccak256(abi.encodePacked(senderList[_userAddress].username)) == keccak256(abi.encodePacked(_username)) &&
            keccak256(abi.encodePacked(senderList[_userAddress].userID)) == keccak256(abi.encodePacked(_userID))) {
            return 1;
        }

        return 0;
    }

    function addDocument(string memory _docname, string memory _ipfshash, string memory _docID, address _userAddress, string memory _symmkey) public {
        require(bytes(senderList[msg.sender].username).length != 0, "account used is not sender");

        Document memory new_doc;
        new_doc.docname = _docname;
        new_doc.ipfshash = _ipfshash;
        new_doc.docID = _docID;
        new_doc.symmkey=_symmkey;

        docAccessList[_userAddress].push(new_doc);

        emit DocumentAdded(msg.sender, _userAddress, _docname, _ipfshash, _docID);
    }

    function getDocCount(address _userAddress) public view returns (uint) {
        return docAccessList[_userAddress].length;
    }

    function getDocuments(address _userAddress) public returns (string[] memory) {
        if (msg.sender != _userAddress) {
            emit AccessDenied(msg.sender, _userAddress, "attempt to access denied");
            revert("attempt to access denied");
        }

        uint docCount = docAccessList[_userAddress].length;
        string[] memory docnames = new string[](docCount);

        for (uint i = 0; i < docCount; i++) {
            Document storage doc = docAccessList[_userAddress][i];
            docnames[i] = doc.docname;
        }

        //emit DocumentAccessed(_userAddress, "all documents");
        emit DocumentsListed(_userAddress, docnames);

        return docnames;
    }

    function getDocumentFromDocname(address _userAddress, string memory _docname) public returns (Document memory) {
        require(msg.sender == _userAddress, "attempt to access denied");
        

        Document[] storage documents = docAccessList[_userAddress];

        for (uint i = 0; i < documents.length; i++) {
            if (keccak256(abi.encodePacked(documents[i].docname)) == keccak256(abi.encodePacked(_docname))) {
                emit DocumentAccessed(_userAddress, documents[i]);
                //emit DocumentAccessedHash(_userAddress, documents[i].ipfshash);
                return documents[i];
            }
        }

        revert("Document ID not found");
    }
}
