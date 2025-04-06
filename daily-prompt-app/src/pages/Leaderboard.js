import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LeaderboardStyles.css'; // Import our custom CSS
import { auth, db } from '../firebaseConfig'; // Import your Firebase configuration
import { 
  collection, 
  getDocs,
  query,
  orderBy,
  limit,
  getDoc,
  doc
} from 'firebase/firestore';

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      
      try {
        // Get current user ID if logged in
        const currentUser = auth.currentUser;
        if (currentUser) {
          setCurrentUserId(currentUser.uid);
        }
        
        // Fetch user scores from Firestore
        // First, get user data to associate with scores
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const usersMap = {};
        
        usersSnapshot.forEach(userDoc => {
          const userData = userDoc.data();
          usersMap[userDoc.id] = {
            username: userData?.profile?.username || 'Anonymous',
          };
        });
        
        // Get unique users with their total points and correct guesses
        const userTotals = {};
        
        // Fetch all user scores
        const scoresRef = collection(db, 'userScores');
        const scoresSnapshot = await getDocs(scoresRef);
        
        scoresSnapshot.forEach(scoreDoc => {
          const scoreData = scoreDoc.data();
          const userId = scoreData.userId;
          
          if (!userTotals[userId]) {
            userTotals[userId] = {
              id: userId,
              username: usersMap[userId]?.username || 'Unknown User',
              points: 0,
              correctGuesses: 0,
              isCurrentUser: userId === currentUser?.uid
            };
          }
          
          userTotals[userId].points += scoreData.pointsEarned || 0;
          userTotals[userId].correctGuesses += scoreData.correctGuesses || 0;
        });
        
        // Convert to array for sorting
        const leaderboard = Object.values(userTotals);
        
        // Sort by points (highest first)
        leaderboard.sort((a, b) => b.points - a.points);
        
        setLeaderboardData(leaderboard);
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
            <Link to="/home" className="back-button">
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