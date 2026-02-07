import React from 'react';
import { Check, X, ShieldAlert, History, RefreshCcw } from 'lucide-react';

const AdminPanel = ({ requests, onApprove, onDeny, onBack, onReset }) => {
    const pendingRequests = requests.filter(r => r.status === 'pending');

    return (
        <div className="flex flex-col h-screen bg-[#0c140c] text-white overflow-hidden max-w-sm mx-auto p-6">
            <header className="flex items-center space-x-3 mb-8">
                <div className="bg-[#7cfc00]/20 p-2 rounded-xl">
                    <ShieldAlert className="w-6 h-6 text-[#7cfc00]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                    <button
                        onClick={() => {
                            if (confirm("Reset all earnings and requests?")) onReset();
                        }}
                        className="flex items-center space-x-1 text-gray-500 text-[10px] uppercase font-bold hover:text-red-400 transition-colors mt-1"
                    >
                        <RefreshCcw className="w-2.5 h-2.5" />
                        <span>Reset App Data</span>
                    </button>
                </div>
                <button onClick={onBack} className="ml-auto text-gray-500 hover:text-white p-2">Close</button>
            </header>

            <div className="flex-1 overflow-y-auto space-y-4">
                {pendingRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <History className="w-12 h-12 text-gray-700 mb-4" />
                        <p className="text-gray-500 font-medium">No pending requests</p>
                        <p className="text-gray-600 text-xs mt-1">All clear for now!</p>
                    </div>
                ) : (
                    pendingRequests.map(req => (
                        <div key={req.id} className="bg-white/5 rounded-3xl p-5 border border-white/5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-black text-lg">{req.playerName}</h3>
                                    <p className="text-[#7cfc00] font-bold text-2xl">£{req.amount.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">
                                        {new Date(req.date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm mb-6 bg-black/30 p-3 rounded-xl italic">
                                "{req.tournament || 'Weekly Winnings'}"
                            </p>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => onApprove(req.id)}
                                    className="flex-1 bg-[#7cfc00] text-black py-3 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition-transform active:scale-95"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>APPROVE</span>
                                </button>
                                <button
                                    onClick={() => onDeny(req.id)}
                                    className="bg-red-500/10 text-red-500 p-3 px-6 rounded-2xl font-bold text-sm transition-colors hover:bg-red-500/20 active:scale-95"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
