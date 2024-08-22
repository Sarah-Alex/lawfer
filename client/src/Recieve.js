import React, { useState, useEffect } from 'react';
import './App.css';
import Access_Control from './contracts/Access_Control.json';
import Web3 from 'web3';
//import { saveAs } from 'file-saver';
import CryptoJS from 'crypto-js';

const Receive = () => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [documentOptions, setDocumentOptions] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState('');

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

    const loadBlockchainData = async () => {
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();

        if (accounts.length > 0) {
            const userAccount = accounts[0];
            setAccount(userAccount);
            console.log('User account:', userAccount);

            const networkId = await web3.eth.net.getId();
            console.log('Network ID:', networkId);
            const networkData = Access_Control.networks[networkId];

            if (networkData) {
                console.log("Network data:", networkData);
                const abi = Access_Control.abi;
                const address = networkData.address;
                console.log('Contract ABI:', abi);
                console.log('Contract Address:', address);

                const contractInstance = new web3.eth.Contract(abi, address);
                setContract(contractInstance);
                console.log('Contract:', contractInstance);

                try {
                    console.log("about to try");
                    const result = await contract.methods.verifyUser(userAccount, "username0", "userID0").call();
                    console.log("result:", result);
                    const docNum = await contract.methods.getDocCount(userAccount).call();
                    console.log("num of docs:", docNum);
                    const receipt = await contract.methods.getDocuments(userAccount).send({ from: account });
                    console.log("receipt:", receipt);
                    const docs = receipt.events.DocumentsListed.returnValues.docnames;
                    setDocumentOptions(docs);
                    console.log('Document options:', docs);

                } catch (error) {
                    console.error('Error fetching documents:', error);
                }
            } else {
                console.error('Smart contract not deployed to detected network');
            }
        } else {
            console.log('No accounts found');
        }
    };

    const init = async () => {
        await loadWeb3();
    };

    useEffect(() => {
        init().catch(error => console.error('Error:', error));
    }, []); // Empty dependency array ensures this runs once on mount

    const handleDocumentChange = (event) => {
        setSelectedDocument(event.target.value);
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        console.log('Selected document:', selectedDocument);
    
        try {
            const receipt = await contract.methods.getDocumentFromDocname(account, selectedDocument).send({ from: account });
            console.log("getDocumentFromDocname receipt:", receipt);
    
            const ipfsHashEncrypted = receipt.events.DocumentAccessed.returnValues.document.ipfshash.split(',');
            const symmKeyEncrypted = receipt.events.DocumentAccessed.returnValues.document.symmkey.split(',');
    
            console.log("Encrypted IPFS Hash:", ipfsHashEncrypted);
            console.log("Encrypted Symmetric Key:", symmKeyEncrypted);
    
            if (!ipfsHashEncrypted || !symmKeyEncrypted) {
                throw new Error('Encrypted data is missing or invalid');
            }
    
            const decryptedIpfsHashArray = await decryptData(ipfsHashEncrypted);
            
            const decryptedSymmetricKeyArray = await decryptData(symmKeyEncrypted);
    
            const decryptedIpfsHash = new TextDecoder().decode(decryptedIpfsHashArray);
            const decryptedSymmetricKey = new TextDecoder().decode(decryptedSymmetricKeyArray);
    
            console.log("Decrypted IPFS Hash:", decryptedIpfsHash);
            console.log("Decrypted Symmetric Key:", decryptedSymmetricKey);
    
            await downloadAndDecryptFileFromIPFS(decryptedIpfsHash, decryptedSymmetricKey);
        } catch (error) {
            console.error('Error:', error);
        }
    };
    
    const decryptData = async (encryptedData) => {
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
        });
    
        const importedPrivateKey = await window.crypto.subtle.importKey(
            'pkcs8',
            await privateKey,
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256'
            },
            false,
            ['decrypt']
        );
    
        const encryptedDataArray = typeof encryptedData === 'string' ? new Uint8Array(encryptedData.split('').map(c => c.charCodeAt(0))) : new Uint8Array(encryptedData);
    
        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: 'RSA-OAEP'
            },
            importedPrivateKey,
            encryptedDataArray
        );
    
        return new Uint8Array(decryptedData);
    };
    function convertWordArrayToUint8Array(wordArray) {
        var arrayOfWords = wordArray.hasOwnProperty("words") ? wordArray.words : [];
        var length = wordArray.hasOwnProperty("sigBytes") ? wordArray.sigBytes : arrayOfWords.length * 4;
        var uInt8Array = new Uint8Array(length), index=0, word, i;
        for (i=0; i<length; i++) {
            word = arrayOfWords[i];
            uInt8Array[index++] = word >> 24;
            uInt8Array[index++] = (word >> 16) & 0xff;
            uInt8Array[index++] = (word >> 8) & 0xff;
            uInt8Array[index++] = word & 0xff;
        }
        return uInt8Array;
    }
    const downloadAndDecryptFileFromIPFS = async (hash, aesKey) => {
        const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const encryptedFile = await response.text();
            console.log("Encrypted File Data:", encryptedFile);
            console.log("the type:",typeof(encryptedFile));
            console.log("the type of the aes key:", typeof(aesKey));
            console.log("aeskey:", aesKey);
           // const aesKeyBytes = CryptoJS.enc.Base64.parse(aesKeyBase64);


            // Convert the aesKey string to a WordArray object
            const keyWordArray = CryptoJS.enc.Base64.parse(aesKey);
            console.log("check point 1");

            // Decrypt the encryptedFile
            const decrypted = CryptoJS.AES.decrypt(encryptedFile, aesKey);
            console.log("check point 2");
            const typedArray = convertWordArrayToUint8Array(decrypted);
            var fileDec = new Blob([typedArray]);                                   // Create blob from typed array

        var a = document.createElement("a");
        var urll = window.URL.createObjectURL(fileDec);
        //var filename = file.name.substr(0, file.name.length - 4) + ".dec";
        a.href = urll;
        a.download = selectedDocument + '.pdf';;
        a.click();
        window.URL.revokeObjectURL(urll);


        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };
    return (
        <div className="App">
            <header className="App-header">
                <h1>Download File</h1>
                <button onClick={loadBlockchainData}>Load Documents</button>
                {documentOptions.length > 0 ? (
                    <form onSubmit={handleSubmit}>
                        {documentOptions.map((doc, index) => (
                            <div key={index}>
                                <input 
                                    type="radio" 
                                    id={`doc-${index}`} 
                                    name="document" 
                                    value={doc} 
                                    checked={selectedDocument === doc} 
                                    onChange={handleDocumentChange} 
                                />
                                <label htmlFor={`doc-${index}`}>{doc}</label>
                            </div>
                        ))}
                        <button type="submit">Submit</button>
                    </form>
                ) : (
                    <p>No documents found</p>
                )}
            </header>
        </div>
    );
}

export default Receive;
