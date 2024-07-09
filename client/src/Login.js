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
    
  const [formData, setFormData] = useState({
    username: '',
    userId: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // verify if valid user

    
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
