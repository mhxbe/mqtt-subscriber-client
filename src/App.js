import React, { Component } from 'react';
import mqtt from 'mqtt';
import logo from './logo.svg';
import './App.css';

const client = mqtt.connect('ws://192.168.0.135', {
  port: 3023,
});

class App extends Component {
  state = {
    imageUrl: '',
    requestingImage: false,
    date: '',
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
        imageUrl: urlCreator.createObjectURL(blob),
        requestingImage: false,
        date: new Date().toISOString().substring(11, 19),
      })
    });
  }
  
  handleRequestPicture = () => {
    console.log('PUBLISH', 'mqtt/take-picture');
    this.setState({ requestingImage: true })
    client.publish('mqtt/take-picture', 'Take a picture please!');
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">MQTT Client Subscriber</h1>
        </header>
        <p className="App-intro">
          To get request a picture, click the following button: <button onClick={this.handleRequestPicture}>Request picture</button>
        </p>
        { this.state.requestingImage
          ? <img src={logo} className="App-logo" alt="spinner" />
          : (
            <React.Fragment>
              { this.state.imageUrl &&
                <img class="raspistill-image" src={this.state.imageUrl} alt="raspistill snap" />
              }
              <p>{this.state.date}</p>
            </React.Fragment>
          )
        }
      </div>
    );
  }
}

export default App;
