import React from 'react'

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <i className="fas fa-tennis-ball"></i>
          <h1>AI Tennis Predictor</h1>
        </div>
        <p className="subtitle">Predict tennis match outcomes with machine learning</p>
      </div>
    </header>
  )
}

export default Header

