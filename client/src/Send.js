import React, { useState, useEffect } from 'react';
import './App.css';
import { Buffer } from 'buffer';
import axios from 'axios';
import Access_Control from './contracts/Access_Control.json';
import Web3 from 'web3';


// import { createHelia } from 'helia';
// import { unixfs } from '@helia/unixfs';

// create a Helia node
// const helia = await createHelia();
// create a filesystem on top of Helia, in this case it's UnixFS
// const fs = unixfs(helia);

const Send = () => {
  const [buffer, setBuffer] = useState(null);
  const [file, setFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [userName, setUserName] = useState('');
  //const [ipf, setUserName] = useState('');
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
  const handleSubmit = async (event) => {
    event.preventDefault();
    let ipfshash;
    let userAccount
    if (buffer && file) {
      console.log('File to be uploaded:', buffer);
      try {
        const formData = new FormData();
        formData.append('file', file);

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
        console.log('File ipfshash', response.data.IpfsHash );
        ipfshash=response.data.IpfsHash;
      } catch (err) {
        console.error('Error pinning file:', err);
      }
    } else {
      console.log('No file selected.');
    }



    try {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();

      if (accounts.length > 0) {
          userAccount = accounts[0];
          //setAccount(userAccount);
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
              const user = await contract.methods.userFromName(userName).call();
              console.log('user:',user)
              if(user.username.length===0){
                window.alert("wrong username, try again")
              }
              else{
                let tempdocid=userName+docName;
                //console.log("account address", account)
                const response= await contract.methods.addDocument(docName,ipfshash,tempdocid,user.useraddress).send({from:userAccount});
                console.log("response:",response);
               }
          }else {
        window.alert('Smart contract not deployed to detected network');
           }
   }else {
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
