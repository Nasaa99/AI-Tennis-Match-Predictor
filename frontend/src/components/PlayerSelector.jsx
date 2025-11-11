import React, { useState, useRef, useEffect } from 'react'

function PlayerSelector({ 
  label, 
  players = [], 
  selectedPlayer, 
  onSelect, 
  topPlayers = [],
  placeholder = "Search or select a player..."
}) {
  const [searchTerm, setSearchTerm] = useState(selectedPlayer || '')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Debug: Log when players change
  useEffect(() => {
    if (players && players.length > 0) {
      console.log(`PlayerSelector (${label}): ${players.length} players available`)
    } else {
      console.warn(`PlayerSelector (${label}): No players available!`)
    }
  }, [players, label])

  // Update search term when selectedPlayer changes externally
  useEffect(() => {
    if (selectedPlayer) {
      setSearchTerm(selectedPlayer)
    } else if (!searchTerm) {
      // Keep current search term if no selection
    }
  }, [selectedPlayer])

  // Filter players based on search term (case insensitive)
  useEffect(() => {
    if (!players || players.length === 0) {
      setFilteredPlayers([])
      return
    }

    if (searchTerm === '') {
      // When empty, show all players (but we'll show top players first)
      setFilteredPlayers(players)
    } else {
      // Filter players that match search term (case insensitive)
      const searchLower = searchTerm.toLowerCase().trim()
      const filtered = players.filter(player => {
        if (!player) return false
        return player.toLowerCase().includes(searchLower)
      })
      setFilteredPlayers(filtered)
    }
  }, [searchTerm, players])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    // Always show dropdown when typing
    setIsOpen(true)
  }

  const handlePlayerClick = (player) => {
    setSearchTerm(player)
    setIsOpen(false)
    onSelect(player)
  }

  const handleTopPlayerClick = (player) => {
    setSearchTerm(player)
    setIsOpen(false)
    onSelect(player)
  }

  const handleInputFocus = (e) => {
    // Always show dropdown on focus
    setIsOpen(true)
    // If there's a selected player, select all text so user can easily type over it
    if (selectedPlayer && searchTerm === selectedPlayer) {
      e.target.select()
    }
  }

  const handleKeyDown = (e) => {
    // Close dropdown on Escape
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
    // Keep dropdown open for other keys
    else if (e.key !== 'Enter' && e.key !== 'Tab') {
      setIsOpen(true)
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    setIsOpen(true) // Keep dropdown open to show top players
    onSelect('')
  }

  return (
    <div className="player-selector">
      <label htmlFor={`player-selector-${label}`}>{label}</label>
      <div className="player-selector-wrapper">
        <div className="player-input-container">
          <i className="fas fa-search player-search-icon"></i>
          <input
            ref={inputRef}
            id={`player-selector-${label}`}
            type="text"
            className="player-search-input"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
          />
          {searchTerm && (
            <button
              type="button"
              className="player-clear-btn"
              onClick={handleClear}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {isOpen && players.length > 0 && (
          <div ref={dropdownRef} className="player-dropdown">
            {/* Show top players when search is empty */}
            {searchTerm === '' && topPlayers.length > 0 && (
              <div className="top-players-section">
                <div className="top-players-header">
                  <i className="fas fa-star"></i>
                  <span>Top Players</span>
                </div>
                <div className="top-players-list">
                  {topPlayers.map(player => (
                    <button
                      key={player}
                      type="button"
                      className="top-player-chip"
                      onClick={() => handleTopPlayerClick(player)}
                    >
                      {player}
                    </button>
                  ))}
                </div>
                {players.length > topPlayers.length && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#718096' }}>
                    Or search for any player below...
                  </div>
                )}
              </div>
            )}

            {/* Show search results when typing */}
            {searchTerm !== '' ? (
              <div className="player-list">
                {filteredPlayers.length > 0 ? (
                  <>
                    {filteredPlayers.slice(0, 15).map(player => (
                      <div
                        key={player}
                        className={`player-option ${selectedPlayer === player ? 'selected' : ''}`}
                        onClick={() => handlePlayerClick(player)}
                      >
                        <span>{player}</span>
                        {selectedPlayer === player && (
                          <i className="fas fa-check"></i>
                        )}
                      </div>
                    ))}
                    {filteredPlayers.length > 15 && (
                      <div className="player-option-more">
                        +{filteredPlayers.length - 15} more players...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="player-option-empty">
                    <div>No players found matching "{searchTerm}"</div>
                    {players.length === 0 && (
                      <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#e53e3e' }}>
                        ⚠️ No players loaded. Check backend connection.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Show all players when no search term (fallback if no top players) */
              topPlayers.length === 0 && (
                <div className="player-list">
                  {filteredPlayers.slice(0, 15).map(player => (
                    <div
                      key={player}
                      className={`player-option ${selectedPlayer === player ? 'selected' : ''}`}
                      onClick={() => handlePlayerClick(player)}
                    >
                      <span>{player}</span>
                      {selectedPlayer === player && (
                        <i className="fas fa-check"></i>
                      )}
                    </div>
                  ))}
                  {filteredPlayers.length > 15 && (
                    <div className="player-option-more">
                      +{filteredPlayers.length - 15} more players...
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* Show warning if no players loaded */}
        {players.length === 0 && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px 12px', 
            background: '#fed7d7', 
            border: '1px solid #e53e3e', 
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: '#c53030'
          }}>
            ⚠️ No players available. Make sure Flask backend is running and dataset is connected.
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayerSelector

