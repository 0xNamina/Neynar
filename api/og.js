import { createCanvas } from 'canvas'
import fetch from 'node-fetch'

export default async function handler(req, res) {
  const { fid } = req.query

  if (!fid) {
    return res.status(400).json({ error: 'FID required' })
  }

  try {
    // Fetch user data dari Neynar API
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      {
        headers: {
          'accept': 'application/json',
          'api_key': 'NEYNAR_API_DOCS'
        }
      }
    )

    if (!response.ok) {
      return res.status(404).json({ error: 'User not found' })
    }

    const data = await response.json()
    const user = data.users[0]

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const score = user.experimental?.neynar_user_score || 0
    const scoreDisplay = score.toFixed(2)

    // Determine score label dan warna
    let scoreLabel = 'Low'
    let scoreColor = '#EF4444'
    if (score >= 0.9) {
      scoreLabel = 'Excellent'
      scoreColor = '#22C55E'
    } else if (score >= 0.7) {
      scoreLabel = 'Good'
      scoreColor = '#3B82F6'
    } else if (score >= 0.5) {
      scoreLabel = 'Average'
      scoreColor = '#EAB308'
    }

    // Determine percentile
    let percentile = 'Below avg'
    if (score >= 0.9) {
      percentile = 'Top 2.5k'
    } else if (score >= 0.7) {
      percentile = 'Top 27.5k'
    }

    // Create canvas
    const width = 1200
    const height = 630
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#6200EA')
    gradient.addColorStop(1, '#5E35B1')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Top section - Profile
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, 250)

    // Profile picture (circle)
    const profileSize = 120
    const profileX = width / 2 - profileSize / 2
    const profileY = 50
    
    ctx.save()
    ctx.beginPath()
    ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2, 0, Math.PI * 2)
    ctx.clip()
    
    // Try to load profile image
    try {
      const img = new (await import('canvas')).Image()
      img.src = user.pfp_url
      ctx.drawImage(img, profileX, profileY, profileSize, profileSize)
    } catch (e) {
      // Fallback: draw placeholder circle
      ctx.fillStyle = '#6200EA'
      ctx.fillRect(profileX, profileY, profileSize, profileSize)
    }
    ctx.restore()

    // Display name
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 36px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(user.display_name || user.username, width / 2, profileY + profileSize + 50)

    // Username
    ctx.fillStyle = '#666666'
    ctx.font = '24px Arial'
    ctx.fillText(`@${user.username}`, width / 2, profileY + profileSize + 90)

    // Bottom section - Stats
    // Score display
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 250, width, height - 250)

    ctx.fillStyle = '#999999'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('NEYNAR SCORE', width / 2, 310)

    // Score number
    ctx.fillStyle = scoreColor
    ctx.font = 'bold 80px Arial'
    ctx.fillText(scoreDisplay, width / 2, 420)

    // Score label badge
    ctx.fillStyle = '#F3E8FF'
    ctx.fillRect(width / 2 - 80, 440, 160, 50)
    ctx.fillStyle = '#6200EA'
    ctx.font = 'bold 20px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(scoreLabel, width / 2, 475)

    // Stats row
    const statsY = 530
    
    // FID box
    ctx.fillStyle = '#F5F5F5'
    ctx.fillRect(100, statsY, 400, 80)
    ctx.fillStyle = '#666666'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('FID', 300, statsY + 25)
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 32px Arial'
    ctx.fillText(user.fid.toString(), 300, statsY + 60)

    // Percentile box
    ctx.fillStyle = '#F5F5F5'
    ctx.fillRect(700, statsY, 400, 80)
    ctx.fillStyle = '#666666'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('PERCENTILE', 900, statsY + 25)
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 32px Arial'
    ctx.fillText(percentile, 900, statsY + 60)

    // Convert to PNG and send
    const buffer = canvas.toBuffer('image/png')
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.status(200).send(buffer)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
