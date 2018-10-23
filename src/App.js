import React, { Component } from 'react';
import mqtt from 'mqtt';
import './App.css';

const client = mqtt.connect('ws://192.168.0.135', {
  port: 3023,
});

class App extends Component {
  state = {
    isAdmin: false,
    temperature: 0,
    humidity: 0,
    requestingImage: false,
    date: '',
  }
  componentDidMount() {
    client.on('connect', () => {
      client.subscribe('office/all');
    })
    client.on('message', (topic, message, packet) => {
      console.log(`[${topic}]`);
      const { temperature, humidity } = JSON.parse(new TextDecoder("utf-8").decode(message));
      console.log('TEMP', temperature);
      console.log('HUMID', humidity);
      this.setState({
        requestingImage: false,
        temperature,
        humidity,
        date: new Date().toISOString().substring(11, 19),
      })
    });

    this.setState({
      isAdmin: !!~window.location.search.indexOf('admin')
    })
  }
  
  handleRequestTemperature = () => {
    console.log('PUBLISH', 'office/all/get');
    this.setState({ requestingImage: true })
    client.publish('office/all/get', 'Read temperature & humidity please!');
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Jidoka Dashboard</h1>
        </header>

        <section className="content-wrapper">
          <div className="card">
            <span>Temperatuur</span>
            <div className="icon">
              <i className="fas fa-thermometer-half"></i>
            </div>
            <span className="sensor-value">{this.state.temperature.toFixed(1)}°</span>
            { this.state.isAdmin &&
              <button className="refresh-button" onClick={this.handleRequestTemperature}>Vernieuw</button>
            }
          </div>

          <div className="card">
            <span>Vochtigheid</span>
            <div className="icon">
              <i className="fas fa-tint"></i>
            </div>
            <span className="sensor-value">{this.state.humidity.toFixed(1)}%</span>
          </div>

          <div className="card">
            Camera
          </div>
          <div className="card">
            Beweging
          </div>
        </section>
      </div>
    );
  }
}

export default App;
