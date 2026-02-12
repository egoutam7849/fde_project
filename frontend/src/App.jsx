import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="upload" element={<Upload />} />
                    <Route path="tables" element={<Tables />} />
                    <Route path="sql" element={<SQLRunner />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="history" element={<History />} />
                    <Route path="quality" element={<DataQuality />} />
                    <Route path="query-history" element={<QueryHistory />} />
                    <Route path="export" element={<ExportCenter />} />
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
