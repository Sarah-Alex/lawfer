import React, { useState, useEffect } from 'react';
import './App.css';
import Access_Control from './contracts/Access_Control.json';
import Web3 from 'web3';

const Receive = () => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [documentOptions, setDocumentOptions] = useState([]);

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
                    console.log("result:",result);
                    const docNum = await contract.methods.getDocCount(userAccount).call();
                    console.log("num of docs:", docNum);
                    const docs = await contract.methods.getDocuments(userAccount).send({from:account});
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
        //await loadBlockchainData();
    };

    useEffect(() => {
        init().catch(error => console.error('Error:', error));
    }, []); // Empty dependency array ensures this runs once on mount

    return (
        <div className="App">
            <header className="App-header">
                <h1>Download File</h1>
                <button onClick={loadBlockchainData}>Load Documents</button>
                {documentOptions.length > 0 ? (
                    <ul>
                        {documentOptions.map((doc, index) => (
                            <li key={index}>{doc}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No documents found</p>
                )}
            </header>
        </div>
    );
}

export default Receive;
