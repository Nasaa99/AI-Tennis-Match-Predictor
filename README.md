# AI Tennis Match Predictor 🎾

A full-stack web app that predicts ATP tennis match outcomes using machine learning.

🌐 **Live Demo**: [https://ai-tennis-match-predictor.vercel.app](https://ai-tennis-match-predictor.vercel.app)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS |
| Backend | Flask (Python), RESTful API |
| Machine Learning | scikit-learn (Random Forest Classifier) |
| Data Processing | pandas, NumPy |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## Features

- Predicts match outcomes with confidence scores based on surface, rankings, head-to-head records, and recent form
- Trained on 10K+ ATP matches achieving 65% prediction precision over a historical win rate baseline
- Dynamic UI that changes theme based on court surface (hard, clay, grass)

---

## Run Locally

### Prerequisites
- Python 3.7+
- Node.js 14+

### Setup

```bash
# Clone the repo
git clone https://github.com/Nasaa99/AI-Tennis-Match-Predictor

# Install backend dependencies
pip install -r requirements.txt

# Start the Flask backend
python app.py

# In a new terminal, start the React frontend
cd frontend
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

- **Frontend**: Deployed on Vercel, auto-deploys on every push to `main`
- **Backend**: Deployed on Railway, auto-deploys on every push to `main`

---

*Made for tennis fans and data enthusiasts*
