import React, { useState } from 'react';
import './App.css';
import { Buffer } from 'buffer';
import axios from 'axios';
import Access_Control from './contracts/Access_Control.json';
import Web3 from {web3};

// import { createHelia } from 'helia';
// import { unixfs } from '@helia/unixfs';

// create a Helia node
// const helia = await createHelia();
// create a filesystem on top of Helia, in this case it's UnixFS
// const fs = unixfs(helia);

const App = () => {
  const [buffer, setBuffer] = useState(null);
  const [file, setFile] = useState(null);

  
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

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      } catch (err) {
        console.error('Error pinning file:', err);
      }
    } else {
      console.log('No file selected.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Upload File</h1>
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileChange} />
          <button type="submit">Submit</button>
        </form>
      </header>
    </div>
  );
};

export default App;
