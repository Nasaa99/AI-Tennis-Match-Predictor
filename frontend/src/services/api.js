const API_BASE_URL = '/api'

export const getPlayers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/players`)
    if (!response.ok) {
      throw new Error(`Failed to fetch players: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    console.log('API Response - Players:', data)
    return data
  } catch (error) {
    console.error('Error fetching players:', error)
    throw error
  }
}

export const getTournaments = async () => {
  const response = await fetch(`${API_BASE_URL}/tournaments`)
  if (!response.ok) {
    throw new Error('Failed to fetch tournaments')
  }
  return response.json()
}

export const predictMatch = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to predict match')
  }
  
  return response.json()
}

export const getPlayerStats = async (playerName) => {
  const response = await fetch(`${API_BASE_URL}/player-stats/${encodeURIComponent(playerName)}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch player stats')
  }
  return response.json()
}

