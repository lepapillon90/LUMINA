import React, { useState, useRef } from 'react';
import { Upload, Loader2, FileText, X } from 'lucide-react';
import { uploadFile, getStoragePathFromUrl } from '../../../services/storageService';

interface FileUploadProps {
    label: string;
    value: string;
    onUpload: (url: string) => void;
    accept: string;
    storagePath: string;
    helperText?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, value, onUpload, accept, storagePath, helperText }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadFile(file, storagePath);
            onUpload(url);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('파일 업로드에 실패했습니다.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const displayPath = value ? getStoragePathFromUrl(value) : '';

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 truncate flex items-center gap-2">
                    <FileText size={16} className="text-gray-400 shrink-0" />
                    <span className="truncate">{displayPath || '파일이 선택되지 않았습니다'}</span>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={accept}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition disabled:opacity-50"
                >
                    {uploading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            업로드 중...
                        </>
                    ) : (
                        <>
                            <Upload size={16} />
                            파일 선택
                        </>
                    )}
                </button>
                {value && (
                    <button
                        type="button"
                        onClick={() => onUpload('')}
                        className="p-2 text-gray-400 hover:text-red-500 transition"
                        title="삭제"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
            {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
        </div>
    );
};

export default FileUpload;
