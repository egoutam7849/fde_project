import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
    const location = useLocation();

    const getTitle = () => {
        switch (location.pathname) {
            case '/': return 'Dashboard';
            case '/upload': return 'Upload CSV';
            case '/tables': return 'Data Tables';
            case '/sql': return 'SQL Runner';
            case '/analytics': return 'Analytics';
            default: return 'Dashboard';
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans text-gray-900">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-w-0">
                <Header title={getTitle()} />
                <main className="p-6 flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
