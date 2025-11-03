import { ImageResponse } from '@vercel/og'

export default async function handler(req) {
  const { fid } = req.nextUrl.searchParams

  if (!fid) {
    return new Response('FID required', { status: 400 })
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
      return new Response('User not found', { status: 404 })
    }

    const data = await response.json()
    const user = data.users[0]

    if (!user) {
      return new Response('User not found', { status: 404 })
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

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #6200EA 0%, #5E35B1 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Top White Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              background: '#FFFFFF',
              padding: '40px',
            }}
          >
            {/* Profile Picture */}
            <img
              src={user.pfp_url}
              alt="profile"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                marginBottom: '20px',
                border: '4px solid #6200EA',
              }}
            />

            {/* Display Name */}
            <div
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#000000',
                marginBottom: '8px',
              }}
            >
              {user.display_name || user.username}
            </div>

            {/* Username */}
            <div
              style={{
                fontSize: '24px',
                color: '#666666',
              }}
            >
              @{user.username}
            </div>
          </div>

          {/* Bottom Purple Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              padding: '40px',
              gap: '20px',
            }}
          >
            {/* Score Label */}
            <div
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#CCCCCC',
                letterSpacing: '2px',
              }}
            >
              NEYNAR SCORE
            </div>

            {/* Score Number */}
            <div
              style={{
                fontSize: '80px',
                fontWeight: 'bold',
                color: scoreColor,
              }}
            >
              {scoreDisplay}
            </div>

            {/* Score Label Badge */}
            <div
              style={{
                background: '#F3E8FF',
                color: '#6200EA',
                padding: '8px 24px',
                borderRadius: '20px',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              {scoreLabel}
            </div>

            {/* Stats Row */}
            <div
              style={{
                display: 'flex',
                gap: '40px',
                marginTop: '20px',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              {/* FID */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '20px 40px',
                  borderRadius: '12px',
                  minWidth: '200px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: '#CCCCCC',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                  }}
                >
                  FID
                </div>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                  }}
                >
                  {user.fid}
                </div>
              </div>

              {/* Percentile */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '20px 40px',
                  borderRadius: '12px',
                  minWidth: '200px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: '#CCCCCC',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                  }}
                >
                  PERCENTILE
                </div>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                  }}
                >
                  {percentile}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response('Error generating image', { status: 500 })
  }
}
