import React, { Component } from 'react';
import './App.css';
import { Buffer } from 'buffer';
import Access_Control from './contracts/Access_Control.json'
import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'

// create a Helia node
const helia = await createHelia();

// create a filesystem on top of Helia, in this case it's UnixFS
const fs = unixfs(helia);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buffer: null,
      cid: '',
      retrievedFile: null
    };
  }

  handleFileChange = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
    };
  };

  handleCIDChange = (event) => {
    this.setState({ cid: event.target.value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    if (this.state.buffer) {
      const cid = await fs.addBytes(this.state.buffer);
      console.log('Added file:', cid.toString());
    } else {
      console.log('No file selected.');
    }
  };

  retrieveFile = async () => {
    const { cid } = this.state;
    let chunks = [];

    for await (const chunk of fs.cat(cid)) {
      chunks.push(chunk);
    }

    const fileBuffer = Buffer.concat(chunks);
    this.setState({ retrievedFile: fileBuffer });
    console.log('Retrieved file:', fileBuffer);

    // Open the PDF file in a new tab
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Upload and Retrieve PDF</h1>
          <form onSubmit={this.handleSubmit}>
            <input type="file" accept=".pdf" onChange={this.handleFileChange} />
            <button type="submit">Upload</button>
          </form>
          <input type="text" placeholder="Enter CID" value={this.state.cid} onChange={this.handleCIDChange} />
          <button onClick={this.retrieveFile}>Retrieve PDF</button>
        </header>
      </div>
    );
  }
}

export default App;
