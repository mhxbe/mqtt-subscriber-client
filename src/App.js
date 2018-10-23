import React, { Component } from 'react';
import mqtt from 'mqtt';
import TimeAgo from 'react-timeago'
import './App.css';

const client = mqtt.connect('ws://192.168.0.135', {
  port: 3023,
});

class App extends Component {
  state = {
    humidity: 0,
    isAdmin: false,
    motionDetected: false,
    motionDetectedDate: '',
    picture: '',
    pictureTakenDate: '',
    requestingPicture: false,
    temperature: 0,
    temperatureHumidityDate: '',
  }
  componentDidMount() {
    client.on('connect', () => {
      client.subscribe("jidoka/office/temperature-humidity");
      client.subscribe("jidoka/office/motion");
      client.subscribe("jidoka/office/camera");
    })
    client.on('message', (topic, message, packet) => {
      console.log(`Incoming message: [${topic}]`);
      const messageValue = new TextDecoder("utf-8").decode(message)
      switch(topic) {
        case 'jidoka/office/temperature-humidity':
          const { temperature, humidity } = JSON.parse(messageValue)
          this.setState({
            requestingImage: false,
            temperature,
            humidity,
            temperatureHumidityDate: new Date().toISOString(),
          })
          break;

        case 'jidoka/office/motion':
          const { date, value } = JSON.parse(messageValue)
          this.setState({
            motionDetected: !!value,
            motionDetectedDate: new Date(date).toISOString(),
          })
          break;

        case 'jidoka/office/camera':
          const blob = new Blob([message], { type: "image/jpeg" });
          const urlCreator = window.URL || window.webkitURL;
          this.setState({
            picture: urlCreator.createObjectURL(blob),
            pictureTakenDate: new Date().toISOString(),
          })
          break;
        
      }
    });

    this.setState({
      isAdmin: !!~window.location.search.indexOf('admin')
    })
  }
  
  handleRequestTemperature = () => {
    console.log('PUBLISH', 'jidoka/office/temperature-humidity/get');
    client.publish("jidoka/office/temperature-humidity/get", "Read temperature & humidity please!");
  }

  handleRequestPicture = () => {
    console.log('PUBLISH', 'jidoka/office/take-picture');
    client.publish("jidoka/office/take-picture", "Take picture please!");
  }

  render() {
    return <div className="App">
        <header className="App-header">
          <h1 className="App-title">Jidoka Dashboard</h1>
        </header>

        <section className="content-wrapper">
          <div className="card">
            <span>Temperatuur</span>
            <div className="icon">
              <i className="fas fa-thermometer-half" />
            </div>
            <span className="updated-at">
              <TimeAgo date={this.state.temperatureHumidityDate} />
            </span>
            <span className="sensor-value">
              {this.state.temperature.toFixed(1)}°
            </span>
            {this.state.isAdmin && <button className="refresh-button" onClick={this.handleRequestTemperature}>
                Vernieuw
              </button>}
          </div>

          <div className="card">
            <span>Vochtigheid</span>
            <div className="icon">
              <i className="fas fa-tint" />
            </div>
            <span className="updated-at">
              <TimeAgo date={this.state.temperatureHumidityDate} />
            </span>
            <span className="sensor-value">
              {this.state.humidity.toFixed(1)}%
            </span>
            {this.state.isAdmin && <button className="refresh-button" onClick={this.handleRequestTemperature}>
                Vernieuw
              </button>}
          </div>

          <div className="card">
            { this.state.picture
                ? <img className="image" src={this.state.picture} />
                : (
                  <div>
                    <span>Camera</span>
                    <div className="icon">
                      <i className="fas fa-camera"></i>
                    </div>
                  </div>
                )
            }
            
            
            <span className="updated-at">
              <TimeAgo date={this.state.pictureTakenDate} />
            </span>
            {this.state.isAdmin && <button className="refresh-button" onClick={this.handleRequestPicture}>
                Snap!
              </button>}
          </div>
          <div className={`card ${this.state.motionDetected && 'red'}`}>
            <span>
              { this.state.motionDetected
                ? 'Beweging gedetecteerd!'
                : 'Geen beweging'
              }
            </span>

            <div className="icon">
              { this.state.motionDetected
                ? <i className="fas fa-exclamation-triangle"></i>
                :  <i className="fas fa-not-equal"></i>
              }
            </div>
            <span className="updated-at">
              <TimeAgo date={this.state.motionDetectedDate} />
            </span>
          </div>
        </section>
      </div>;
  }
}

export default App;
