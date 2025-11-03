import React, { useState } from 'react';
import { Search, Share2, User, Award, Hash } from 'lucide-react';

export default function NeynarScoreChecker() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const checkScore = async () => {
    if (!input.trim()) {
      setError('Masukkan FID atau username');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const isFid = /^\d+$/.test(input.trim());
      const endpoint = isFid 
        ? `https://api.neynar.com/v2/farcaster/user/bulk?fids=${input.trim()}`
        : `https://api.neynar.com/v2/farcaster/user/by_username?username=${input.trim()}`;

      const response = await fetch(endpoint, {
        headers: {
          'accept': 'application/json',
          'api_key': 'NEYNAR_API_DOCS'
        }
      });

      if (!response.ok) {
        throw new Error('User tidak ditemukan');
      }

      const data = await response.json();
      const user = isFid ? data.users[0] : data.user;

      if (!user) {
        throw new Error('User tidak ditemukan');
      }

      setResult({
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        score: user.experimental?.neynar_user_score || 0,
        followerCount: user.follower_count,
        followingCount: user.following_count
      });
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!result) return;

    const scorePercentage = (result.score * 100).toFixed(1);
    const text = `🎯 Neynar Score saya: ${scorePercentage}%\n\n@${result.username} | FID: ${result.fid}\n\nCek score kamu di:`;
    const url = window.location.href;
    
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Neynar Score</h1>
