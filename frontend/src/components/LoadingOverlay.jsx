import React from 'react'

function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <i className="fas fa-tennis-ball fa-spin"></i>
        <p>Analyzing match data...</p>
      </div>
    </div>
  )
}

export default LoadingOverlay

