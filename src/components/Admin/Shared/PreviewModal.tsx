import React from 'react';
import { X, Smartphone, Monitor } from 'lucide-react';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, title, children }) => {
    const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">{title} 미리보기</h3>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-gray-200 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('desktop')}
                                className={`p-2 rounded-md transition ${viewMode === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                title="Desktop View"
                            >
                                <Monitor size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('mobile')}
                                className={`p-2 rounded-md transition ${viewMode === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                title="Mobile View"
                            >
                                <Smartphone size={20} />
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-gray-100 p-8 flex justify-center">
                    <div
                        className={`bg-white shadow-xl transition-all duration-300 overflow-hidden ${viewMode === 'mobile'
                            ? 'w-[375px] min-h-[667px] rounded-[30px] border-8 border-gray-800'
                            : 'w-full h-full rounded-lg border border-gray-200'
                            }`}
                    >
                        <div className="w-full h-full overflow-y-auto">
                            {React.Children.map(children, child => {
                                if (React.isValidElement(child)) {
                                    return React.cloneElement(child, { viewMode } as any);
                                }
                                return child;
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;
