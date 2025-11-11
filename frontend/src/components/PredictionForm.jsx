import React, { useState, useMemo, useEffect } from 'react'
import PlayerSelector from './PlayerSelector'

function PredictionForm({ players, tournaments, onPredict, onPlayerSelect, onSurfaceChange }) {
  const [formData, setFormData] = useState({
    player1: '',
    player2: '',
    tournament: tournaments[0] || 'ATP Masters',
    surface: 'Hard'
    // Date removed - not used in predictions anymore
  })

  // Notify parent when surface changes
  useEffect(() => {
    if (onSurfaceChange) {
      onSurfaceChange(formData.surface)
    }
  }, [formData.surface, onSurfaceChange])

  // Define top players (you can customize this list)
  const topPlayers = useMemo(() => {
    const commonTopPlayers = [
      'Djokovic N.', 'Alcaraz C.', 'Sinner J.', 'Medvedev D.', 
      'Tsitsipas S.', 'Zverev A.', 'Rublev A.', 'Rune H.',
      'Fritz T.', 'Paul T.', 'Tiafoe F.', 'Norrie C.',
      'Hurkacz H.', 'De Minaur A.', 'Dimitrov G.', 'Musetti L.'
    ]
    
    // Filter to only include players that exist in the dataset
    return commonTopPlayers.filter(p => players.includes(p)).slice(0, 12)
  }, [players])

  const handlePlayerSelect = (player, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: player
    }))
    
    if (player) {
      // Pass player number (1 or 2) to load correct stats
      const playerNumber = field === 'player1' ? 1 : 2
      onPlayerSelect(player, playerNumber)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.player1 || !formData.player2) {
      alert('Please select both players')
      return
    }
    
    if (formData.player1 === formData.player2) {
      alert('Please select different players')
      return
    }
    
    onPredict(formData)
  }

  return (
    <section className="prediction-section">
      <div className="card">
        <h2><i className="fas fa-crystal-ball"></i> Match Prediction</h2>
        
        <form className="prediction-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <PlayerSelector
              label="Player 1"
              players={players}
              selectedPlayer={formData.player1}
              onSelect={(player) => handlePlayerSelect(player, 'player1')}
              topPlayers={topPlayers}
            />
            
            <div className="vs-divider">
              <span>VS</span>
            </div>
            
            <PlayerSelector
              label="Player 2"
              players={players}
              selectedPlayer={formData.player2}
              onSelect={(player) => handlePlayerSelect(player, 'player2')}
              topPlayers={topPlayers}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tournament">Tournament</label>
              <select
                id="tournament"
                name="tournament"
                value={formData.tournament}
                onChange={handleChange}
              >
                {tournaments.map(tournament => (
                  <option key={tournament} value={tournament}>{tournament}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="surface">Surface</label>
              <select
                id="surface"
                name="surface"
                value={formData.surface}
                onChange={handleChange}
              >
                <option value="Hard">Hard Court</option>
                <option value="Clay">Clay Court</option>
                <option value="Grass">Grass Court</option>
              </select>
            </div>
          </div>

          <button type="submit" className="predict-btn">
            <i className="fas fa-play"></i>
            Predict Match Outcome
          </button>
        </form>
      </div>
    </section>
  )
}

export default PredictionForm

