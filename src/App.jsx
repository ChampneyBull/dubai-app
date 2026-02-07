import React, { useState, useEffect } from 'react';
import Scoreboard from './components/Scoreboard';
import WinningsLogger from './components/WinningsLogger';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { supabase } from './utils/supabase';
import { getGolfers, getRequests, submitWinnings, approveWinnings, denyWinnings, syncInitialData } from './utils/db';
import { initialGolfers } from './data';

function App() {
  const [view, setView] = useState('scoreboard'); // 'scoreboard', 'logger', 'admin'
  const [golfers, setGolfers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        await syncInitialData(initialGolfers);
        const [gData, rData] = await Promise.all([getGolfers(), getRequests()]);
        setGolfers(gData);
        setRequests(rData);

        // Check session
        const savedUser = localStorage.getItem('dubai_player');
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initApp();

    // Real-time Subscriptions
    const golfersSub = supabase
      .channel('golfers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'golfers' }, () => {
        getGolfers().then(setGolfers);
      })
      .subscribe();

    const requestsSub = supabase
      .channel('requests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'winnings_requests' }, () => {
        getRequests().then(setRequests);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(golfersSub);
      supabase.removeChannel(requestsSub);
    };
  }, []);

  const handleLogin = (player) => {
    setUser(player);
    localStorage.setItem('dubai_player', JSON.stringify(player));
  };

  const handleLogout = () => {
    localStorage.removeItem('dubai_player');
    setUser(null);
  };

  const handleWinningsSubmit = async (request) => {
    try {
      await submitWinnings(request);
      setView('scoreboard');
      alert('Winnings request sent to Admin!');
    } catch (err) {
      alert("Error submitting winnings: " + err.message);
    }
  };

  const handleApprove = async (id) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    try {
      await approveWinnings(id, req.player_id, req.amount);
    } catch (err) {
      alert("Approval error: " + err.message);
    }
  };

  const handleDeny = async (id) => {
    try {
      await denyWinnings(id);
    } catch (err) {
      alert("Deny error: " + err.message);
    }
  };

  if (loading || !golfers) return (
    <div className="min-h-screen bg-[#0c140c] flex items-center justify-center">
      <div className="animate-spin text-4xl">⛳️</div>
    </div>
  );

  if (!user) return <Login onLogin={handleLogin} />;

  const isAdmin = user.name === 'Phil' || user.is_admin;

  return (
    <div className="min-h-screen bg-[#0c140c]">
      {view === 'scoreboard' && (
        <Scoreboard
          golfers={golfers}
          onLogWinnings={() => setView('logger')}
          onAdminOpen={() => {
            if (isAdmin) setView('admin');
            else alert("Only Admin can access this panel");
          }}
          user={user}
          onLogout={handleLogout}
        />
      )}

      {view === 'logger' && (
        <WinningsLogger
          onBack={() => setView('scoreboard')}
          onSubmit={handleWinningsSubmit}
          currentUser={user}
          golfers={golfers}
        />
      )}

      {view === 'admin' && (
        <AdminPanel
          requests={requests}
          onApprove={handleApprove}
          onDeny={handleDeny}
          onBack={() => setView('scoreboard')}
          onReset={() => alert("Contact DB Admin to reset production data")}
        />
      )}
    </div>
  );
}

export default App;
