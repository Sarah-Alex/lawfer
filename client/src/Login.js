import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useNavigate } from 'react-router-dom';
import Access_Control from './contracts/Access_Control.json';
//import crypto from 'crypto';
import CryptoJS from 'crypto-js';
//import { recoverPersonalSignature } from 'eth-sig-util';
//import { bufferToHex, recoverPublicKey, ecrecover, pubToAddress } from 'ethereumjs-util';
import './App.css';

const web3 = new Web3();
function Login() {
    const [formData, setFormData] = useState({
        username: '',
        userID: '',
        userphone:'',
        verificationCode: '',
        isCodeSent: false,
        isCodeVerified: false
    });

    const [account, setAccount] = useState('');
    const [result, setResult]=useState(null);
    const [contract, setContract] = useState('');
    const [phonehash, setPhonehash]= useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let isRequestingAccounts = false;
        // localStorage.removeItem('token');
        // localStorage.removeItem('verificationTime');
        const loadWeb3 = async () => {
            if (isRequestingAccounts) return;
            isRequestingAccounts = true;

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
            isRequestingAccounts = false;
        };

        loadWeb3();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };
    // const hashPhoneNumber = (phoneNumber) => {
    //     const hash = crypto.createHash('sha256');
    //     hash.update(phoneNumber);
    //     return hash.digest('hex');
    // };
    const hashPhoneNumber = (phoneNumber) => {
        return CryptoJS.SHA256(phoneNumber).toString(CryptoJS.enc.Hex);
    };
    const sendVerificationCode = async () => {
        try {
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();
            //const userAccount = accounts[0];
            const phoneHash = hashPhoneNumber(formData.userphone);

            
            const networkId = await web3.eth.net.getId();
            console.log('Network ID:', networkId);
            const networkData = Access_Control.networks[networkId];
            if (accounts.length > 0) {
                const userAccount = accounts[0];
                setAccount(userAccount);
                console.log('User account:', userAccount);
            if (networkData) {
                console.log("Network data:", networkData);
                const abi = Access_Control.abi;
                const address = networkData.address;
                console.log(abi)
                const contract = new web3.eth.Contract(abi, address);
                setContract(contract);
                console.log('Contract:', contract);
                console.log(userAccount, formData.username, formData.userID)
                const result = await contract.methods.verifyUser(userAccount, formData.username, formData.userID).call();
                console.log("Verification result:", result);
                setResult(result);


            
            
            let isRegistered = await contract.methods.isUserRegistered(userAccount).call();
            if (!isRegistered) {
                await contract.methods.registerPhoneNumber(web3.utils.sha3(phoneHash)).send({ from: userAccount });
                console.log("Phone number registered.");
            } else {
                console.log("Phone number already registered.");
            }
    
            const isVerified = await contract.methods.verifyPhoneNumber(web3.utils.sha3(phoneHash)).call({ from: userAccount });
            if (!isVerified) {
                console.error('Phone number verification failed.');
                return;
            }
            else{
                console.log('Phone number verified')
            }
        console.log(formData.userphone, typeof(formData.userphone));
        //const completephone = `+91${formData.userphone}`;

        //console.log(completephone, typeof(completephone))
            const response = await fetch('http://localhost:3001/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: formData.userphone })
            });
    
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }
            
            console.log('Response from server:', data);
    
            if (!response.ok) {
                console.error('Error sending verification code:', data);
                return;
            }
    
            alert('Verification code sent!');
            setFormData((prevData) => ({ ...prevData, isCodeSent: true }));
        } else  {
            window.alert('Smart contract not deployed to detected network');
        }
    }
        else {
            console.log('No accounts found');
        }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    

    const verifyCode = async () => {
        try {
            const response = await fetch('http://localhost:3001/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: formData.userphone,
                    code: formData.verificationCode
                })
            });
    
            const contentType = response.headers.get('content-type');
            let data;
    
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text(); // Handle text response
            }
    
            console.log('Raw response:', data);
    
            if (response.ok) {
                if (typeof data === 'string') {
                    // You might need to parse a JSON string here if necessary
                    // data = JSON.parse(data); 
                    // Uncomment above line if the server can sometimes return JSON as text
                }
                setFormData((prevData) => ({ ...prevData, isCodeVerified: true }));
                console.log('Code verified:', data);
                // Store token and verification time
                const token = 'dummy-jwt-token'; // Replace with actual token logic
                const verificationTime = Date.now();
                localStorage.setItem('token', token);
                localStorage.setItem('verificationTime', verificationTime);
            } else {
                console.error('Error verifying code:', data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        let userAccount=account
        e.preventDefault();
         // Check if the verification time is within 15 minutes
        const verificationTime = localStorage.getItem('verificationTime');
        if (!verificationTime || Date.now() - verificationTime > 15 * 60 * 1000) { // 15 minutes in milliseconds
            window.alert('Please verify your phone number again.');
            return;
        }
        if (!formData.isCodeVerified) {
            window.alert('Please verify your phone number first.');
            return;
        }
        try {
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();

            
                    if (result == 0) {
                        window.alert("Invalid credentials. Please try again.");
                    } 
                    else if((result==1)||(result==2)){       //if user is registered as sender or receiver
                        console.log("do i execute?")
                        const token = 'dummy-jwt-token'; // Replace with actual token logic
                        localStorage.setItem('token', token);
                        // let isRegistered = await contract.methods.isUserRegistered(userAccount).call();
                        // const phoneHash = hashPhoneNumber(formData.userphone);
                        
                        
                        // if (!isRegistered) {
                        //     await contract.methods.registerPhoneNumber(web3.utils.sha3(phoneHash)).send({ from: userAccount });
                        //     console.log("Phone number registered.");
                        // } else {
                        //     console.log("Phone number already registered.");
                        // }
                        
                        // const isVerified = await contract.methods.verifyPhoneNumber(web3.utils.sha3(phoneHash)).call({ from: userAccount });
                        // if (!isVerified) {
                        //     console.error('Phone number verification failed.');
                        //     return;
                        // }

                        if(result==1){
                            console.log("do I execute?")
                            
                            navigate('/send'); // Redirect to Send page
                        } 
                        else if(result==2){
                            
                            console.log("account", account)
                            
                        let publickey = await contract.methods.publickey(userAccount).call();
                        console.log("Retrieved public key:", publickey);
    
                        if (publickey === "") {
                        // if (true){
                            console.log("First login, requesting public key...");
                            const newPublicKey = await getPublicKey();
                            console.log("Retrieved new public key:", newPublicKey);
    
                            if (newPublicKey) {
                                const tx = await contract.methods.registerPublicKey(newPublicKey).send({ from: userAccount });
                                console.log("Transaction receipt:", tx);
                                await web3.eth.getTransactionReceipt(tx.transactionHash); // Wait for confirmation
    
                                // Verify public key after registration
                                publickey = await contract.methods.publickey(userAccount).call();
                                console.log("Updated public key:", publickey);
                                testEncryptionDecryption(publickey);
                                if (publickey !== "") {
                                    console.log("Public key registered successfully.");
                                    // Optionally, navigate or show a message here
                                } else {
                                    console.error("Public key was not registered properly.");
                                }
                            } else {
                                console.error("Failed to retrieve public key.");
                            }
                        } else {
                            console.log("Public key already registered.");
                        }
                        navigate('/receive');
                        }
                    }
                    
               
        } catch (error) {
            console.error('Error:', error);
        }
        
    };
    





const getPublicKey= async()=>{
    // Generate the key pair
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
  );

  // Export the private key
  const exportedPrivateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  // Export the public key
  const exportedPublicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);

  // Store the private key in IndexedDB
  const dbName = 'cryptoKeysDB';
  const storeName = 'privateKeys';

  const openDB = indexedDB.open(dbName, 1);

  openDB.onupgradeneeded = function() {
    const db = openDB.result;
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, { keyPath: 'id' });
    }
  };

  openDB.onsuccess = function() {
    const db = openDB.result;
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put({ id: 'userPrivateKey', key: exportedPrivateKey });
    tx.oncomplete = function() {
      db.close();
    };
  };

  openDB.onerror = function(event) {
    console.error('IndexedDB error:', event.target.errorCode);
  };

  // Convert the public key to a format suitable for storing on the blockchain (e.g., base64)
  const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPublicKey)));
  console.log('Public Key:', publicKeyBase64);
  return publicKeyBase64;
}

