import React, { useState, useEffect } from 'react';
import './App.css';
import Access_Control from './contracts/Access_Control.json';
import Web3 from 'web3';
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

    const decryptData = async (encryptedData) => {
        const dbName = 'cryptoKeysDB';
        const storeName = 'privateKeys';

        const openDB = indexedDB.open(dbName, 1);

        const privateKey = await new Promise((resolve, reject) => {
            openDB.onsuccess = function () {
                const db = openDB.result;
                const tx = db.transaction(storeName);
                const store = tx.objectStore(storeName);
                const getRequest = store.get('userPrivateKey');

                getRequest.onsuccess = function () {
                    const privateKeyArray = getRequest.result.key;
                    resolve(new Uint8Array(privateKeyArray));
                };

                getRequest.onerror = function () {
                    reject(new Error('Failed to retrieve private key'));
                };
            };
        });

        const importedPrivateKey = await window.crypto.subtle.importKey(
            'pkcs8',
            privateKey.buffer,
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256'
            },
            false,
            ['decrypt']
        );

        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: 'RSA-OAEP'
            },
            importedPrivateKey,
            encryptedData
        );

        return new TextDecoder().decode(decryptedData);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log('Selected document:', selectedDocument);
        const receipt = await contract.methods.getDocumentFromDocname(account, selectedDocument).send({ from: account });
        console.log("getDocument receipt:", receipt);
        console.log("check:", receipt.events.DocumentAccessed)
        const document = receipt.events.DocumentAccessed.returnValues.document;
        // console.log("document:", document)
        // console.log("document.ipfshash", document.ipfshash)
        // const encryptedHash = new Uint8Array(document.ipfshash);
        // console.log("enc hash:", encryptedHash)
        // const encryptedKey = new Uint8Array(document.symmkey);

        const encryptedHashArray = document.ipfshash.split(',').map(Number);
        const encryptedKeyArray = document.symmkey.split(',').map(Number);

        const encryptedHash = new Uint8Array(encryptedHashArray);
        const encryptedKey = new Uint8Array(encryptedKeyArray);

        const ipfsHash = await decryptData(encryptedHash);
        const symmKey = await decryptData(encryptedKey);
        console.log("Decrypted IPFS Hash:", ipfsHash);
        console.log("Decrypted Symmetric Key:", symmKey);

        downloadAndDecryptFileFromIPFS(ipfsHash, symmKey);
    };

    const downloadAndDecryptFileFromIPFS = async (hash, key) => {
        const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const encryptedFile = await response.text();
            const decryptedFile = CryptoJS.AES.decrypt(encryptedFile, key).toString(CryptoJS.enc.Utf8);
            const blob = new Blob([decryptedFile], { type: 'application/octet-stream' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = selectedDocument; // Use document name as the download filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
