import React, { useState } from 'react';
import { UserPlus, CheckCircle2 } from 'lucide-react';
import { linkGolferToSocial } from '../utils/db';

const ClaimProfile = ({ golfers, socialUser, onProfileLinked }) => {
    const [selectedId, setSelectedId] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const [error, setError] = useState('');

    // Only show golfers who haven't been claimed yet (no email attached)
    const availableGolfers = golfers.filter(g => !g.email);

    const handleClaim = async () => {
        if (!selectedId) return;

        setIsLinking(true);
        setError('');

        try {
            await linkGolferToSocial(selectedId, socialUser.email, socialUser.id);
            // Wait a moment for the DB to propagate
            setTimeout(() => {
                onProfileLinked();
            }, 1000);
        } catch (err) {
            setError('Failed to link profile: ' + err.message);
            setIsLinking(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0c140c] flex items-center justify-center p-6 text-white">
            <div className="w-full max-w-sm bg-white/5 order border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-[#7cfc00]/20 rounded-2xl flex items-center justify-center mb-4">
                        <UserPlus className="w-8 h-8 text-[#7cfc00]" />
                    </div>
                    <h1 className="text-2xl font-black text-center mb-2">Claim Your Profile</h1>
                    <p className="text-gray-500 text-center text-xs px-4">
                        Welcome, <span className="text-white font-bold">{socialUser.name}</span>!
                        Select your golfer profile below to link your account.
                    </p>
                </div>

                <div className="space-y-4 mb-8">
                    {availableGolfers.length > 0 ? (
                        availableGolfers.map(golfer => (
                            <button
                                key={golfer.id}
                                onClick={() => setSelectedId(golfer.id)}
                                className={`w-full flex items-center p-4 rounded-2xl transition-all border ${selectedId === golfer.id
                                        ? 'bg-[#7cfc00] border-[#7cfc00] text-black shadow-lg shadow-[#7cfc00]/20 scale-[1.02]'
                                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-xl overflow-hidden mr-4 bg-gray-800">
                                    <img src={golfer.image} alt={golfer.name} className="w-full h-full object-cover" />
                                </div>
                                <span className="font-bold">{golfer.name}</span>
                                {selectedId === golfer.id && <CheckCircle2 className="ml-auto w-5 h-5" />}
                            </button>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 text-xs py-4">
                            All golfers have been claimed! Contact the Director for assistance.
                        </p>
                    )}
                </div>

                {error && <p className="text-red-500 text-[10px] text-center mb-4 font-bold uppercase tracking-widest">{error}</p>}

                <button
                    onClick={handleClaim}
                    disabled={!selectedId || isLinking}
                    className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center ${selectedId && !isLinking
                            ? 'bg-white text-black hover:scale-105 shadow-xl'
                            : 'bg-white/10 text-gray-600 cursor-not-allowed'
                        }`}
                >
                    {isLinking ? (
                        <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></div>
                            Linking...
                        </div>
                    ) : 'Complete Signup'}
                </button>
            </div>
        </div>
    );
};

export default ClaimProfile;
