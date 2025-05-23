// Firebase configuration (replace with your own)
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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Navigation logic
document.querySelectorAll('.navbar li').forEach(li => {
  li.addEventListener('click', () => {
    document.querySelectorAll('.navbar li').forEach(x => x.classList.remove('active'));
    li.classList.add('active');
    document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
    const target = li.textContent.toLowerCase().replace(/ /g, '-') + '-panel';
    document.getElementById(target).classList.remove('hidden');
  });
});

// Terminal command handling
const outputEl = document.getElementById('terminal-output');
const inputEl = document.getElementById('command-input');

inputEl.addEventListener('keydown', async (e) => {
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

async function handleCommand(cmd) {
  const parts = cmd.split(' ');
  switch(parts[0]) {
    case '-help':
      appendLine('Available: -help, -hack, -gambel, -balance, -buychain');
      break;
    case '-balance':
      // Query user balance from DB
      const balSnap = await db.ref('users/' + auth.currentUser.uid + '/balance').get();
      appendLine(`Balance: ${balSnap.val()} GU`);
      break;
    case '-gambel':
      // Simplified gamble logic
      const amount = Number(parts[1]);
      if (isNaN(amount)) return appendLine('Usage: -gambel 50');
      const win = Math.random() < 0.5;
      const delta = win ? amount : -amount;
      await db.ref('users/' + auth.currentUser.uid + '/balance').transaction(b => b + delta);
      appendLine(win ? 'You won!' : 'You lost!');
      break;
    // Add more commands: -hack, -buychain, etc.
    default:
      appendLine('Unknown command. Try -help.');
  }
}

// On load: prompt login
window.onload = () => {
  auth.onAuthStateChanged(user => {
    if (!user) showLogin();
    else initGame(user);
  });
};

function showLogin() {
  const email = prompt('Enter email:');
  const pass = prompt('Enter password:');
  auth.signInWithEmailAndPassword(email, pass).catch(err => alert(err.message));
}

function initGame(user) {
  appendLine(`Welcome back, ${user.email}`);
  // Ensure user data exists
  db.ref('users/' + user.uid).once('value', snap => {
    if (!snap.exists()) {
      db.ref('users/' + user.uid).set({ balance: 1000, level: 1 });
    }
  });
}
