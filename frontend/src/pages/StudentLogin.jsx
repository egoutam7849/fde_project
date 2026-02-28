import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, AlertCircle, BookOpen } from 'lucide-react';

const StudentLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-teal-50 p-12 relative overflow-hidden">
                    {/* Soft Background Accents */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px]" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />

                    <div className="flex flex-col items-center mb-10 relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-teal-200/50 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <GraduationCap className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Student Access</h1>
                        <p className="text-slate-500 mt-3 text-center text-lg max-w-[280px]">
                            Explore and analyze datasets for your research
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4 text-red-600 text-sm animate-bounce-short">
                                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 ml-1">Student Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl px-6 py-5 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all placeholder:text-slate-300 text-lg"
                                placeholder="e.g. jdoe_student"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 ml-1">Academic Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl px-6 py-5 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all placeholder:text-slate-300 text-lg"
                                placeholder="••••••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-slate-200 hover:shadow-2xl flex items-center justify-center gap-3 text-lg"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Enter Dashboard</span>
                                    <BookOpen className="w-5 h-5 opacity-50" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-10 border-t border-slate-50 text-center relative z-10">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-slate-400 hover:text-teal-600 font-semibold text-sm transition-colors flex items-center justify-center gap-2 w-full"
                        >
                            Staff or Administrator? Click here.
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
