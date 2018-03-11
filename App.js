/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  View
} from 'react-native';

// import Sound from 'react-native-sound';
import { AudioRecorder, AudioUtils } from 'react-native-audio';


let audioPath = AudioUtils.DocumentDirectoryPath + '/test.aac';

AudioRecorder.prepareRecordingAtPath(audioPath, {
  SampleRate: 22050,
  Channels: 1,
  AudioQuality: "Low",
  AudioEncoding: "aac"
});

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};

const wait = time => new Promise(res => setTimeout(res, time));

export default class App extends Component<Props> {
  state = {
    recorded: false,
    audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
  };

  onRecord = async () => {
    try {
      await AudioRecorder.startRecording();

      await AudioRecorder.prepareRecordingAtPath(this.state.audioPath, {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: "Low",
        AudioEncoding: "aac",
        AudioEncodingBitRate: 32000
      });

      await wait(3000);
      await AudioRecorder.stopRecording();
      this.setState({
        recorded: true,
      });
      console.log('recorded');
    } catch (error) {
      console.log('record error', error);
    }
  }

  upload = () => {
    const RNFS = require('react-native-fs');

    const uploadUrl = 'https://requestb.in/1fn8bnd1';

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
      console.log('Upload: ' + percentage + '%');
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

  // onPlay = () => {
  //   setTimeout(() => {
  //     const sound = new Sound(this.state.audioPath, '', (error) => {
  //       if (error) {
  //         console.log('failed to load the sound', error);
  //       }
  //     });
  //
  //     setTimeout(() => {
  //       sound.play((success) => {
  //         if (success) {
  //           console.log('successfully finished playing');
  //         } else {
  //           console.log('playback failed due to audio decoding errors');
  //         }
  //       });
  //     }, 100);
  //   }, 100);
  // }

  render() {
    const { recorded } = this.state;
    return (
      <View style={styles.container}>
        <Button
          onPress={this.onRecord}
          title="Record 10 sec"
          color="#841584"
          accessibilityLabel="record 10 second"
        />
        {recorded && <Button
          onPress={this.upload}
          title="Upload"
          color="#856515"
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
