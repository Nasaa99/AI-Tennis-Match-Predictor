import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import PredictionForm from './components/PredictionForm'
import ResultsSection from './components/ResultsSection'
import StatsSection from './components/StatsSection'
import LoadingOverlay from './components/LoadingOverlay'
import { getPlayers, getTournaments, predictMatch, getPlayerStats } from './services/api'

function App() {
  const [players, setPlayers] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(false)
  const [predictionResult, setPredictionResult] = useState(null)
  const [player1Stats, setPlayer1Stats] = useState(null)
  const [player2Stats, setPlayer2Stats] = useState(null)
  const [player1Name, setPlayer1Name] = useState(null)
  const [player2Name, setPlayer2Name] = useState(null)
  const [surfaceTheme, setSurfaceTheme] = useState('hard')

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      console.log('Loading players and tournaments from API...')
      const [playersData, tournamentsData] = await Promise.all([
        getPlayers(),
        getTournaments()
      ])
      
      const playersList = playersData.players || []
      const tournamentsList = tournamentsData.tournaments || []
      
      console.log(`Loaded ${playersList.length} players from dataset`)
      console.log(`Loaded ${tournamentsList.length} tournaments from dataset`)
      
      if (playersList.length === 0) {
        console.warn('No players loaded! Check if Flask backend is running and dataset is connected.')
      } else {
        console.log('Sample players:', playersList.slice(0, 5))
      }
      
      setPlayers(playersList)
      setTournaments(tournamentsList)
    } catch (error) {
      console.error('Error loading initial data:', error)
      console.error('Make sure Flask backend is running on http://localhost:5000')
      
      // More helpful error message
      const errorMsg = error.message || 'Unknown error'
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        alert(
          '❌ Cannot connect to Flask backend!\n\n' +
          'Please start the Flask backend:\n' +
          '1. Open a terminal\n' +
          '2. Run: python app.py\n' +
          '3. Wait for "Running on http://127.0.0.1:5000"\n' +
          '4. Refresh this page\n\n' +
          'Or double-click: start_backend.bat'
        )
      } else {
        alert(`Failed to load players: ${errorMsg}\n\nMake sure Flask backend is running on http://localhost:5000`)
      }
    }
  }

  const handleSurfaceChange = (surface) => {
    // Update theme based on surface
    const themeMap = {
      'Hard': 'hard',
      'Clay': 'clay',
      'Grass': 'grass'
    }
    setSurfaceTheme(themeMap[surface] || 'hard')
  }

  const handlePrediction = async (formData) => {
    setLoading(true)
    try {
      const result = await predictMatch(formData)
      setPredictionResult(result)
      
      // Update theme based on surface from form
      handleSurfaceChange(formData.surface)
      
      // Load stats for both players
      const [stats1, stats2] = await Promise.all([
        formData.player1 ? getPlayerStats(formData.player1).catch(() => null) : Promise.resolve(null),
        formData.player2 ? getPlayerStats(formData.player2).catch(() => null) : Promise.resolve(null)
      ])
      
      setPlayer1Stats(stats1)
      setPlayer2Stats(stats2)
    } catch (error) {
      console.error('Prediction error:', error)
      alert(`Prediction failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerSelect = async (playerName, playerNumber) => {
    if (playerName) {
      try {
        const stats = await getPlayerStats(playerName)
        if (playerNumber === 1) {
          setPlayer1Stats(stats)
          setPlayer1Name(playerName)
        } else if (playerNumber === 2) {
          setPlayer2Stats(stats)
          setPlayer2Name(playerName)
        }
      } catch (error) {
        console.error('Error loading player stats:', error)
      }
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className={`absolute inset-0 animate-gradient surface-theme-${surfaceTheme}`}></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 animate-pulse-slow"></div>
      </div>
      
      <div className="container relative z-10">
      <Header />
      <main className="main-content">
        <PredictionForm
          players={players}
          tournaments={tournaments}
          onPredict={handlePrediction}
          onPlayerSelect={handlePlayerSelect}
          onSurfaceChange={handleSurfaceChange}
        />
        
        {predictionResult && (
          <ResultsSection result={predictionResult} />
        )}
        
        <StatsSection 
          player1Stats={player1Stats} 
          player2Stats={player2Stats}
          player1Name={predictionResult?.player1 || player1Name}
          player2Name={predictionResult?.player2 || player2Name}
        />
      </main>
      
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} AI Tennis Predictor. Powered by Machine Learning.</p>
      </footer>
      
      {loading && <LoadingOverlay />}
      </div>
    </div>
  )
}

export default App

