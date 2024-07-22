import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useNavigate } from 'react-router-dom';
import Access_Control from './contracts/Access_Control.json';

import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';
import './App.css';

function Login() {
    const [formData, setFormData] = useState({
        username: '',
        userID: '',
        userphone:''
    });

    const [account, setAccount] = useState('');
    const [contract, setContract] = useState('');
    const navigate = useNavigate();

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        console.log(formData.userphone)
        try {
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
                    console.log(abi)
                    const contract = new web3.eth.Contract(abi, address);
                    setContract(contract);
                    console.log('Contract:', contract);
                    console.log(userAccount, formData.username, formData.userID)
                    const result = await contract.methods.verifyUser(userAccount, formData.username, formData.userID).call();
                    console.log("Verification result:", result);

                    if (result == 0) {
                        window.alert("Invalid credentials. Please try again.");
                    } else if(result==1){

                        const token = 'dummy-jwt-token'; // Replace with actual token logic
                        localStorage.setItem('token', token);
                        navigate('/send'); // Redirect to Send page
                    } else if(result==2){
                        const token = 'dummy-jwt-token'; // Replace with actual token logic
                        localStorage.setItem('token', token);
                        const pubkey = await contract.methods.publickey(account).call();
                        if(pubkey==''){
                            console.log("first login");
                        }
                        navigate('/receive');
                        //window.alert("you are a reciever, page not built yet....")
                    }
                } else  {
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
                        pattern="[0-9]{10}"
                        value={formData.userphone}
                        onChange={handleChange}
                    />
                    <button type="submit">Submit</button>
                </form>
            </header>
        </div>
    );
}

export default Login;
