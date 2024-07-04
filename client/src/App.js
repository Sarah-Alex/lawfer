import React, { Component } from 'react';
import './App.css';
import { Buffer } from 'buffer';
import axios from 'axios';
import Access_Control from './contracts/Access_Control.json'
// import { createHelia } from 'helia'
// import { unixfs } from '@helia/unixfs'


// create a Helia node
//const helia = await createHelia();
// create a filesystem on top of Helia, in this case it's UnixFS
//const fs = unixfs(helia);

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
    //this.setState({ file: event.target.files[0] });
    console.log('file captured');
    // process file for ipfs
    const file=event.target.files[0]
    this.setState({file: file});
    const reader =new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = ()=>{
      this.setState({buffer: Buffer(reader.result)});
      
      //console.log('buffer', Buffer(reader.result))
    }
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { buffer, file } = this.state;
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
              'pinata_api_key': 'ur aa',
              'pinata_secret_api_key': 'rrii',
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
