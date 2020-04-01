import * as firebase from 'firebase'
import firestore from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDu1Occ1AcvCEJG72WEy1lJUeUdAkG-mUw",
    authDomain: "travel-be-ready-app.firebaseapp.com",
    databaseURL: "https://travel-be-ready-app.firebaseio.com",
    projectId: "travel-be-ready-app",
    storageBucket: "travel-be-ready-app.appspot.com",
    messagingSenderId: "1056709588149",
    appId: "1:1056709588149:web:34e26bfeac9566c4a87afc",
    measurementId: "G-FBXG4Q1R1X"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

export const connect = firebase.firestore()
export const firestoreAccess = firebase.firestore

export default {connect, firestoreAccess}