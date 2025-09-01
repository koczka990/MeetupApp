window.addEventListener('DOMContentLoaded', () => {
	initializeFirebase();
	setupLocationsPage();
	setupRandomizerPage();
	setupMeetupHistoryPage();
});
function setupMeetupHistoryPage() {
	const form = document.getElementById('add-meetup-form');
	const locationSelect = document.getElementById('meetup-location');
	const dateInput = document.getElementById('meetup-date');
	const attendeesInput = document.getElementById('meetup-attendees');
	const meetupsList = document.getElementById('meetups-list');
	if (!form || !locationSelect || !dateInput || !attendeesInput || !meetupsList) return;

	let locationsMap = {};

	// Populate location dropdown live
	db.collection('locations').orderBy('name').onSnapshot(snapshot => {
		locationSelect.innerHTML = '<option value="">Select location</option>';
		locationsMap = {};
		snapshot.forEach(doc => {
			const data = doc.data();
			locationsMap[doc.id] = data.name;
			const opt = document.createElement('option');
			opt.value = doc.id;
			opt.textContent = data.name + (data.address ? ` (${data.address})` : '');
			locationSelect.appendChild(opt);
		});
	});

	// Add meetup
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const locationId = locationSelect.value;
		const date = dateInput.value;
		const attendees = attendeesInput.value.split(',').map(s => s.trim()).filter(Boolean);
		if (!locationId || !date || !attendees.length) return;
		try {
			await db.collection('meetups').add({
				locationId,
				date,
				attendees,
				created: firebase.firestore.FieldValue.serverTimestamp()
			});
			form.reset();
		} catch (err) {
			alert('Error adding meetup: ' + err.message);
		}
	});

	// List all meetups, newest first
	db.collection('meetups').orderBy('date', 'desc').onSnapshot(snapshot => {
		meetupsList.innerHTML = '';
		snapshot.forEach(doc => {
			const data = doc.data();
			const li = document.createElement('li');
			const locName = locationsMap[data.locationId] || 'Unknown location';
			li.className = 'meetup-item';
			li.innerHTML = `
				<div><strong>${locName}</strong> <span class="meetup-date">${data.date}</span></div>
				<div class="meetup-attendees">Attendees: ${data.attendees && data.attendees.length ? data.attendees.map(a => `<span>${a}</span>`).join(', ') : 'None'}</div>
			`;
			meetupsList.appendChild(li);
		});
	});
}

function setupRandomizerPage() {
	const pickBtn = document.getElementById('pick-random-btn');
	const resultDiv = document.getElementById('random-result');
	if (!pickBtn || !resultDiv) return;

	let locations = [];

	// Listen for live updates to locations
	db.collection('locations').onSnapshot(snapshot => {
		locations = [];
		snapshot.forEach(doc => {
			const data = doc.data();
			locations.push({
				id: doc.id,
				name: data.name,
				address: data.address || ''
			});
		});
	});

	pickBtn.addEventListener('click', () => {
		if (!locations.length) {
			resultDiv.textContent = 'No locations available.';
			return;
		}
		const idx = Math.floor(Math.random() * locations.length);
		const loc = locations[idx];
		resultDiv.innerHTML = `<strong>${loc.name}</strong>${loc.address ? ' <span style="color:#666">(' + loc.address + ')</span>' : ''}`;
	});
}
// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCycTIOxymnduU1S-nPwd5VmYgHCV8P9g0",
  authDomain: "meetupapp-7ca47.firebaseapp.com",
  projectId: "meetupapp-7ca47",
  storageBucket: "meetupapp-7ca47.firebasestorage.app",
  messagingSenderId: "780825273555",
  appId: "1:780825273555:web:7e8ef7d1dace737ff0e026",
  measurementId: "G-7PS7L5DB4Z"
};

// Initialize Firebase app and Firestore
let app, db;

function initializeFirebase() {
	// Check if firebase is loaded
	if (!window.firebase || !window.firebase.firestore) {
		console.error('Firebase SDK not loaded.');
		return;
	}
	app = firebase.initializeApp(firebaseConfig);
	db = firebase.firestore();
	window.db = db; // Expose db globally
}

// Expose initializeFirebase for manual or auto init
window.initializeFirebase = initializeFirebase;

// Optionally auto-initialize on load



function setupLocationsPage() {
	const form = document.getElementById('add-location-form');
	const nameInput = document.getElementById('location-name');
	const addressInput = document.getElementById('location-address');
	const list = document.getElementById('locations-list');

	if (!form || !list) return;

	// Add location
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const name = nameInput.value.trim();
		const address = addressInput.value.trim();
		if (!name) return;
		try {
			await db.collection('locations').add({
				name,
				address: address || null,
				created: firebase.firestore.FieldValue.serverTimestamp()
			});
			form.reset();
		} catch (err) {
			alert('Error adding location: ' + err.message);
		}
	});

	// Real-time listener
	db.collection('locations').orderBy('created', 'desc').onSnapshot(snapshot => {
		list.innerHTML = '';
		snapshot.forEach(doc => {
			const data = doc.data();
			const li = document.createElement('li');
			li.className = 'location-item';
			li.innerHTML = `
				<span class="loc-name">${data.name}</span>
				${data.address ? `<span class="loc-address">(${data.address})</span>` : ''}
				<button class="delete-btn" title="Delete">&times;</button>
			`;
			li.querySelector('.delete-btn').onclick = async () => {
				if (confirm('Delete this location?')) {
					try {
						await db.collection('locations').doc(doc.id).delete();
					} catch (err) {
						alert('Error deleting location: ' + err.message);
					}
				}
			};
			list.appendChild(li);
		});
	});
}
