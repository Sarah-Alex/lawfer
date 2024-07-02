import React, { Component } from 'react';
import './App.css';
import { Buffer } from 'buffer';
import { create } from 'ipfs-http-client';
import Access_Control from './contracts/Access_Control.json'

const ipfs = create({ url: '/ip4/127.0.0.1/tcp/5001' });

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buffer: null,
      //file: null
    };
  }

  handleFileChange = (event) => {
    event.preventDefault();
    //this.setState({ file: event.target.files[0] });
    console.log('file captured');
    // process file for ipfs
    const file=event.target.files[0]
    const reader =new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = ()=>{
      this.setState({buffer: Buffer(reader.result)})
      //console.log('buffer', Buffer(reader.result))
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    //const { file } = this.state;
    if (this.state.buffer) {
      console.log('File to be uploaded:', this.state.buffer);
      // Handle the file upload process here
      // You can use libraries like axios or fetch to send the file to a server
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
