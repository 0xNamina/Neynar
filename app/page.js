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
    
      
        
          
            Neynar Score Checker
          
          
            Cek kualitas akun Farcaster dengan Neynar Score
          
        

        
          
            
              
                FID atau Username
              
              
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Contoh: 3 atau dwr.eth"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
                
              
            
            
              {loading ? 'Mencari...' : 'Cek Score'}
            
          

          {error && (
            
              
              {error}
            
          )}
        

        {userData && (
          
            
              
                
                
                  {userData.displayName}
                  @{userData.username}
                  FID: {userData.fid}
                
              
            

            
              
                Neynar Score
                
                  
                    {(userData.score * 100).toFixed(1)}
                  
                  
                    / 100
                    
                      {getScoreLabel(userData.score)}
                    
                  
                
                
                
                  = 0.9 ? 'bg-green-500' :
                      userData.score >= 0.7 ? 'bg-blue-500' :
                      userData.score >= 0.5 ? 'bg-yellow-500' :
                      'bg-orange-500'
                    }`}
                    style={{ width: `${userData.score * 100}%` }}
                  />
                
              

              
                
                  
                    {userData.followerCount.toLocaleString()}
                  
                  Followers
                
                
                  
                    {userData.followingCount.toLocaleString()}
                  
                  Following
                
              

              
                
                  
                  
                    Tentang Neynar Score:
                    Score diperbarui setiap minggu dan mencerminkan kualitas akun berdasarkan interaksi di Farcaster. Score 0.9+ sangat bagus, 0.7+ bagus sekali.
                  
                
              

              
                
                Share Score di Warpcast
              
            
          
        )}

        {!userData && !loading && (
          
            
              
              Cara Menggunakan:
            
            
              
                1.
                Masukkan FID (angka) atau username Farcaster
              
              
                2.
                Klik tombol "Cek Score" untuk melihat hasil
              
              
                3.
                Share score kamu ke Warpcast!
              
            
          
        )}
      
    
  );
}
