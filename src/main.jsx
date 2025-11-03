import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import NeynarScoreChecker from './NeynarScoreChecker'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NeynarScoreChecker />
  </React.StrictMode>,
)

// Call ready() to hide splash screen saat SDK loaded
if (window.farcasterSdk) {
  window.farcasterSdk.actions.ready().catch(err => {
    console.log('Not in Farcaster Mini App context:', err)
  })
}
