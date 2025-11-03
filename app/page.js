'use client';

import React, { useState } from 'react';
import { Search, Share2, User, CheckCircle, XCircle } from 'lucide-react';

export default function NeynarScoreChecker() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  const fetchUserData = async () => {
    if (!input.trim()) {
      setError('Masukkan FID atau username Farcaster');
      return;
    }

    setLoading(true);
    setError('');
    setUserData(null);

    try {
      // Panggil API route kita sendiri (bukan langsung ke Neynar)
      const response = await fetch(`/api/neynar?query=${encodeURIComponent(input.trim())}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mengambil data');
      }

      const data = await response.json();
      setUserData(data);

    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat mengambil data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchUserData();
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-blue-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.7) return 'Very Good';
    if (score >= 0.5) return 'Good';
    if (score >= 0.3) return 'Fair';
    return 'Low';
  };

  const handleShare = () => {
    if (!userData) return;
    
    const text = `Check out my Neynar Score: ${(userData.score * 100).toFixed(1)}%! 🎯\n\nUsername: @${userData.username}\nScore: ${getScoreLabel(userData.score)}\n\nCheck yours at:`;
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
    
    window.location.href = shareUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            Neynar Score Checker
          </h1>
          <p className="text-gray-600">
            Cek kualitas akun Farcaster dengan Neynar Score
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FID atau Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Contoh: 3 atau dwr.eth"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
                <Search className="absolute right-4 top-3.5 text-gray-400" size={20} />
              </div>
            </div>
            <button
              onClick={fetchUserData}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Mencari...' : 'Cek Score'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
              <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {userData && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center space-x-4">
                <img
                  src={userData.pfp}
                  alt={userData.displayName}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{userData.displayName}</h2>
                  <p className="text-purple-100">@{userData.username}</p>
                  <p className="text-sm text-purple-100 mt-1">FID: {userData.fid}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">Neynar Score</p>
                <div className="flex items-center justify-center space-x-3">
                  <div className={`text-6xl font-bold ${getScoreColor(userData.score)}`}>
                    {(userData.score * 100).toFixed(1)}
                  </div>
                  <div className="text-left">
                    <p className="text-2xl text-gray-400">/ 100</p>
                    <p className={`text-sm font-semibold ${getScoreColor(userData.score)}`}>
                      {getScoreLabel(userData.score)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      userData.score >= 0.9 ? 'bg-green-500' :
                      userData.score >= 0.7 ? 'bg-blue-500' :
                      userData.score >= 0.5 ? 'bg-yellow-500' :
                      'bg-orange-500'
                    }`}
                    style={{ width: `${userData.score * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-800">
                    {userData.followerCount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-800">
                    {userData.followingCount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Following</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Tentang Neynar Score:</p>
                    <p>Score diperbarui setiap minggu dan mencerminkan kualitas akun berdasarkan interaksi di Farcaster. Score 0.9+ sangat bagus, 0.7+ bagus sekali.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2"
              >
                <Share2 size={20} />
                <span>Share Score di Warpcast</span>
              </button>
            </div>
          </div>
        )}

        {!userData && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <User size={20} className="text-purple-600" />
              <span>Cara Menggunakan:</span>
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-purple-600 font-bold">1.</span>
                <span>Masukkan FID (angka) atau username Farcaster</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-600 font-bold">2.</span>
                <span>Klik tombol "Cek Score" untuk melihat hasil</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-600 font-bold">3.</span>
                <span>Share score kamu ke Warpcast!</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
