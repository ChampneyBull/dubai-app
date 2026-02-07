import React, { useState } from 'react';
import { X, HelpCircle, Trophy, Rocket, Delete } from 'lucide-react';
const WinningsLogger = ({ onBack, onSubmit, currentUser, golfers }) => {
    const [amount, setAmount] = useState('0.00');
    const [selectedPlayer, setSelectedPlayer] = useState(currentUser || null);
    const [tournament, setTournament] = useState('');

    const golfersList = golfers || [];

    const handleKeyPress = (key) => {
        if (key === 'delete') {
            const stripped = amount.replace('.', '');
            const newVal = stripped.slice(0, -1);
            if (newVal.length === 0) setAmount('0.00');
            else setAmount(formatAmount(newVal));
        } else {
            const stripped = (amount === '0.00' ? '' : amount.replace('.', '')) + key;
            if (stripped.length > 8) return; // Limit
            setAmount(formatAmount(stripped));
        }
    };

    const formatAmount = (val) => {
        const num = parseInt(val) || 0;
        return (num / 100).toFixed(2);
    };

    const handleSubmit = () => {
        if (!selectedPlayer || parseFloat(amount) <= 0) {
            alert('Please select a winner and enter an amount.');
            return;
        }
        onSubmit({
            playerId: selectedPlayer.id,
            playerName: selectedPlayer.name,
            amount: parseFloat(amount),
            tournament,
            date: new Date().toISOString(),
            status: 'pending'
        });
    };

    return (
        <div className="flex flex-col h-screen bg-[#0c140c] text-white overflow-hidden max-w-md mx-auto">
            {/* Header */}
            <header className="flex items-center justify-between p-6">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Log Weekly Winnings</h1>
                <button
                    onClick={() => alert("Once you post winnings, they will be sent to the VRA Secretary for verification. Your scores will update once approved!")}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <HelpCircle className="w-6 h-6 text-[#7cfc00]" />
                </button>
            </header>

            {/* Prize Amount */}
            <div className="flex flex-col items-center py-4">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Prize Amount</span>
                <div className="flex items-start">
                    <span className="text-[#32CD32] text-3xl font-bold mt-2 mr-1">£</span>
                    <span className="text-6xl font-black">{amount}</span>
                </div>
            </div>

            {/* Select Winner */}
            <div className="px-6 py-4 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-gray-400 font-bold uppercase text-sm tracking-wider">Select Winner</h2>
                    <span className="text-[#7cfc00] text-xs font-bold">{golfersList.length} Players Total</span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                    {golfersList.map((golfer) => (
                        <button
                            key={golfer.id}
                            onClick={() => setSelectedPlayer(golfer)}
                            className="flex flex-col items-center group relative"
                        >
                            <div className={`
                w-16 h-16 rounded-full p-1 transition-all duration-200
                ${selectedPlayer?.id === golfer.id
                                    ? 'ring-2 ring-[#7cfc00] scale-110'
                                    : 'ring-1 ring-white/10 opacity-70 group-hover:opacity-100 group-hover:ring-white/30'}
              `}>
                                <div className="w-full h-full rounded-full overflow-hidden bg-gray-800">
                                    <img
                                        src={golfer.photo || golfer.image}
                                        alt={golfer.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {selectedPlayer?.id === golfer.id && (
                                    <div className="absolute top-0 right-0 bg-[#7cfc00] text-black rounded-full p-0.5">
                                        <div className="w-3 h-3 flex items-center justify-center text-[10px] font-bold">✓</div>
                                    </div>
                                )}
                            </div>
                            <span className={`
                mt-2 text-xs font-bold transition-colors
                ${selectedPlayer?.id === golfer.id ? 'text-[#7cfc00]' : 'text-gray-400'}
              `}>
                                {golfer.name}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Tournament Details */}
                <div className="mb-4">
                    <h2 className="text-gray-400 font-bold uppercase text-sm tracking-wider mb-3">Tournament Details</h2>
                    <div className="bg-white/5 rounded-2xl p-4 flex items-center space-x-3 focus-within:ring-1 focus-within:ring-[#7cfc00]/50 transition-all">
                        <Trophy className="w-5 h-5 text-[#7cfc00]" />
                        <input
                            type="text"
                            placeholder="e.g. Masters Classic"
                            className="bg-transparent border-none outline-none flex-1 text-white placeholder:text-gray-600 font-medium"
                            value={tournament}
                            onChange={(e) => setTournament(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Keypad */}
            <div className="bg-black/20 p-6 pt-4 rounded-t-[40px] border-t border-white/5 backdrop-blur-xl">
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((key) => (
                        <button
                            key={key}
                            onClick={() => key !== '.' && handleKeyPress(key.toString())}
                            className="h-14 bg-white/5 rounded-2xl text-2xl font-bold hover:bg-white/10 active:scale-95 transition-all text-gray-200"
                        >
                            {key}
                        </button>
                    ))}
                    <button
                        onClick={() => handleKeyPress('delete')}
                        className="h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
                    >
                        <Delete className="w-6 h-6 text-red-500" />
                    </button>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!selectedPlayer || parseFloat(amount) <= 0}
                    className={`
            w-full py-5 rounded-3xl font-black text-xl flex items-center justify-center space-x-3 transition-all duration-300
            ${selectedPlayer && parseFloat(amount) > 0
                            ? 'bg-[#4aff00] text-black shadow-[0_10px_40px_rgba(74,255,0,0.3)] hover:scale-[1.02] active:scale-95'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
          `}
                >
                    <span>POST WINNINGS</span>
                    <Rocket className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default WinningsLogger;
