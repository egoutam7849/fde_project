import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ title }) => {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex flex-col">
                <h2 className="text-xl font-semibold text-gray-800 leading-tight">{title}</h2>
                {user && (
                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                        {user.role} Account
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none w-64 transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <div className="h-9 w-9 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-medium shadow-sm">
                        {user?.username?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
