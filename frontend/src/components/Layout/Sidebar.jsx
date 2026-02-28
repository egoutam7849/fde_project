import {
  LayoutDashboard,
  Upload,
  Database,
  Terminal,
  Settings,
  LogOut,
  Clock,
  ShieldCheck,
  Download,
  Activity as ActivityIcon
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload CSV', path: '/upload', icon: Upload, adminOnly: true },
    { name: 'Tables', path: '/tables', icon: Database },
    { name: 'SQL Runner', path: '/sql', icon: Terminal, adminOnly: true },
    { name: 'File History', path: '/history', icon: Clock },
    { name: 'Query History', path: '/query-history', icon: Terminal },
    { name: 'Data Quality', path: '/quality', icon: ShieldCheck },
    { name: 'Export Center', path: '/export', icon: Download },
    { name: 'User Management', path: '/users', icon: Settings, adminOnly: true },
    { name: 'Audit Logs', path: '/logs', icon: ActivityIcon, adminOnly: true },
  ];

  const filteredItems = navItems.filter(item => !item.adminOnly || user?.role === 'admin');

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
