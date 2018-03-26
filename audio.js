import Sound from 'react-native-sound';
import { AudioRecorder, AudioUtils } from 'react-native-audio';

const wait = time => new Promise(res => setTimeout(res, time));

export const dir = AudioUtils.DocumentDirectoryPath;

export const record = async (duration, path) => {
  try {
    await AudioRecorder.prepareRecordingAtPath(path, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "Low",
      AudioEncoding: "aac",
      AudioEncodingBitRate: 32000
    });

    await AudioRecorder.startRecording();

    await wait(duration);
    await AudioRecorder.stopRecording();
    console.log('recorded');
  } catch (error) {
    console.log('record error', error);
  }
};

export const play = (path, onEnd) => {
  const sound = new Sound(path, '', (error) => {
    if (error) {
      console.log('failed to load the sound', error);
    }
  });

  setTimeout(() => {
    sound.play((success) => {
      onEnd && onEnd();
      if (success) {
        console.log('successfully finished playing');
      } else {
        console.log('playback failed due to audio decoding errors');
      }
    });
  }, 100);
  return sound;
};
