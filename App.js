import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  View,
  ScrollView,
} from 'react-native';

import CallDetectorManager from 'react-native-call-detection'

import { recordStart, recordStop, play, dir } from './audio';


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


const upload = Platform.select({
  ios: function () {
    const RNFS = require('react-native-fs');

    const uploadUrl = 'http://ctrack.me/api/v1/phones/+79160000000';

    const files = [
      {
        name: 'audio',
        filename: 'test.aac',
        filepath: this.state.audioPath,
        filetype: 'application/octet-stream',
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
  },
  android: function () {
    const file = {
      uri: `file://${this.state.audioPath}`,
      name: 'test.aac',
      type: 'application/octet-stream',
    }

    const body = new FormData()
    body.append('audio', file);

    const uploadUrl = 'http://ctrack.me/api/v1/phones/+79160000000';

    fetch(uploadUrl, {
      method: 'POST',
      body
    }).then(resp => resp.json()).then(({ id }) => this.setState({ id }));
  },
});


export default class App extends Component<Props> {
  state = {
    state: EMPTY,
    audioPath: dir + '/test.aac',
  };

  componentDidMount() {
    this.initCallDetector();
  }

  initCallDetector() {
    this.callDetector = new CallDetectorManager(
      (event, number)=> {
      console.log(event, number);
      number && this.setState({
        phoneNumber: number,
        phoneEvent: event,
      });
      // For iOS event will be either "Connected",
      // "Disconnected","Dialing" and "Incoming"

      // For Android event will be either "Offhook",
      // "Disconnected", "Incoming" or "Missed"
      if (event === 'Incoming') {
        // Do something call got incoming
      }
      else if (event === 'Offhook') {
        //Device call state: Off-hook.
        // At least one call exists that is dialing,
        // active, or on hold,
        // and no calls are ringing or waiting.
        // This clause will only be executed for Android
      }
      else if (event === 'Missed') {
      	// Do something call got missed
      	// This clause will only be executed for Android
      }
    },
    true,
    () => {},
    {
      title: 'Phone State Permission',
      message: 'This app needs access to your phone state in order to track your emotions.'
    }
  );
  }


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

  upload = upload.bind(this);

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
    let { state, duration, currentTime, sound, result, id, phoneNumber, phoneEvent } = this.state;
    currentTime = Math.min(duration, currentTime);

    const data = [];
    for (const i = 0; i <= Math.floor(duration)*10; i++) {
      data.push({x: i, y: Math.sin(i)});
    }

    return (
      <ScrollView contentContainerStyle={styles.container}>
        { Number.isInteger(id) && <Text> id: {id} </Text> }
        { result && <Text> result: {JSON.stringify(result, null, 2)}</Text> }
        { phoneNumber && <Text> phoneNumber: {phoneNumber}</Text> }
        { phoneEvent && <Text> phoneEvent: {phoneEvent}</Text> }
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
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
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
