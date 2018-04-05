import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  View
} from 'react-native';

import { recordStart, recordStop, play, dir } from './audio';


import { VictoryBar, VictoryChart, VictoryTheme } from "victory-native";


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};

const EMPTY = null;
const RECORDING = 'RECORDING';
const RECORDED = 'RECORDED';

export default class App extends Component<Props> {
  state = {
    state: EMPTY,
    audioPath: dir + '/test.aac',
  };


  onRecordStart = async () => {
    await recordStart(this.state.audioPath);
    this.setState({
      state: RECORDING,
      result: null,
    });
  }

  onRecordStop = async () => {
    await recordStop();
    this.setState({
      state: RECORDED,
    });
  }

  onPlay = () => {
    let currentTimeInterval;

    this.setState({
      playing: true,
    });

    const sound = play(this.state.audioPath, () => {
      this.setState({
        plaing: false,
      });
      clearInterval(currentTimeInterval);
    });

    setTimeout(() => {
      this.setState({
        duration: sound.getDuration(),
        sound,
      });
    }, 100);

    currentTimeInterval = setInterval(() => {
      sound.getCurrentTime((currentTime) => this.setState({
        currentTime,
      }));
    }, 200);
  }

  upload = () => {
    const RNFS = require('react-native-fs');

    const uploadUrl = 'http://ctrack.me/api/v1/phones/+79160000000';
    fetch('http://httpbin.org/').then(console.log.bind(console, 's'), console.log.bind(console, 'e'));
    fetch('https://httpbin.org/').then(console.log.bind(console, 's'), console.log.bind(console, 'e'));
    // const uploadUrl = 'localhost/api/v1/phones/+79160000000';
    // const uploadUrl = 'http://ctrack.me/';
    // const uploadUrl = 'http://localhost:4000';
    // const uploadUrl = 'https://httpbin.org/post';

    const files = [
      {
        name: 'audio',
        filename: 'test.aac',
        filepath: this.state.audioPath,
        filetype: 'application/octet-stream',
        // filetype: '	audio/aac'
      }
    ];

    const uploadBegin = ({ jobId }) => {
      console.log('Upload has begun, jobId: ' + jobId);
    };

    const uploadProgress = ({ totalBytesSent, totalBytesExpectedToSend }) => {
      var percentage = Math.floor((totalBytesSent/totalBytesExpectedToSend) * 100);
      console.log('Upload: ' + percentage + '%',totalBytesSent, totalBytesExpectedToSend);
    };

    // upload files
    RNFS.uploadFiles({
      toUrl: uploadUrl,
      files: files,
      method: 'POST',
      headers: {
        'Accept': '*/*',
      },
      begin: uploadBegin,
      progress: uploadProgress
    }).promise.then((response) => {
        console.log(response);
        if (response.statusCode == 201) {
          const { id } = JSON.parse(response.body);
          this.setState({ id });
          console.log('file uploaded', response); // response.statusCode, response.headers, response.body
          // TODO set identifier
        } else {
          console.log('Server error');
        }
      })
      .catch((err) => {
        if(err.description === 'cancelled') {
          // cancelled by user
        }
        console.log(err);
      })
  }

  onResultPull = async () => {
    const { id } = this.state;
    console.log(`http://ctrack.me/api/v1/calls/${id}`);
    const resp = await fetch(`http://ctrack.me/api/v1/calls/${id}`);
    console.log(resp);
    const result = await resp.json();
    this.setState({
      result,
    });
  }



  render() {
    let { state, duration, currentTime, sound, result, id } = this.state;
    currentTime = Math.min(duration, currentTime);

    const data = [];
    for (const i = 0; i <= Math.floor(duration)*10; i++) {
      data.push({x: i, y: Math.sin(i)});
    }

    // const current = (currentTime && (currentTime < duration)) ? [ data[Math.floor(currentTime*10)] ] : [];

    return (
      <View style={styles.container}>
        { Number.isInteger(id) && <Text> id: {id} </Text> }
        { result && <Text> result: {JSON.stringify(result, null, 2)}</Text> }
        {/* { duration &&
          <VictoryChart width={350} theme={VictoryTheme.material}>
            <VictoryBar
              onClick={(...args) => console.log('click', ...args) }
              // events={[{ onClick: (...args) => console.log('click', ...args) }]}
              events={[{
                target: "data",
                eventHandlers: {
                  onPress: (evt, context, index) => {
                    sound.setCurrentTime(index / 10);
                  },
                }
              }]}
              barRatio={0.9}
              data={data}
              x="x"
              y="y"
            />
            <VictoryBar data={current} x="x" y="y" style={{ data: { fill: "red"} }}/>
          </VictoryChart>
        } */}
        { Number.isInteger(id) && <Button
          onPress={this.onResultPull}
          title="Pull Result"
          color="#b4bd68"
          accessibilityLabel="pull result"
        />}
        { state !== RECORDING &&
          <Button
            onPress={this.onRecordStart}
            title="Start recording"
            color="#fac73f"
            accessibilityLabel="record 3 second"
          />
        }
        { state === RECORDING &&
          <Button
            style={styles.stopRecording}
            onPress={this.onRecordStop}
            title="Stop recording"
            color="#fac73f"
            accessibilityLabel="record 10 second"
          />
        }
        {state === RECORDED && <Button
          onPress={this.onPlay}
          title="Play"
          color="#b4bd68"
          accessibilityLabel="play"
        />}
        {state === RECORDED && <Button
          onPress={this.upload}
          title="Upload"
          color="#286262"
          accessibilityLabel="upload"
        />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  stopRecording: {
    padding: 30,
    borderRadius: 100,
    backgroundColor: 'red',
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
