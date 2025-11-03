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

    // Return HTML dengan OG tags
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>My Neynar Score: ${scoreDisplay}</title>
          
          <meta property="og:title" content="My Neynar Score: ${scoreDisplay}" />
          <meta property="og:description" content="@${user.username} | FID: ${user.fid}" />
          <meta property="og:image" content="${user.pfp_url}" />
          <meta property="og:type" content="website" />
          
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="My Neynar Score: ${scoreDisplay}" />
          <meta name="twitter:description" content="@${user.username} | FID: ${user.fid}" />
          <meta name="twitter:image" content="${user.pfp_url}" />
        </head>
        <body>
          <h1>My Neynar Score: ${scoreDisplay}</h1>
          <p>@${user.username} | FID: ${user.fid}</p>
          <p>Check your score at: https://neynar.vercel.app/?fid=${fid}</p>
        </body>
      </html>
    `

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.status(200).send(html)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
