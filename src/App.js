import React, { Component } from 'react';
import mqtt from 'mqtt';
import logo from './logo.svg';
import './App.css';

const client = mqtt.connect('ws://192.168.0.135', {
  port: 3023,
  clientId: 'image-requester',
});

class App extends Component {
  state = {
    imageUrl: '',
  }
  componentDidMount() {
    client.on('connect', () => {
      client.subscribe('mqtt/picture-taken');
    })
    client.on('message', (topic, message, packet) => {
      console.log(`[${topic}]`);
      const arrayBufferView = new Uint8Array(message);
      const blob = new Blob([arrayBufferView], { type: "image/jpeg" });
      const urlCreator = window.URL || window.webkitURL;
      this.setState({
        imageUrl: urlCreator.createObjectURL(blob)
      })
    });
  }
  
  handleRequestPicture = () => {
    console.log('PUBLISH', 'mqtt/camera');
    client.publish('mqtt/camera', 'Give me picture pls');
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">MQTT Client Subscriber</h1>
        </header>
        <p className="App-intro">
          To get request a picture, click the following button: <button onClick={this.handleRequestPicture}>Request picture</button>
        </p>
        <img src={this.state.imageUrl} />
      </div>
    );
  }
}

export default App;
