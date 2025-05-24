// Import Firebase modules (v9+ modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, get, set, runTransaction } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Navigation logic
const navItems = document.querySelectorAll('.navbar li');
navItems.forEach(li => {
  li.addEventListener('click', () => {
    navItems.forEach(x => x.classList.remove('active'));
    li.classList.add('active');
    document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
    const target = li.textContent.toLowerCase().replace(/ /g, '-') + '-panel';
    document.getElementById(target).classList.remove('hidden');
  });
});

// Terminal I/O
const outputEl = document.getElementById('terminal-output');
const inputEl = document.getElementById('command-input');

inputEl.addEventListener('keydown', async e => {
  if (e.key !== 'Enter') return;
  const cmd = inputEl.value.trim();
  appendLine(`> ${cmd}`);
  inputEl.value = '';
  await handleCommand(cmd);
});

function appendLine(text) {
  const line = document.createElement('div');
  line.textContent = text;
  outputEl.appendChild(line);
  outputEl.scrollTop = outputEl.scrollHeight;
}

// Command handlers
async function handleCommand(cmd) {
  const parts = cmd.split(' ');
  switch (parts[0]) {
    case '-help':
      appendLine('Available: -help, -hack, -gambel, -balance, -buychain');
      break;
    case '-balance': {
      const userId = auth.currentUser.uid;
      const snap = await get(ref(db, `users/${userId}/balance`));
      appendLine(`Balance: ${snap.val()} GU`);
      break;
    }
    case '-gambel': {
      const amount = Number(parts[1]);
      if (isNaN(amount)) return appendLine('Usage: -gambel 50');
      const userRef = ref(db, `users/${auth.currentUser.uid}/balance`);
      await runTransaction(userRef, curr => (curr || 0) + (Math.random() < 0.5 ? amount : -amount));
      appendLine('Gamble complete — check your balance.');
      break;
    }
    default:
      appendLine('Unknown command. Try -help.');
  }
}

// Auth & startup
onAuthStateChanged(auth, user => {
  if (user) initGame(user);
  else showLogin();
});

function showLogin() {
  const email = prompt('Enter email:');
  const pass = prompt('Enter password:');
  signInWithEmailAndPassword(auth, email, pass)
    .catch(err => alert(err.message));
}

function initGame(user) {
  appendLine(`Welcome back, ${user.email}`);
  const userRef = ref(db, `users/${user.uid}`);
  get(userRef).then(snap => {
    if (!snap.exists()) {
      set(userRef, { balance: 1000, level: 1 });
    }
  });
}
