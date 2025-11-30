import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-slide-in-right">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                            <p className="text-sm text-gray-600">{message}</p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex gap-3 rounded-b-lg">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
                    >
                        삭제
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
