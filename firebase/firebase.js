import * as firebase from 'firebase';
import firestore from 'firebase/firestore'

const settings = {timestampsInSnapshots: true};

const config = {
  apiKey: "AIzaSyD8ufEm-lUs1FTTzOEZRwaJFSxuyOTFnE4",
  authDomain: "kusinahanglan-30ebf.firebaseapp.com",
  databaseURL: "https://kusinahanglan-30ebf.firebaseio.com",
  projectId: "kusinahanglan-30ebf",
  storageBucket: "kusinahanglan-30ebf.appspot.com",
  messagingSenderId: "238156849545",
  appId: "1:238156849545:web:aca053a060ccc6449e4158",
  measurementId: "G-GE6J8GQ9WL"
};
firebase.initializeApp(config);


export default firebase;