import React, { useState } from 'react';
import { Settings, Plus, LayoutDashboard, List } from 'lucide-react';

const Scoreboard = ({ golfers, onLogWinnings, onAdminOpen, user, onLogout }) => {
    const [viewType, setViewType] = useState('list'); // 'list' or 'track'

    if (!golfers || golfers.length === 0) {
        return (
            <div className="flex flex-col min-h-screen bg-[#0c140c] text-white items-center justify-center p-6 italic text-gray-500">
                <div className="animate-spin mb-4 text-3xl">⛳️</div>
                Loading Scoreboard...
            </div>
        );
    }

    const sortedGolfers = [...golfers].sort((a, b) => b.earnings - a.earnings);
    const leader = sortedGolfers[0] || { name: '---', earnings: 0 };

    // Dynamic Max Earnings based on the leader, but at least 250
    const MAX_EARNINGS = Math.max(leader.earnings + 50, 250);

    return (
        <div className={`flex flex-col min-h-screen bg-[#0c140c] text-white p-6 mx-auto transition-all duration-500 ${viewType === 'list' ? 'max-w-sm' : 'max-w-md'}`}>
            <header className="flex justify-between items-center mb-10 pt-4">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#7cfc00] to-[#32cd32] rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                        <span className="text-2xl">⛳️</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-white leading-none">Race to Dubai</h1>
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1">VRA Golf Club • 2026 Season</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onLogout}
                        className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5 text-red-500"
                        title="Log Out"
                    >
                        <span className="text-[10px] font-black uppercase tracking-wider">Exit</span>
                    </button>
                    {(user.name === 'Phil' || user.name === 'Bully') && (
                        <button onClick={onAdminOpen} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5">
                            <Settings className="w-5 h-5 text-gray-400" />
                        </button>
                    )}
                    <button
                        onClick={() => setViewType(viewType === 'list' ? 'track' : 'list')}
                        className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5"
                    >
                        {viewType === 'list' ? (
                            <LayoutDashboard className="w-5 h-5 text-[#7cfc00]" />
                        ) : (
                            <List className="w-5 h-5 text-[#7cfc00]" />
                        )}
                    </button>
                </div>
            </header>

            {viewType === 'list' ? (
                <>
                    {/* Leader card */}
                    <div className="bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] rounded-[2rem] p-6 mb-8 relative overflow-hidden shadow-2xl shadow-green-900/20">
                        <div className="relative z-10">
                            <span className="bg-black/20 text-[#7cfc00] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Season Leader</span>
                            <h2 className="text-4xl font-black mt-4 mb-2">{leader.name}</h2>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-5xl font-black text-white">£{Math.floor(leader.earnings).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-20px] opacity-20 rotate-[-15deg]">
                            <img src={leader.image} alt="" className="w-48" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 mb-24">
                        {sortedGolfers.map((golfer, index) => (
                            <div key={golfer.id} className="bg-white/5 rounded-3xl p-4 flex items-center space-x-4 border border-white/5">
                                <div className="w-8 text-center text-gray-600 font-black text-xl italic">{index + 1}</div>
                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-800 flex-shrink-0">
                                    <img src={golfer.photo || golfer.image} alt={golfer.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm">{golfer.name}</h3>
                                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider italic">
                                        {index === 0 ? 'Leading' : `£${Math.floor(leader.earnings - golfer.earnings).toLocaleString()} Behind`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-lg">£{Math.floor(golfer.earnings).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-[#0f1a0f] rounded-[2.5rem] p-4 h-[1000px] relative overflow-hidden border border-white/10 shadow-2xl flex flex-col">
                        {/* Track Labels & Arrow */}
                        <div className="flex items-center justify-between px-4 pt-4 mb-4">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">VRA Golf Club</span>
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mx-4 relative flex items-center justify-end">
                                <div className="text-[10px] text-white/30 translate-y-[-0.5px]">►</div>
                            </div>
                            <span className="text-[10px] font-black text-[#ffcc00] uppercase tracking-widest">Dubai</span>
                        </div>

                        {/* Race Lanes Grid */}
                        <div className="flex-1 flex flex-col border-t border-white/5">
                            {golfers.map((golfer, idx) => {
                                // Calculate position with precision but ensure visual progress is balanced
                                const position = (parseFloat(golfer.earnings) / MAX_EARNINGS) * 85;
                                return (
                                    <div key={golfer.id} className="flex-1 relative flex items-center border-b border-white/5 overflow-visible">
                                        {/* Row Background Grid (vertical lines) */}
                                        <div className="absolute inset-0 flex justify-between px-4 pointer-events-none opacity-5">
                                            {[...Array(8)].map((_, i) => (
                                                <div key={i} className="w-[1px] h-full bg-white"></div>
                                            ))}
                                        </div>

                                        <div
                                            className="absolute transition-all duration-[1200ms] cubic-bezier(0.34, 1.56, 0.64, 1) z-20"
                                            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                                        >
                                            <div className="flex flex-col items-center">
                                                {/* Label Badge */}
                                                <div className="bg-black/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 mb-2 flex items-center shadow-lg whitespace-nowrap">
                                                    <span className="text-[10px] font-black text-white">
                                                        {golfer.name} <span className="text-[#7cfc00]">£{Math.floor(golfer.earnings)}</span>
                                                    </span>
                                                </div>
                                                {/* Standardized Caricature Container */}
                                                <div className="w-20 h-20 flex items-center justify-center translate-y-[-5px]">
                                                    <img
                                                        src={golfer.image}
                                                        alt={golfer.name}
                                                        className="max-w-full max-h-full object-contain filter drop-shadow-[0_8px_15px_rgba(0,0,0,0.6)]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-center space-x-2 text-gray-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#7cfc00] animate-ping"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Live Standings Race</span>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={onLogWinnings}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#7cfc00] text-black h-16 w-16 rounded-full shadow-[0_10px_30px_rgba(124,252,0,0.4)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-50"
            >
                <Plus className="w-8 h-8 stroke-[3]" />
            </button>
        </div>
    );
};

export default Scoreboard;
