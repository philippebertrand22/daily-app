import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LeaderboardStyles.css'; // Import our custom CSS

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLeaderboard = () => {
      setLoading(true);
      
      try {
        /**
        // Mock users for demo
        const mockUsers = [
          { id: 'user1', username: 'Alex', avatarClass: 'blue-avatar' },
          { id: 'user2', username: 'Jordan', avatarClass: 'purple-avatar' },
          { id: 'user3', username: 'Taylor', avatarClass: 'pink-avatar' },
          { id: 'user4', username: 'Riley', avatarClass: 'green-avatar' },
          { id: 'user5', username: 'You', avatarClass: 'indigo-avatar', isCurrentUser: true }
        ];
        
        // Generate random scores
        const leaderboard = mockUsers.map(user => {
          const points = Math.floor(Math.random() * 450) + 50;
          const correctGuesses = Math.floor(Math.random() * 45) + 5;
          
          return {
            ...user,
            points,
            correctGuesses
          };
        });
        **/
        
        // Sort by points
        //leaderboard.sort((a, b) => b.points - a.points);
        
        //setLeaderboardData(leaderboard);
      } catch (err) {
        console.error("Error loading leaderboard:", err);
        setError("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    };
    
    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="leaderboard-container">
        <h1 className="leaderboard-title">Leaderboard</h1>
        <div className="leaderboard-card">
          <div className="leaderboard-content" style={{textAlign: 'center'}}>
            <p>Loading leaderboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <h1 className="leaderboard-title">Leaderboard</h1>
        <div className="leaderboard-card">
          <div className="leaderboard-content" style={{textAlign: 'center'}}>
            <p style={{color: '#dc2626', fontWeight: 500, marginBottom: '1rem'}}>{error}</p>
            <Link to="/" className="back-button">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">Leaderboard</h1>
      
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <h2 className="header-title">Top Players</h2>
        </div>
        
        <div className="leaderboard-content">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th className="text-right">Points</th>
                <th className="text-right">Correct Guesses</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((user, index) => (
                <tr 
                  key={user.id} 
                  className={user.isCurrentUser ? 'highlighted-row' : ''}
                >
                  <td>
                    {index === 0 && <span className="crown-icon">👑</span>} {index + 1}
                  </td>
                  <td className="player-cell">
                    <div className={`avatar ${user.avatarClass}`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="player-name">
                      {user.username}
                      {user.isCurrentUser && <span className="you-tag">You</span>}
                    </span>
                  </td>
                  <td className="points-cell">
                    {user.points} pts
                  </td>
                  <td className="guesses-cell">
                    {user.correctGuesses}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="back-container">
            <Link to="/home" className="back-button">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;