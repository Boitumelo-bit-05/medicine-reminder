let medicines = [];
let recognitionActive = false;
let alertActive = false;
let snoozeTimer = null;
let currentMedicineName = '';
let currentMedicineData = null;

// Offline functionality
const isOnline = () => navigator.onLine;

function saveToLocalStorage() {
    localStorage.setItem('medicines', JSON.stringify(medicines));
    console.log('✓ Saved to local storage');
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('medicines');
    if (stored) {
        medicines = JSON.parse(stored);
        console.log('✓ Loaded from local storage');
        return true;
    }
    return false;
}

function updateOnlineStatus() {
    const statusDiv = document.getElementById('online-status');
    if (statusDiv) {
        if (isOnline()) {
            statusDiv.innerHTML = '🟢 Online';
            statusDiv.style.color = '#27AE60';
        } else {
            statusDiv.innerHTML = '🔴 Offline';
            statusDiv.style.color = '#E74C3C';
        }
    }
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
}

// Create audio context for beeping
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(duration = 500, frequency = 800) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
}

function soundAlarm() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            playBeep(300, 800);
            setTimeout(() => playBeep(300, 600), 350);
        }, i * 800);
    }
}

function showMedicineAlert(medName, dosage, safetyNotes) {
    alertActive = true;
    currentMedicineName = medName;
    const alertBanner = document.getElementById('alert-banner');
    const alertText = document.getElementById('alert-text');
    const safetyNotesDiv = document.getElementById('safety-notes');
    
    alertText.innerHTML = `
        <p style="font-size: 24px; font-weight: 700; margin: 0;">⏰ TIME TO TAKE MEDICINE</p>
        <p style="font-size: 20px; margin: 0.5rem 0;">${medName}</p>
        <p style="font-size: 14px; margin: 0;">${dosage}</p>
    `;
    
    if (safetyNotes) {
        safetyNotesDiv.innerHTML = `⚠️ ${safetyNotes}`;
        safetyNotesDiv.style.display = 'block';
    } else {
        safetyNotesDiv.style.display = 'none';
    }
    
    alertBanner.style.display = 'block';
    soundAlarm();
    
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Medicine Reminder', {
            body: `Time to take: ${medName} (${dosage})`,
            icon: '💊'
        });
    }
}

function hideAlert() {
    alertActive = false;
    const alertBanner = document.getElementById('alert-banner');
    alertBanner.style.display = 'none';
}

function checkMedicineTime() {
    const now = new Date();
    const currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    
    medicines.forEach(med => {
        if (med.time === currentTime && !med.takenToday) {
            showMedicineAlert(med.name, med.dosage, med.safety_notes || '');
            currentMedicineData = med;
        }
    });
}

function snoozeAlert(minutes) {
    console.log(`Snoozing for ${minutes} minutes`);
    
    hideAlert();
    alert(`⏰ Alarm snoozed for ${minutes} minutes`);
    
    // Clear existing timer if any
    if (snoozeTimer) {
        clearTimeout(snoozeTimer);
    }
    
    // Set new timer - fire the alarm again after snooze
    snoozeTimer = setTimeout(() => {
        if (currentMedicineData) {
            showMedicineAlert(currentMedicineData.name, currentMedicineData.dosage, currentMedicineData.safety_notes || '');
        }
    }, minutes * 60 * 1000);
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('current-time').textContent = `${hours}:${minutes}`;
    
    // Check medicine time every minute
    checkMedicineTime();
}

async function loadMedicines() {
    try {
        const response = await fetch('/api/medicines');
        if (response.ok) {
            medicines = await response.json();
            saveToLocalStorage();
            displayMedicines();
        }
    } catch (error) {
        console.log('Server unavailable, loading from local storage...');
        if (!loadFromLocalStorage()) {
            medicines = [];
        }
        displayMedicines();
    }
}

