import React from 'react'

function PlayerStatsCard({ playerName, stats, isPlayer1 }) {
  if (!stats) {
    return (
      <div className="player-stats-card">
        <div className="player-stats-header">
          <h3>{playerName || `Player ${isPlayer1 ? '1' : '2'}`}</h3>
        </div>
        <div className="player-stats-placeholder">
          <p>No statistics available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="player-stats-card">
      <div className="player-stats-header">
        <h3>{playerName || `Player ${isPlayer1 ? '1' : '2'}`}</h3>
      </div>
      <div className="stats-grid-compact">
        <div className="stat-card-compact">
          <div className="stat-icon">
            <i className="fas fa-trophy"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_matches || '-'}</div>
            <div className="stat-label">Total Matches</div>
          </div>
        </div>
        
        <div className="stat-card-compact">
          <div className="stat-icon">
            <i className="fas fa-medal"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {stats.win_rate ? `${(stats.win_rate * 100).toFixed(1)}%` : '-'}
            </div>
            <div className="stat-label">Win Rate</div>
          </div>
        </div>
        
          <div className="stat-card-compact">
            <div className="stat-icon">
              <i className="fas fa-sort-numeric-up"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {stats.current_rank ? stats.current_rank : (stats.avg_rank ? Math.round(stats.avg_rank) : '-')}
              </div>
              <div className="stat-label">Current Ranking</div>
            </div>
          </div>
        
        <div className="stat-card-compact">
          <div className="stat-icon">
            <i className="fas fa-court-sport"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.favorite_surface || '-'}</div>
            <div className="stat-label">Best Surface</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsSection({ player1Stats, player2Stats, player1Name, player2Name }) {
  const hasAnyStats = player1Stats || player2Stats

  if (!hasAnyStats) {
    return (
      <section className="stats-section">
        <div className="card">
          <h2><i className="fas fa-chart-bar"></i> Player Statistics</h2>
          <p style={{ textAlign: 'center', color: '#718096' }}>
            Select players to view their statistics
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="stats-section">
      <div className="card">
        <h2><i className="fas fa-chart-bar"></i> Player Statistics Comparison</h2>
        
        <div className="players-stats-comparison">
          <PlayerStatsCard 
            playerName={player1Name} 
            stats={player1Stats} 
            isPlayer1={true}
          />
          
          <div className="stats-vs-divider">
            <span>VS</span>
          </div>
          
          <PlayerStatsCard 
            playerName={player2Name} 
            stats={player2Stats} 
            isPlayer1={false}
          />
        </div>
      </div>
    </section>
  )
}

export default StatsSection

