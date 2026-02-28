import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Tables from './pages/Tables';
import SQLRunner from './pages/SQLRunner';
import Analytics from './pages/Analytics';
import History from './pages/History'; // Upload history
import DataQuality from './pages/DataQuality';
import QueryHistory from './pages/QueryHistory';
import ExportCenter from './pages/ExportCenter';
import AdminLogin from './pages/AdminLogin';
import StudentLogin from './pages/StudentLogin';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import Register from './pages/Register';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<AdminLogin />} />
                    <Route path="/student-login" element={<StudentLogin />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="upload" element={
                            <ProtectedRoute requiredRole="admin">
                                <Upload />
                            </ProtectedRoute>
                        } />
                        <Route path="tables" element={<Tables />} />
                        <Route path="sql" element={
                            <ProtectedRoute requiredRole="admin">
                                <SQLRunner />
                            </ProtectedRoute>
                        } />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="history" element={<History />} />
                        <Route path="quality" element={<DataQuality />} />
                        <Route path="query-history" element={<QueryHistory />} />
                        <Route path="export" element={<ExportCenter />} />
                        <Route path="users" element={
                            <ProtectedRoute requiredRole="admin">
                                <Users />
                            </ProtectedRoute>
                        } />
                        <Route path="logs" element={
                            <ProtectedRoute requiredRole="admin">
                                <AuditLogs />
                            </ProtectedRoute>
                        } />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
