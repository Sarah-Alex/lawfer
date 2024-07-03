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

  handleSubmit = async (event) => {
    event.preventDefault();
    //const { file } = this.state;
    if (this.state.buffer) {
      console.log('File to be uploaded:', this.state.buffer);
      
      // Handle the file upload process here
      // You can use libraries like axios or fetch to send the file to a server
    } else {
      console.log('No file selected.');
    }
    // ipfs.add(this.state.buffer,(error,result)=>{
    //   console.log("result:",result);
    //   if(error){
    //     console.error(error);
    //     return;
    //   }
    // })
    // try {
    //   const created = await client.add(this.state.buffer);
    //   const url = `https://ipfs.infura.io/ipfs/${created.path}`;
    //   setUrlArr(prev => [...prev, url]);
    //   console.log("ipfs rezz:",created)
    // } catch (error) {
    //   console.log(error.message);
    // }
    
    const cid = await fs.addBytes(this.state.buffer);
    console.log('Added file:', cid.toString());
    

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
