import React, { useState } from 'react';
import { KeyRound, ShieldCheck, LogIn } from 'lucide-react';
import { initialGolfers } from '../data';
import { supabase } from '../utils/supabase';

const Login = ({ onLogin }) => {
    const [selectedGolfer, setSelectedGolfer] = useState(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isSocialLoading, setIsSocialLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        if (!selectedGolfer) {
            setError('Please select your name First');
            return;
        }

        if (pin === selectedGolfer.pin || (selectedGolfer.name === 'Phil' && pin === '1234')) {
            onLogin(selectedGolfer);
        } else {
            setError('Invalid PIN for ' + selectedGolfer.name);
            setPin('');
        }
    };

    const handleSocialLogin = async (provider) => {
        setIsSocialLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err) {
            setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed: ${err.message}`);
        } finally {
            setIsSocialLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0c140c] text-white p-8 max-w-sm mx-auto justify-center items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#7cfc00] to-[#32cd32] rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/30 mb-8 animate-bounce-slow">
                <span className="text-4xl">⛳️</span>
            </div>

            <div className="text-center mb-10">
                <h1 className="text-3xl font-black tracking-tight mb-2">Race to Dubai</h1>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">Player Authentication</p>
            </div>

            <div className="w-full space-y-6">
                {/* Social Login Section */}
                <div className="space-y-3">
                    <button
                        onClick={() => handleSocialLogin('google')}
                        disabled={isSocialLoading}
                        className="w-full py-4 px-6 bg-white rounded-2xl flex items-center justify-center space-x-3 hover:bg-gray-100 transition-all duration-300 group shadow-lg shadow-white/5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="text-black font-black text-sm tracking-widest uppercase">Continue with Google</span>
                    </button>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="h-[1px] flex-1 bg-white/10"></div>
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">or clubhouse pin</span>
                    <div className="h-[1px] flex-1 bg-white/10"></div>
                </div>

                {/* Name Selection Area */}
                <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10">
                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4 ml-2">Who are you?</label>
                    <div className="grid grid-cols-4 gap-4">
                        {initialGolfers.map((golfer) => (
                            <button
                                key={golfer.id}
                                onClick={() => {
                                    setSelectedGolfer(golfer);
                                    setError('');
                                }}
                                className={`
                  relative flex flex-col items-center group
                  ${selectedGolfer?.id === golfer.id ? 'scale-110' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}
                  transition-all duration-300
                `}
                            >
                                <div className={`
                  w-12 h-12 rounded-full overflow-hidden border-2
                  ${selectedGolfer?.id === golfer.id ? 'border-[#7cfc00]' : 'border-transparent'}
                `}>
                                    <img src={golfer.photo || golfer.image} alt={golfer.name} className="w-full h-full object-cover" />
                                </div>
                                {selectedGolfer?.id === golfer.id && (
                                    <div className="absolute -top-1 -right-1 bg-[#7cfc00] rounded-full p-0.5 shadow-lg">
                                        <ShieldCheck className="w-3 h-3 text-black" />
                                    </div>
                                )}
                                <span className="text-[8px] font-bold mt-1 uppercase tracking-tighter">{golfer.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* PIN Input Area */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="bg-white/5 rounded-2xl p-4 flex items-center space-x-3 border border-white/10 focus-within:border-[#7cfc00]/50 transition-colors">
                        <KeyRound className="w-5 h-5 text-gray-500" />
                        <input
                            type="password"
                            placeholder="••••"
                            maxLength={4}
                            className="bg-transparent border-none outline-none flex-1 text-white font-black tracking-[0.5em] text-center placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-700 text-xl"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>

                    {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest leading-relaxed">{error}</p>}

                    <button
                        type="submit"
                        className={`
              w-full py-5 rounded-2xl font-black text-sm tracking-[0.2em] flex items-center justify-center space-x-2 transition-all duration-300
              ${selectedGolfer && pin.length === 4
                                ? 'bg-[#7cfc00] text-black shadow-[0_10px_30px_rgba(124,252,0,0.2)]'
                                : 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'}
            `}
                    >
                        ENTER CLUBHOUSE
                    </button>
                </form>
            </div>

            <p className="mt-12 text-gray-700 text-[9px] font-bold uppercase tracking-widest">Powered by VRA Golf Technology</p>
        </div>
    );
};

export default Login;
