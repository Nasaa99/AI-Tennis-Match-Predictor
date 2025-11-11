import React from 'react'

function ResultsSection({ result }) {
  const isPlayer1Winner = result.prediction === 1
  const confidencePercent = result.confidence * 100

  return (
    <section className="results-section">
      <div className="card">
        <h2><i className="fas fa-chart-line"></i> Prediction Results</h2>
        
        <div className="results-content">
          <div className="match-info">
            <div className="match-header">
              <span>{result.tournament}</span>
              <span>{result.surface}</span>
            </div>
            
            <div className="players-matchup">
              <div className={`player-card ${isPlayer1Winner ? 'winner' : ''}`}>
                <div className="player-name">{result.player1}</div>
                <div className="player-probability">
                  {((result.player1_probability !== undefined ? result.player1_probability : result.probability) * 100).toFixed(1)}%
                </div>
                <div className="player-stats"></div>
              </div>
              
              <div className="vs-section">
                <div className="vs-label">VS</div>
              </div>
              
              <div className={`player-card ${!isPlayer1Winner ? 'winner' : ''}`}>
                <div className="player-name">{result.player2}</div>
                <div className="player-probability">
                  {((result.player2_probability !== undefined ? result.player2_probability : (1 - result.probability)) * 100).toFixed(1)}%
                </div>
                <div className="player-stats"></div>
              </div>
            </div>
          </div>

          <div className="prediction-details">
            <div className="winner-prediction">
              <div className="winner-label">Predicted Winner</div>
              <div className="winner-name">{result.winner}</div>
              <div className="probability">{(result.probability * 100).toFixed(1)}%</div>
            </div>
            
            <div className="explanation">
              <h3>Analysis</h3>
              <p>{result.explanation}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ResultsSection

