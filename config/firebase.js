import * as firebase from 'firebase';

// Initialize Firebase
var config = {
    apiKey: "AIzaSyCx_-uES-cH5MUvOmR6d8DwhQ4cibpzZlk",
    authDomain: "q-app-3a753.firebaseapp.com",
    databaseURL: "https://q-app-3a753.firebaseio.com",
    projectId: "q-app-3a753",
    storageBucket: "q-app-3a753.appspot.com",
    messagingSenderId: "121841392324"
  };
firebase.initializeApp(config);

export default firebase;