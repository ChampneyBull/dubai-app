import React, { useState, useEffect } from 'react';
import Scoreboard from './components/Scoreboard';
import WinningsLogger from './components/WinningsLogger';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import ClaimProfile from './components/ClaimProfile';
import { supabase } from './utils/supabase';
import { getGolfers, getRequests, submitWinnings, approveWinnings, denyWinnings, syncInitialData, linkGolferToSocial } from './utils/db';
import { initialGolfers } from './data';

function App() {
  const [view, setView] = useState('scoreboard'); // 'scoreboard', 'logger', 'admin', 'claim-profile'
  const [golfers, setGolfers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log("App: Fetching clubhouse data...");
        // Fetch with a 4s safety timeout
        const fetchWithTimeout = Promise.race([
          Promise.all([getGolfers(), getRequests()]),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Database Timeout")), 4000))
        ]);

        let gData, rData;
        try {
          [gData, rData] = await fetchWithTimeout;
          console.log("App: Database synced.");
        } catch (fetchErr) {
          console.warn("App: Database fetch failed or timed out. Falling back to local data.", fetchErr.message);
          gData = initialGolfers.map(g => ({ ...g, image_url: g.image, photo_url: g.photo }));
          rData = [];
        }

        setGolfers(gData || []);
        setRequests(rData || []);

        const { data: { session }, error: sessionError } = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Auth Check Timeout")), 3000))
        ]).catch(err => {
          console.warn("App: Auth session check timed out or failed:", err.message);
          return { data: { session: null }, error: null };
        });

        if (session?.user) {
          console.log("App: Social session found for:", session.user.email);
          // Find the golfer in the database that matches this user
          const matchingGolfer = gData.find(g =>
            g.supabase_id === session.user.id ||
            (g.email && g.email.toLowerCase() === session.user.email.toLowerCase())
          );

          if (matchingGolfer) {
            console.log("App: Linked to golfer profile:", matchingGolfer.name);
            setUser({ ...matchingGolfer, is_social: true });

            // Self-healing: If matched by email but missing supabase_id, sync it now
            if (!matchingGolfer.supabase_id) {
              console.log("App: Auto-syncing Supabase ID for", matchingGolfer.name);
              linkGolferToSocial(matchingGolfer.id, session.user.email, session.user.id)
                .then(() => console.log("App: Auto-sync successful"))
                .catch(err => {
                  console.error("App: Auto-sync failed:", err);
                  alert("Auto-sync failed: " + err.message);
                });
            }
          } else {
            const tempSocialUser = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata.full_name || session.user.email.split('@')[0],
              image: session.user.user_metadata.avatar_url,
              is_social: true
            };
            setUser(tempSocialUser);
            setView('claim-profile');
          }
        } else {
          const savedUser = localStorage.getItem('dubai_player');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch (e) {
              localStorage.removeItem('dubai_player');
            }
          }
        }
      } catch (err) {
        console.error("App: Initialization critical failure:", err);
        setInitError(err.message);
      } finally {
        console.log("App: Clean boot complete.");
        setLoading(false);
      }
    };

    initApp();

    // Listen for Auth Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Fetch fresh golfer list to ensure mapping works
        const gData = await getGolfers();
        const matchingGolfer = gData.find(g =>
          g.supabase_id === session.user.id ||
          (g.email && g.email.toLowerCase() === session.user.email.toLowerCase())
        );

        if (matchingGolfer) {
          setUser({ ...matchingGolfer, is_social: true });

          // Self-healing: Sync ID during fresh login if missing
          if (!matchingGolfer.supabase_id) {
            console.log("App: Auto-syncing Supabase ID during login for", matchingGolfer.name);
            linkGolferToSocial(matchingGolfer.id, session.user.email, session.user.id)
              .then(() => console.log("App: Login auto-sync successful"))
              .catch(err => {
                console.error("App: Login auto-sync failed:", err);
                alert("Login sync failed: " + err.message);
              });
          }

          setView('scoreboard');
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata.full_name || session.user.email.split('@')[0],
            image: session.user.user_metadata.avatar_url,
            is_social: true
          });
          setView('claim-profile');
        }
      } else if (!localStorage.getItem('dubai_player')) {
        setUser(null);
      }
    });

    const subscription = authListener?.subscription;

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
      subscription.unsubscribe();
      supabase.removeChannel(golfersSub);
      supabase.removeChannel(requestsSub);
    };
  }, []);

  const handleLogin = (player) => {
    setUser(player);
    localStorage.setItem('dubai_player', JSON.stringify(player));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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

    // Optimistic UI update: mark as approved locally so it disappears
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));

    try {
      await approveWinnings(id, req.player_id, req.amount);
    } catch (err) {
      // Revert if error
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'pending' } : r));
      alert("Approval error: " + err.message);
    }
  };

  const handleDeny = async (id) => {
    // Optimistic UI update: mark as denied locally
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'denied' } : r));

    try {
      await denyWinnings(id);
    } catch (err) {
      // Revert if error
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'pending' } : r));
      alert("Deny error: " + err.message);
    }
  };

  if (initError) {
    return (
      <div className="min-h-screen bg-[#0c140c] flex flex-col items-center justify-center p-10 text-center">
        <div className="text-red-500 mb-6 text-5xl">⚠️</div>
        <h1 className="text-white font-black text-xl mb-2">Clubhouse Connection Failed</h1>
        <p className="text-gray-500 text-sm mb-2">{initError}</p>
        <p className="text-gray-600 text-[10px] mb-8 uppercase tracking-widest font-bold font-mono">Status: 401 Unauthorized</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[#7cfc00] font-bold"
        >
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c140c] flex flex-col items-center justify-center text-[#7cfc00]">
        <div className="animate-spin text-6xl mb-4">⛳️</div>
        <p className="font-black uppercase tracking-widest text-xs animate-pulse">Establishing Connection...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} golfers={golfers} />;
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

      {view === 'claim-profile' && (
        <ClaimProfile
          golfers={golfers}
          socialUser={user}
          onProfileLinked={() => {
            // Re-run init to pick up the new mapping
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

export default App;
