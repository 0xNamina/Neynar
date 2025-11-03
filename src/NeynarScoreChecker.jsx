import React, { useState } from 'react';
import { Search, Share2, User, Award, Hash } from 'lucide-react';

export default function NeynarScoreChecker() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Auto-load FID dari URL parameter saat component mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fid = params.get('fid');
    if (fid) {
      setInput(fid);
      checkScoreWithFid(fid);
    }
  }, []);

  const checkScoreWithFid = async (fid) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
        headers: {
          'accept': 'application/json',
          'api_key': 'NEYNAR_API_DOCS'
        }
      });

      if (!response.ok) {
        throw new Error('User not found');
      }

      const data = await response.json();
      const user = data.users[0];

      if (!user) {
        throw new Error('User not found');
      }

      setResult({
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        score: user.experimental?.neynar_user_score || 0,
      });
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkScore = async () => {
    if (!input.trim()) {
      setError('Please enter FID or username');
      return;
    }

    const isFid = /^\d+$/.test(input.trim());
    
    if (isFid) {
      checkScoreWithFid(input.trim());
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`https://api.neynar.com/v2/farcaster/user/by_username?username=${input.trim()}`, {
        headers: {
          'accept': 'application/json',
          'api_key': 'NEYNAR_API_DOCS'
        }
      });

      if (!response.ok) {
        throw new Error('User not found');
      }

      const data = await response.json();
      const user = data.user;

      if (!user) {
        throw new Error('User not found');
      }

      setResult({
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        score: user.experimental?.neynar_user_score || 0,
      });
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!result) return;

    const scoreDisplay = result.score.toFixed(2);
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?fid=${result.fid}`;
    
    const text = `🎯 My Neynar Score: ${scoreDisplay}\n\n@${result.username} | FID: ${result.fid}\n\nCheck your score:`;
    
    // Gunakan Farcaster intent untuk share dengan URL yang membawa parameter FID
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`;
    window.open(warpcastUrl, '_blank');
  };

  const getScoreColor = (score) => {
    if (score >= 0.9) return 'text-green-500';
    if (score >= 0.7) return 'text-blue-500';
    if (score >= 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.7) return 'Good';
    if (score >= 0.5) return 'Average';
    return 'Low';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Neynar Score Checker</h1>
          <p className="text-purple-200">Check your Farcaster account quality</p>
        </div>

        {/* Search Box */}
        {!result && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                FID atau Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkScore()}
                  placeholder="Example: 3 or dwr.eth"
                  className="w-full px-4 py-3 pr-12 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={checkScore}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Loading...' : 'Check Score'}
            </button>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white text-center">
              <img
                src={result.pfpUrl}
                alt={result.displayName}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
              />
              <h2 className="text-2xl font-bold mb-1">{result.displayName}</h2>
              <p className="text-purple-200">@{result.username}</p>
            </div>

            {/* Score Display */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="mb-2">
                  <span className="text-gray-600 text-sm font-semibold">NEYNAR SCORE</span>
                </div>
                <div className={`text-6xl font-bold ${getScoreColor(result.score)} mb-2`}>
                  {result.score.toFixed(2)}
                </div>
                <div className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                  {getScoreLabel(result.score)}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Hash size={16} className="text-gray-600 mr-1" />
                    <span className="text-gray-600 text-sm">FID</span>
                  </div>
                  <div className="font-bold text-lg">{result.fid}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Award size={16} className="text-gray-600 mr-1" />
                    <span className="text-gray-600 text-sm">Percentile</span>
                  </div>
                  <div className="font-bold text-lg">
                    {result.score >= 0.9 ? 'Top 2.5k' : result.score >= 0.7 ? 'Top 27.5k' : 'Below avg'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleShare}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  <Share2 size={20} className="mr-2" />
                  Share on Farcaster
                </button>
                
                <button
                  onClick={() => {
                    setResult(null);
                    setInput('');
                    setError('');
                  }}
                  className="w-full bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Check Another User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-center text-white text-sm mt-6 opacity-80">
          <p>Scores updated weekly</p>
          <p className="mt-1">Powered by Neynar API</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
