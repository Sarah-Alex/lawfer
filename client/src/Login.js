import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';
import Access_Control from './contracts/Access_Control.json';
// async componentWillMount(){
//     await this.loadWeb3()
// }

// async loadWeb3(){
//     if (window.ethereum){
//         window.web3= new Web3(window.ethereum)
//         await window.ethereum.enable()
//     } if (window.web3){
//         window.web3=new Web3(window.web3.currentProvider)
//     } else{
//         window.alert('Please use metamask')
//     }
// }
function Login() {
    const [formData, setFormData] = useState({
        username: '',
        userId: '',
      });

    const [account, setAccount] = useState('');


    useEffect(() => {
        const loadWeb3 = async () => {
          if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            try {
              await window.ethereum.enable();
              console.log('hi meta');
            } catch (error) {
              console.error('User denied account access');
            }
          } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
            console.log('hi current meta');
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
    // verify if valid user:
    try {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        const userAccount = accounts[0]; 
        setAccount(userAccount);
        console.log('User account:', userAccount);
      } else {
        console.log('No accounts found');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  

  };

  return (
    <div className="Login">
      <header className="App-header">
        <h1 className="Login header">User Login</h1>
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
            name="userId"
            placeholder="User ID"
            value={formData.userId}
            onChange={handleChange}
          />
          <button type="submit">Submit</button>
        </form>
      </header>
    </div>
  );
}

export default Login;
