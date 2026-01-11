import React, { useState } from 'react';
import { Lock, User, LogIn } from 'lucide-react';

// Danh sách tài khoản được phép đăng nhập
const VALID_ACCOUNTS = [
    { username: 'Trần Hoài Thanh', password: 'hoaithanha2' },
    { username: 'GVBM', password: '321' }
];

interface LoginModalProps {
    onLogin: (username: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Kiểm tra thông tin đăng nhập
        const validAccount = VALID_ACCOUNTS.find(
            acc => acc.username === username && acc.password === password
        );

        setTimeout(() => {
            if (validAccount) {
                // Lưu thông tin đăng nhập vào localStorage
                localStorage.setItem('lhtc_loggedInUser', username);
                onLogin(username);
            } else {
                setError('Tên đăng nhập hoặc mật khẩu không đúng!');
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center p-4 z-50">
            <div className="absolute inset-0 bg-black/10" />

            {/* Decorative elements */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
                {/* Header decoration */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/30 mb-4">
                        <Lock className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 font-display">
                        LỚP HỌC TÍCH CỰC
                    </h1>
                    <p className="text-gray-500 mt-2">Đăng nhập để tiếp tục</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tên đăng nhập</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập tên đăng nhập"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                            <span className="text-lg">⚠️</span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Đăng nhập
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">
                        Phát triển bởi <span className="font-semibold text-gray-600">Trần Hoài Thanh</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
