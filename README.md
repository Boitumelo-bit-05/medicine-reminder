# 💊 Medicine Reminder App

A medication reminder app designed for elderly users with offline functionality, audio alerts, and safety features.

## ✨ Features

- **🔔 Audio Alerts** - Loud beeping when it's time to take medicine
- **🎯 Snooze Function** - Snooze for 5 or 10 minutes
- **⚠️ Safety Notes** - Important warnings for each medicine (e.g., "Take with food")
- **🌅 Time-of-Day Grouping** - Medicines organized by Morning/Afternoon/Evening/Night
- **📱 Offline Mode** - Works without internet using localStorage
- **🎤 Voice Input** - Say "I took my medicine" (Chrome only)
- **🟢 Online Status** - Shows if app is online or offline
- **🧓 Elderly-Friendly UI** - Large text, high contrast, simple design

## 🚀 Quick Start

### Requirements
- Python 3.7+
- Web browser (Chrome, Safari, Firefox, Edge)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/medicine-reminder.git
cd medicine-reminder

# Run the server
python3 app.py
```

Then open: `http://localhost:8000`

## 📖 How to Use

1. **Add Medicine** - Enter name, dosage, time, and safety notes
2. **Get Alerts** - App beeps and shows red alert at reminder time
3. **Confirm** - Click "✓ Took It" or snooze
4. **Works Offline** - All medicines saved locally
5. **Time Grouped** - See medicines organized by time of day

## 🏗️ Tech Stack

**Backend:**
- Python HTTPServer (no Flask/Django)
- JSON file storage
- Error handling & validation

**Frontend:**
- HTML5
- CSS3 (Warm & Trust theme)
- Vanilla JavaScript (no frameworks)

**APIs Used:**
- Web Audio API (beeping)
- Web Notification API (browser alerts)
- Web Speech API (voice input)
- localStorage (offline storage)

## 📁 Project Structure

medicine-reminder/

├── README.md

├── app.py                 # Python backend

├── medicines.json         # Data storage

├── templates/

│   └── index.html        # Main HTML

└── static/

├── css/

│   └── style.css     # Styling

└── js/

└── script.js     # Frontend logic

## 🎨 Design

Built with accessibility in mind:
- Large 48pt fonts for elderly vision
- High contrast (navy text on cream background)
- Gold accents for trust & warmth
- Minimal buttons (easy to understand)
- Clear alerts with beeping sound

## ✅ What Works

- ✅ Add/view/delete medicines
- ✅ Audio alerts at reminder time
- ✅ Snooze function (5/10 min)
- ✅ Safety notes display
- ✅ Time-of-day grouping
- ✅ Offline functionality with localStorage
- ✅ Online/offline status indicator
- ✅ Browser notifications
- ✅ Voice input (Chrome)

## 🔮 Future Features

- [ ] SMS notifications to caregiver
- [ ] Medication compliance history
- [ ] Edit/delete medicines
- [ ] Dark mode
- [ ] Multiple user profiles
- [ ] Mobile app version

## 💡 Inspiration

Built to help elderly users remember their medications reliably. A real problem that needed a simple, accessible solution.

## 📝 License

MIT License - Feel free to use and modify

## 👨‍💻 Author

**Boitumelo Tiheli**
- University: UNILUS (BSc Information Systems & Technology)
- LinkedIn: [linkedin.com/in/boitumelotiheli](https://linkedin.com/in/boitumelotiheli)
- Portfolio: [GitHub](https://github.com/YOUR_USERNAME)

---

**Built with ❤️ for Grandma**