async function encryptData(publicKeyBase64, data) {
    // Convert Base64 public key to Uint8Array
    const publicKeyArray = new Uint8Array(atob(publicKeyBase64).split('').map(c => c.charCodeAt(0)));
    
    // Import the public key
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
  
    // Encode the data to a Uint8Array
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
  
    // Encrypt the data
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      publicKey,
      encodedData
    );
  
    return new Uint8Array(encryptedData);
  }
  
  async function decryptData(encryptedData) {
    // Retrieve the private key from IndexedDB
    const dbName = 'cryptoKeysDB';
    const storeName = 'privateKeys';
    let privateKey;
  
    const openDB = indexedDB.open(dbName, 1);
  
    privateKey = new Promise((resolve, reject) => {
      openDB.onsuccess = function() {
        const db = openDB.result;
        const tx = db.transaction(storeName);
        const store = tx.objectStore(storeName);
        const getRequest = store.get('userPrivateKey');
  
        getRequest.onsuccess = function() {
          const privateKeyArray = getRequest.result.key;
          resolve(new Uint8Array(privateKeyArray));
        };
  
        getRequest.onerror = function() {
          reject(new Error('Failed to retrieve private key'));
        };
      };
  
      openDB.onerror = function(event) {
        reject(new Error('IndexedDB error: ' + event.target.errorCode));
      };
    });
  
    // Import the private key
    privateKey = await privateKey;
    const privateKeyObj = await window.crypto.subtle.importKey(
      'pkcs8',
      privateKey,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      false,
      ['decrypt']
    );
  
    // Decrypt the data
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP'
      },
      privateKeyObj,
      encryptedData
    );
  
    // Decode the data
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  }
  
  // Example usage
  async function testEncryptionDecryption(_publicKeyBase64) {
    const publicKeyBase64 = _publicKeyBase64; // Retrieve or generate the public key
    const data = 'Hello, World!';
  
    // Encrypt data
    const encryptedData = await encryptData(publicKeyBase64, data);
    console.log('Encrypted Data:', encryptedData);
  
    // Decrypt data
    const decryptedData = await decryptData(encryptedData);
    console.log('Decrypted Data:', decryptedData);
  }
  
  
  



    return (
        <div className="Login">
            <header className="App-header">
                <h1 className="Login-header">User Login</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="userID"
                        placeholder="User ID"
                        value={formData.userID}
                        onChange={handleChange}
                    />
                   <input
                        type="tel"
                        name="userphone"
                        placeholder="Phone no."
                        pattern="\+?[0-9\s\-]{7,15}"

                        value={formData.userphone}
                        onChange={handleChange}
                    />
                     {formData.isCodeSent ? (
                        <>
                            <input
                                type="text"
                                name="verificationCode"
                                placeholder="Verification Code"
                                value={formData.verificationCode}
                                onChange={handleChange}
                            />
                            <button type="button" onClick={verifyCode}>Verify Code</button>
                        </>
                    ) : (
                        <button type="button" onClick={sendVerificationCode}>Send Verification Code</button>
                    )} 
                    <button type="submit">Submit</button>
                </form>
            </header>
        </div>
    );
}

export default Login;
