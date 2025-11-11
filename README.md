# AI Tennis Match Predictor 🎾

A full-stack web application that uses machine learning to predict tennis match outcomes based on historical ATP data, player statistics, and match factors.

![Python](https://img.shields.io/badge/Python-3.7+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

- **🤖 AI-Powered Predictions**: Random Forest classifier trained on historical ATP match data
- **📊 Real-time Analysis**: Confidence scores and detailed explanations for predictions
- **👤 Player Statistics**: Comprehensive stats including win rates, rankings, and recent form
- **🎨 Modern UI**: Responsive design with animated backgrounds that change based on court surface
- **🏆 Multiple Factors**: Considers surface type, tournament, head-to-head records, and recent form
- **🎯 Surface Themes**: Dynamic background colors (purple/blue for hard, orange/red for clay, green for grass)

## 🛠️ Technology Stack

- **Backend**: Flask (Python) with RESTful API
- **Frontend**: React 18 + Vite
- **Machine Learning**: scikit-learn (Random Forest Classifier)
- **Data Processing**: pandas, numpy
- **Styling**: Custom CSS with Tailwind CSS

## 📋 Prerequisites

- **Python 3.7+** - [Download Python](https://www.python.org/downloads/)
  - ⚠️ **Important**: Check "Add Python to PATH" during installation
- **Node.js 14+** - [Download Node.js](https://nodejs.org/)
  - ⚠️ **Important**: npm comes with Node.js

## 🚀 Quick Start

### Windows (Easiest)

1. **First Time Setup** (Run Once):
   - Double-click `setup.bat` (or run `setup.ps1` in PowerShell)
   - Wait 5-10 minutes for dependencies to install

2. **Run the App**:
   - Double-click `start_app.bat` (or run `start_app.ps1` in PowerShell)
   - App opens automatically at http://localhost:3000

### Manual Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd "AI tennis match predictor"
   ```

2. **Set up Python environment**:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # or
   source .venv/bin/activate  # Mac/Linux
   pip install -r requirements.txt
   ```

3. **Set up Frontend**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Ensure dataset exists**:
   - Place `atp_matches_filtered.csv` in the `Dataset/` folder

5. **Run the application**:
   ```bash
   # Terminal 1: Start Flask backend
   python app.py
   
   # Terminal 2: Start React frontend
   cd frontend
   npm run dev
   ```

6. **Open browser**: http://localhost:3000

## 📁 Project Structure

```
AI tennis match predictor/
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── Procfile              # Heroku deployment config
├── runtime.txt           # Python version for deployment
├── .gitignore            # Git ignore rules
├── README.md             # This file
├── DEPLOYMENT_CHECKLIST.md  # Deployment guide
│
├── Dataset/
│   └── atp_matches_filtered.csv  # Tennis match data
│
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/    # API service layer
│   │   ├── App.jsx      # Main app component
│   │   └── index.css    # Global styles
│   ├── package.json     # Node dependencies
│   └── vite.config.js   # Vite configuration
│
├── templates/            # Flask templates (legacy)
│   └── index.html
│
├── static/               # Static files (legacy)
│   ├── style.css
│   └── script.js
│
└── predictor.ipynb      # Jupyter notebook (model development)
```

## 🎯 How It Works

### Data Processing Pipeline

1. **Load Data**: Reads ATP match data from CSV
2. **Filter Competitive Matches**: Only matches where players have similar rankings (within 50 spots)
3. **Create Features**: 
   - Surface codes (Hard/Clay/Grass)
   - Tournament codes
   - Head-to-head win rates
   - Recent form (last 5 matches)
   - Ranking momentum
   - Rolling averages

### Machine Learning Model

- **Algorithm**: Random Forest Classifier
- **Hyperparameters**: 
  - `n_estimators=200`
  - `min_samples_split=20`
  - `max_depth=15`
  - `min_samples_leaf=5`
- **Features**: 13 features including surface, rankings, H2H, form, and rolling averages
- **Training**: Time-aware training (no data leakage)

### Prediction Process

1. User selects two players, tournament, and surface
2. System calculates features for both players
3. Model predicts probability of Player 1 winning
4. Confidence score calculated using power curve
5. Detailed explanation generated based on factors

## 📊 Model Performance

- **Precision**: ~59-65% (when predicting a win, correct 59-65% of the time)
- **Accuracy**: ~99% overall (due to class imbalance)
- **Confidence**: Dynamic scaling based on prediction probability

## 🔌 API Endpoints

- `GET /` - Main application interface
- `GET /api/players` - List all available players
- `GET /api/tournaments` - List all available tournaments
- `POST /api/predict` - Make match prediction
  ```json
  {
    "player1": "Djokovic N.",
    "player2": "Alcaraz C.",
    "tournament": "Australian Open",
    "surface": "Hard"
  }
  ```
- `GET /api/player-stats/<player_name>` - Get detailed player statistics

## 🌐 Deployment

### Environment Variables

Set these in your hosting platform:

```bash
FLASK_ENV=production
FLASK_DEBUG=False
PORT=5000
VITE_API_URL=https://your-backend-url.com  # For frontend
```

### Deployment Options

#### Option 1: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables in Heroku dashboard
5. Deploy: `git push heroku main`

#### Option 2: Railway / Render

1. Connect GitHub repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `python app.py`
4. Configure environment variables

#### Option 3: VPS (DigitalOcean, AWS EC2)

1. Install Python 3.7+, Node.js
2. Clone repository
3. Install dependencies
4. Use gunicorn for production:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```
5. Build frontend: `cd frontend && npm run build`
6. Serve with nginx

See `DEPLOYMENT_CHECKLIST.md` for detailed deployment guide.

## 🐛 Troubleshooting

### Common Issues

**"Module not found" or "No module named 'flask'"**
- Activate virtual environment: `.venv\Scripts\activate`
- Install dependencies: `pip install -r requirements.txt`

**"Port 5000 already in use"**
- Close other Flask apps or change port via `PORT` environment variable

**"Cannot connect to backend"**
- Ensure Flask backend is running
- Test: http://localhost:5000/api/players
- Check browser console for errors

**"Model not loaded"**
- Ensure `Dataset/atp_matches_filtered.csv` exists
- Check file has required columns

**"Player not found"**
- Check `/api/players` endpoint for available players
- Player names must match exactly as in dataset

## 🔧 Development

### Adding Features

- **Backend**: Modify `app.py` functions
- **Frontend**: Edit React components in `frontend/src/components/`
- **Styling**: Update `frontend/src/index.css`

### Improving Model

- Experiment with algorithms in `train_model()`
- Add features in `create_competitive_dataset()`
- Adjust hyperparameters in Random Forest classifier

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues, feature requests, or pull requests.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for tennis fans and data enthusiasts**
