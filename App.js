import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  View
} from 'react-native';

import { AudioRecorder, AudioUtils } from 'react-native-audio';

import { record, play, dir } from './audio';


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};

export default class App extends Component<Props> {
  state = {
    recorded: false,
    audioPath: dir + '/test.aac',
  };


  onRecord3 = async () => {
    await record(3000, this.state.audioPath);
    this.setState({
      recorded: true,
    });
  }

  onRecord10 = async () => {
    await record(10000, this.state.audioPath);
    this.setState({
      recorded: true,
    });
  }

  onRecord30 = async () => {
    await record(30000, this.state.audioPath);
    this.setState({
      recorded: true,
    });
  }

  onPlay = play.bind(null, this.state.audioPath)

  upload = () => {
    const RNFS = require('react-native-fs');

    const uploadUrl = 'http://localhost:4000/';

    fetch('http://localhost:4000/fuck').then(console.log.bind(console));

    const files = [
      {
        name: 'test',
        filename: 'test.aac',
        filepath: this.state.audioPath,
        filetype: '	audio/aac'
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
        'Accept': 'application/json',
      },
      begin: uploadBegin,
      progress: uploadProgress
    }).promise.then((response) => {
        if (response.statusCode == 200) {
          console.log('file uploaded'); // response.statusCode, response.headers, response.body
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



  render() {
    const { recorded } = this.state;
    return (
      <View style={styles.container}>
        <Button
          onPress={this.onRecord3}
          title="Record 3 sec"
          color="#fac73f"
          accessibilityLabel="record 3 second"
        />
        <Button
          onPress={this.onRecord10}
          title="Record 10 sec"
          color="#fac73f"
          accessibilityLabel="record 10 second"
        />
        <Button
          onPress={this.onRecord30}
          title="Record 30 sec"
          color="#fac73f"
          accessibilityLabel="record 30 second"
        />
        {recorded && <Button
          onPress={this.onPlay}
          title="Play"
          color="#b4bd68"
          accessibilityLabel="play"
        />}
        {recorded && <Button
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
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
