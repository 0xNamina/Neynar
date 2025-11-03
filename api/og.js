export const config = {
  runtime: 'edge',
}

export default async function handler(request) {
  const { searchParams } = new URL(request.url)
  const fid = searchParams.get('fid')

  if (!fid) {
    return new Response('FID required', { status: 400 })
  }

  try {
    // Fetch user data
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
      throw new Error('User not found')
    }

    const data = await response.json()
    const user = data.users[0]

    if (!user) {
      throw new Error('User not found')
    }

    const score = user.experimental?.neynar_user_score || 0
    const scoreDisplay = score.toFixed(2)

    // Determine score label
    let scoreLabel = 'Low'
    if (score >= 0.9) scoreLabel = 'Excellent'
    else if (score >= 0.7) scoreLabel = 'Good'
    else if (score >= 0.5) scoreLabel = 'Average'

    // Determine percentile
    let percentile = 'Below avg'
    if (score >= 0.9) percentile = 'Top 2.5k'
    else if (score >= 0.7) percentile = 'Top 27.5k'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${user.display_name} - Neynar Score: ${scoreDisplay}</title>
          
          <meta property="og:title" content="${user.display_name} - Neynar Score: ${scoreDisplay}" />
          <meta property="og:description" content="@${user.username} (FID: ${user.fid}) • Score: ${scoreDisplay} • ${scoreLabel}" />
          <meta property="og:image" content="${user.pfp_url}" />
          <meta property="og:image:width" content="1024" />
          <meta property="og:image:height" content="1024" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://neynar.vercel.app/?fid=${fid}" />
          
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${user.display_name} - Neynar Score: ${scoreDisplay}" />
          <meta name="twitter:description" content="@${user.username} (FID: ${user.fid}) • Score: ${scoreDisplay} • ${scoreLabel}" />
          <meta name="twitter:image" content="${user.pfp_url}" />
          
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="${user.pfp_url}" />
        </head>
        <body>
          <h1>${user.display_name}</h1>
          <p>@${user.username}</p>
          <p>FID: ${user.fid}</p>
          <p>Neynar Score: ${scoreDisplay}</p>
          <p>Label: ${scoreLabel}</p>
          <p>Percentile: ${percentile}</p>
        </body>
      </html>
    `

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error:', error)
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Error</title>
          <meta property="og:title" content="Neynar Score Checker" />
          <meta property="og:description" content="Check your Farcaster account quality score" />
        </head>
        <body>
          <p>Error: ${error.message}</p>
        </body>
      </html>
    `
    return new Response(errorHtml, { status: 500 })
  }
}
