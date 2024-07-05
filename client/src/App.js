import React, { Component } from 'react';
import './App.css';
import { Buffer } from 'buffer';
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buffer: null,
      file: null
    };
  }

  handleFileChange = (event) => {
    event.preventDefault();
    console.log('file captured');
    const file = event.target.files[0];
    this.setState({ file: file });
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
    }
  };

  generateKey = async () => {
    return crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  };

  encryptFile = async (fileBuffer, key) => {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      fileBuffer
    );

    return { iv, encryptedData };
  };

  bufferToHex = (buffer) => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { buffer, file } = this.state;
    if (buffer && file) {
      console.log('File to be uploaded:', buffer);

      try {
        const key = await this.generateKey();
        const { iv, encryptedData } = await this.encryptFile(buffer, key);

        console.log('Encrypted Data:', this.bufferToHex(encryptedData));

        // Create a new Blob with the encrypted data
        const encryptedBlob = new Blob([iv, encryptedData], { type: 'application/octet-stream' });

        // Prepare the form data
        const formData = new FormData();
        formData.append('file', encryptedBlob, file.name + '.encrypted');

        const response = await axios.post(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          formData,
          {
            headers: {
              'pinata_api_key': '',
              'pinata_secret_api_key': '',
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

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Upload File</h1>
          <form onSubmit={this.handleSubmit}>
            <input type="file" onChange={this.handleFileChange} />
            <button type="submit">Submit</button>
          </form>
        </header>
      </div>
    );
  }
}

export default App;
