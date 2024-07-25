import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useNavigate } from 'react-router-dom';
import Access_Control from './contracts/Access_Control.json';
import './App.css';

function Login() {
    const [formData, setFormData] = useState({
        username: '',
        userID: '',
        userphone: '',
        verificationCode: '',
        isCodeSent: false,
        isCodeVerified: false
    });

    const [account, setAccount] = useState('');
    const [contract, setContract] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let isRequestingAccounts = false;

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

    const sendVerificationCode = async () => {
        try {
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
            } else {
                console.error('Error verifying code:', data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.isCodeVerified) {
            window.alert('Please verify your phone number first.');
            return;
        }

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
                    const contract = new web3.eth.Contract(abi, address);
                    setContract(contract);
                    console.log('Contract:', contract);
                    console.log(userAccount, formData.username, formData.userID);
                    const result = await contract.methods.verifyUser(userAccount, formData.username, formData.userID).call();
                    console.log("Verification result:", result);

                    if (result == 0) {
                        window.alert("Invalid credentials. Please try again.");
                    } else if (result == 1) {
                        const token = 'dummy-jwt-token'; // Replace with actual token logic
                        localStorage.setItem('token', token);
                        navigate('/send'); // Redirect to Send page
                    } else if (result == 2) {
                        const token = 'dummy-jwt-token'; // Replace with actual token logic
                        localStorage.setItem('token', token);
                        navigate('/receive');
                        window.alert("You are a receiver, page not built yet....");
                    }
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


