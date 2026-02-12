import { LayoutDashboard, Upload, Database, Terminal, BarChart2, Settings, LogOut, Clock, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload CSV', path: '/upload', icon: Upload },
    { name: 'Tables', path: '/tables', icon: Database },
    { name: 'SQL Runner', path: '/sql', icon: Terminal },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'File History', path: '/history', icon: Clock }, // New
    { name: 'Data Quality', path: '/quality', icon: ShieldCheck }, // New
  ];

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-100 flex items-center justify-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          DataLoader
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
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
        <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
