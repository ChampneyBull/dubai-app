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
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        await syncInitialData(initialGolfers);
        const [gData, rData] = await Promise.all([getGolfers(), getRequests()]);
        setGolfers(gData || []);
        setRequests(rData || []);

        // Check session
        const savedUser = localStorage.getItem('dubai_player');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            localStorage.removeItem('dubai_player');
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setInitError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initApp();

    // Real-time Subscriptions
    const golfersSub = supabase
      .channel('golfers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'golfers' }, () => {
        getGolfers().then(setGolfers).catch(console.error);
      })
      .subscribe();

    const requestsSub = supabase
      .channel('requests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'winnings_requests' }, () => {
        getRequests().then(setRequests).catch(console.error);
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
      alert('Winnings request sent to Phil, Chair of bettley tours!');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c140c] flex flex-col items-center justify-center text-[#7cfc00]">
        <div className="animate-spin text-6xl mb-4">⛳️</div>
        <p className="font-black uppercase tracking-widest text-xs animate-pulse">Establishing Connection...</p>
      </div>
    );
  }

  if (initError && !user) {
    return (
      <div className="min-h-screen bg-[#0c140c] flex flex-col items-center justify-center p-10 text-center">
        <div className="text-red-500 mb-6 text-5xl">⚠️</div>
        <h1 className="text-white font-black text-xl mb-2">Clubhouse Connection Failed</h1>
        <p className="text-gray-500 text-sm mb-8">{initError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[#7cfc00] font-bold"
        >
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = user.name === 'Phil' || user.name === 'Bully' || user.is_admin === true;

  return (
    <div className="min-h-screen bg-[#0c140c]">
      {view === 'scoreboard' && (
        <Scoreboard
          golfers={golfers}
          onLogWinnings={() => setView('logger')}
          onAdminOpen={() => {
            if (isAdmin) setView('admin');
            else alert("Access Restricted: Administrator Eyes Only");
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
          onReset={() => alert("Data resets must be performed by Phil Bettley, Directorv-vBettley Tours")}
        />
      )}
    </div>
  );
}

export default App;