function displayMedicines() {
    const display = document.getElementById('medicines-display');
    
    if (medicines.length === 0) {
        display.innerHTML = '<p style="color: #7a6a52; text-align: center;">No medicines added yet</p>';
        return;
    }
    
    // Group medicines by time of day
    const groups = {
        morning: { label: '🌅 Morning (6am - 12pm)', medicines: [] },
        afternoon: { label: '☀️ Afternoon (12pm - 6pm)', medicines: [] },
        evening: { label: '🌙 Evening (6pm - 10pm)', medicines: [] },
        night: { label: '🌃 Night (10pm - 6am)', medicines: [] }
    };
    
    medicines.forEach(med => {
        const hour = parseInt(med.time.split(':')[0]);
        
        if (hour >= 6 && hour < 12) {
            groups.morning.medicines.push(med);
        } else if (hour >= 12 && hour < 18) {
            groups.afternoon.medicines.push(med);
        } else if (hour >= 18 && hour < 22) {
            groups.evening.medicines.push(med);
        } else {
            groups.night.medicines.push(med);
        }
    });
    
    let html = '';
    
    // Display each group
    Object.keys(groups).forEach(key => {
        const group = groups[key];
        if (group.medicines.length > 0) {
            html += `<div class="time-group">
                <h3 class="time-group-label">${group.label}</h3>`;
            
            group.medicines.forEach(med => {
                html += `
                    <div class="medicine-item">
                        <div class="medicine-info">
                            <h3>${med.name}</h3>
                            <p>${med.dosage}</p>
                            <p>Time: ${med.time}</p>
                            ${med.safety_notes ? `<p style="font-size: 12px; color: #E74C3C; margin-top: 0.5rem;"><strong>⚠️ ${med.safety_notes}</strong></p>` : ''}
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn-took" onclick="confirmMedicine('${med.name}')">✓ Took It</button>
                            ${recognition ? `<button class="btn-voice" onclick="startVoiceInput('${med.name}')">🎤</button>` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
    });
    
    display.innerHTML = html;
}

function startVoiceInput(medName) {
    if (!recognition) {
        alert('Voice input not supported in this browser');
        return;
    }
    
    if (recognitionActive) {
        recognition.stop();
        recognitionActive = false;
        return;
    }
    
    recognitionActive = true;
    const btn = event.target;
    btn.textContent = '🎤 Listening...';
    btn.style.background = '#FF6B6B';
    
    recognition.onstart = () => {
        console.log('Listening for voice input...');
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('You said: ' + transcript);
        
        if (transcript.includes('took') || transcript.includes('medicine') || transcript.includes(medName.toLowerCase())) {
            confirmMedicine(medName);
            btn.textContent = '✓ Confirmed!';
            btn.style.background = '#27AE60';
            setTimeout(() => {
                btn.textContent = '🎤';
                btn.style.background = '#3498db';
                recognitionActive = false;
            }, 2000);
        } else {
            btn.textContent = '🎤 Try again';
            btn.style.background = '#FF8C42';
            setTimeout(() => {
                btn.textContent = '🎤';
                btn.style.background = '#3498db';
                recognitionActive = false;
            }, 2000);
        }
    };
    
    recognition.onerror = (event) => {
        console.error('Voice input error:', event.error);
        btn.textContent = '🎤 Error';
        btn.style.background = '#E74C3C';
        setTimeout(() => {
            btn.textContent = '🎤';
            btn.style.background = '#3498db';
            recognitionActive = false;
        }, 2000);
    };
    
    recognition.start();
}

async function confirmMedicine(medName) {
    const timestamp = new Date().toISOString();
    
    // Save locally first
    saveToLocalStorage();
    
    // Try to send to server if online
    if (isOnline()) {
        try {
            const response = await fetch('/api/confirm-medicine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: medName, timestamp })
            });
            const result = await response.json();
            alert(`✓ ${result.message}`);
        } catch (error) {
            alert(`✓ Medicine recorded (offline mode)`);
        }
    } else {
        alert(`✓ Medicine recorded (offline mode)`);
    }
    
    hideAlert();
}

document.getElementById('medicine-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('med-name').value;
    const dosage = document.getElementById('med-dosage').value;
    const time = document.getElementById('med-time').value;
    const notes = document.getElementById('med-notes').value;
    const safetyNotes = document.getElementById('med-safety').value;
    
    medicines.push({ name, dosage, time, notes, safety_notes: safetyNotes, takenToday: false });
    
    // Save to localStorage first
    saveToLocalStorage();
    
    // Try to sync with server if online
    if (isOnline()) {
        try {
            await fetch('/api/medicines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(medicines)
            });
            console.log('✓ Synced with server');
        } catch (error) {
            console.log('⚠️ Could not sync with server, saved locally');
        }
    }
    
    document.getElementById('medicine-form').reset();
    loadMedicines();
    showSection('home');
});

document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Load medicines (from server or localStorage)
    loadMedicines();
    
    updateTime();
    setInterval(updateTime, 60000);
    
    // Check online/offline status
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    showSection('home');
});