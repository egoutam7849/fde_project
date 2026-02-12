import { useState } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle, XCircle } from 'lucide-react';
import { endpoints } from '../api/api';
import clsx from 'clsx';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await endpoints.uploadCSV(formData);
      setSuccess(`Successfully uploaded! ${response.data.rows} rows inserted into table "${response.data.table}".`);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Upload CSV File</h2>
          <p className="text-gray-500 mt-2">Select a CSV file to automatically create a table.</p>
        </div>

        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer relative group">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
            <UploadIcon className="w-8 h-8" />
          </div>
          <p className="font-medium text-gray-700">
            {file ? file.name : "Click to select or drag and drop"}
          </p>
          <p className="text-sm text-gray-400 mt-1">CSV files only</p>
        </div>

        {file && (
          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className={clsx(
                "w-full py-3 rounded-xl font-medium text-white transition-all shadow-lg hover:shadow-xl",
                uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {uploading ? "Uploading..." : "Start Upload"}
            </button>
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center">
            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center">
            <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
        <ul className="space-y-3 text-gray-600 list-disc pl-5">
          <li>File must be in <strong>.csv</strong> format.</li>
          <li>The first row should contain header names (columns).</li>
          <li>File name will be used as the table name (spaces replaced by underscores).</li>
          <li>Large files may take a few seconds to process.</li>
        </ul>
      </div>
    </div>
  );
};

export default Upload;
