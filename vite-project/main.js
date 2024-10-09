import './style.css';

import firebase from 'firebase/app';
import 'firebase/firestore';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { doc, getFirestore, collection } from 'firebase/firestore';

// Your web app's Firebase configuration
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
const firestore = getFirestore(app); // Initialize Firestore

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
}

let pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

const webcamButton = document.getElementById('webcamButton');
const webcamVideo = document.getElementById('webcamVideo');
const callButton = document.getElementById('callButton');
const callInput = document.getElementById('callInput');
const answerButton = document.getElementById('answerButton');
const remoteVideo = document.getElementById('remoteVideo');
const hangupButton = document.getElementById('hangupButton');

// Setting up Media sources
webcamButton.onclick = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    remoteStream = new MediaStream();
    
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = event => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
    };

    webcamVideo.srcObject = localStream;
    remoteVideo.srcObject = remoteStream;
  } catch (error) {
    console.error("Error accessing media devices:", error);
    alert("Could not access the webcam or microphone. Please check your settings.");
  }
};

// Create an offer
callButton.onclick = async () => {
  const callDoc = collection(firestore, 'calls').doc(); // Reference Firestore collection
  const offerCandidates = collection(callDoc, 'offerCandidates');
  const answerCandidates = collection(callDoc, 'answerCandidates');

  callInput.value = callDoc.id;

  // Get candidates for caller, save to db
  pc.onicecandidate = event => {
    if (event.candidate) {
      offerCandidates.add(event.candidate.toJSON());
    }
  };

  // Create offer
  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  await callDoc.set({ offer });

  // Listen for remote answers
  callDoc.onSnapshot((snapshot) => {
    const data = snapshot.data();
    if (!pc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
    }
  });

  answerCandidates.onSnapshot(snapshot => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });
};

// Answer the Call with Unique ID
answerButton.onclick = async () => {
  const callID = callInput.value;
  const callDoc = doc(firestore, 'calls', callID); // Reference Firestore document
  const answerCandidates = collection(callDoc, 'answerCandidates');

  pc.onicecandidate = event => {
    if (event.candidate) {
      answerCandidates.add(event.candidate.toJSON());
    }
  };

  const callData = (await callDoc.get()).data();

  if (!callData) {
    alert("Call not found. Please check the ID.");
    return;
  }

  const offerDescription = callData.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await callDoc.update({ answer });

  answerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        pc.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });
};

// Hang up functionality (optional)
hangupButton.onclick = () => {
  pc.close();
  localStream.getTracks().forEach(track => track.stop());
  console.log("Call ended.");
  // Reset UI elements if necessary
  webcamVideo.srcObject = null;
  remoteVideo.srcObject = null;
  callInput.value = '';
};
