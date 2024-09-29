import './style.css';


import firebase from 'firebase/app';
import 'firebase/firestore';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { doc } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_5Dhz2CZ2SPsY8b_vRY2f_DTEJGgcX0Y",
  authDomain: "find-my-team-8a327.firebaseapp.com",
  databaseURL: "https://find-my-team-8a327-default-rtdb.firebaseio.com",
  projectId: "find-my-team-8a327",
  storageBucket: "find-my-team-8a327.appspot.com",
  messagingSenderId: "794551886125",
  appId: "1:794551886125:web:cce897a4e51b1d34fdb3a4",
  measurementId: "G-TBWMQPSTS3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const servers = {
  iceServers: [
    {
      urls: ['stun: stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
}

let pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

const webcamButtom = document.getElementById('webcamButton');
const webcamVideo = document.getElementById('webcamVideo');
const callButtom = document.getElementById('callButton');
const callInput = document.getElementById('callInput');
const answerButton = document.getElementById('answerButton');
const remoteVideo = document.getElementById('remoteVideo');
const hangupButton = document.getElementById('hangupButton');

// setting yp Media soruces: 

webcamButtom.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({video:true, audio: true});

  remoteStream=new MediaStream();
  localStream.getTracks().forEach((track) =>{
    pc.addTrack(track, localStream);
  });

  pc.ontrack = event=> {
    event.streams[0].getTracks().forEach(track =>{
      remoteStream.addTrack(track);
    });
  };
  webcamVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream
};