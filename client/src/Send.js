import React, { useState, useEffect } from 'react';
import './App.css';
import { Buffer } from 'buffer';
import axios from 'axios';
import Access_Control from './contracts/Access_Control.json';
import Web3 from 'web3';
import CryptoJS from 'crypto-js';

const Send = () => {
  const [buffer, setBuffer] = useState(null);
  const [file, setFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [userName, setUserName] = useState('');
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState('');

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          console.log('Connected to MetaMask');
        } catch (error) {
          console.error('User denied account access');
        }
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        console.log('Connected to web3 current provider');
      } else {
        window.alert('Please use MetaMask');
      }
    };

    loadWeb3();
  }, []);

  const handleFileChange = (event) => {
    event.preventDefault();
    console.log('file captured');
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    const reader = new window.FileReader();
    reader.readAsArrayBuffer(selectedFile);
    reader.onloadend = () => {
      setBuffer(Buffer(reader.result));
    };
  };

  const handleDocNameChange = (event) => {
    setDocName(event.target.value);
  };

  const handleUserNameChange = (event) => {
    setUserName(event.target.value);
  };

  const encryptDataWithPublicKey = async (data, publicKeyBase64) => {
    const publicKeyArray = new Uint8Array(atob(publicKeyBase64).split('').map(c => c.charCodeAt(0)));

    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      publicKeyArray,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      false,
      ['encrypt']
    );

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      publicKey,
      encodedData
    );

    return new Uint8Array(encryptedData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let ipfshash;
    let userAccount;

    try {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();

      if (accounts.length > 0) {
        userAccount = accounts[0];
        console.log('User account:', userAccount);

        const networkId = await web3.eth.net.getId();
        console.log('Network ID:', networkId);
        const networkData = Access_Control.networks[networkId];

        if (networkData) {
          console.log("Network data:", networkData);
          const abi = Access_Control.abi;
          const address = networkData.address;
          const contract = new web3.eth.Contract(abi, address);
          setContract(contract);
          
          console.log('Contract:', contract);
          console.log("username:", userName);
          const user = await contract.methods.userFromNameMap(userName).call();
          setUser(user);
          console.log('user:', user);
          console.log(user.username.length===0)
          if (user.username.length === 0) {
            window.alert("Wrong username, try again");
            return;
          }

          const publickey = await contract.methods.publickey(user.useraddress).call();
          console.log("pubk:", publickey)

          // Encrypt the file with AES
          
          const aesKey= CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Base64);
          const WordArray = CryptoJS.lib.WordArray.create(buffer);
          console.log("aes key string:", aesKey);
          const encryptedFile = CryptoJS.AES.encrypt(WordArray, aesKey).toString();
          console.log("check")
          //const encryptedFile= encryptedFile0.toString();
          console.log("check")
          // Encrypt the AES key with the recipient's public key
          const encryptedAesKey = await encryptDataWithPublicKey(aesKey, publickey);

          // Pin the encrypted file to IPFS
          const formData = new FormData();
          formData.append('file', new Blob([encryptedFile], { type: 'text/plain' }));

          const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
              headers: {
                'pinata_api_key': '82b216b57072a4357af8',
                'pinata_secret_api_key': '1e5e8d76f4ab2acb6a7f4cb013c4fd1459462a89f75c1826075e96d7a06e97be',
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          console.log('File pinned:', response.data);
          console.log('File IPFS hash:', response.data.IpfsHash);
          ipfshash = response.data.IpfsHash;

          // Encrypt the IPFS hash with the recipient's public key
          const encryptedIpfsHash = await encryptDataWithPublicKey(ipfshash, publickey);

          // Create a temporary document ID
          const tempdocid = userName + docName;

          // Add the document to the blockchain
          const addDocumentResponse = await contract.methods.addDocument(
            docName,
            encryptedIpfsHash.toString(),
            tempdocid,
            user.useraddress,
            encryptedAesKey.toString()
          ).send({ from: userAccount });

          console.log("Add Document Response:", addDocumentResponse);

        } else {
          window.alert('Smart contract not deployed to detected network');
        }
      } else {
        console.log('No accounts found');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Upload File</h1>
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileChange} />
          <input
            type="text"
            placeholder="Enter doc name"
            value={docName}
            onChange={handleDocNameChange}
          />
          <input
            type="text"
            placeholder="Enter user name"
            value={userName}
            onChange={handleUserNameChange}
          />
          <button type="submit">Submit</button>
        </form>
      </header>
    </div>
  );
};

export default Send;