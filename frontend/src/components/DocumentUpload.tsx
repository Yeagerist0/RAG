import React, { useRef } from 'react';
import { Upload, FileCheck } from 'lucide-react';
import { uploadDocument } from '../utils/api';

interface DocumentUploadProps {
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onSuccess, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<string[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      onError('Please upload a PDF or TXT file');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadDocument(file);
      setUploadedFiles([...uploadedFiles, file.name]);
      onSuccess(result);
    } catch (error: any) {
      onError(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="glass p-8 text-center cursor-pointer hover:shadow-lg transition-all"
      >
        <Upload className="w-12 h-12 mx-auto mb-3 text-blue-500" />
        <p className="text-lg font-semibold mb-2">Upload Document</p>
        <p className="text-gray-600 text-sm">Drop PDF or TXT files here or click to browse</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        {uploading && <p className="text-sm text-blue-500 mt-2">Uploading...</p>}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="glass p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-green-500" />
            Uploaded Documents
          </h3>
          <ul className="space-y-2">
            {uploadedFiles.map((file) => (
              <li key={file} className="text-sm text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {file}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
