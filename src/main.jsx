import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import NeynarScoreChecker from './NeynarScoreChecker'

// Import Farcaster SDK
import { sdk } from '@farcaster/miniapp-sdk'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NeynarScoreChecker />
  </React.StrictMode>,
)

// Call ready() to hide splash screen
sdk.actions.ready().catch(err => {
  console.log('Not in Farcaster Mini App context:', err)
  // App masih bisa jalan normal di browser biasa
})
