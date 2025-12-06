import React, { useState } from 'react';
import { TextStyle } from '../../../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TextStyleControlProps {
    label: string;
    value: TextStyle | undefined;
    onChange: (style: TextStyle) => void;
    showBackgroundColor?: boolean;
}

const TextStyleControl: React.FC<TextStyleControlProps> = ({ label, value, onChange, showBackgroundColor = false }) => {
    const [isOpen, setIsOpen] = useState(false);

    const style = value || {
        fontSize: '',
        color: '',
        fontWeight: '',
        letterSpacing: '',
        backgroundColor: ''
    };

    const handleChange = (field: string, val: string) => {
        onChange({
            ...style,
            [field]: val
        });
    };

    return (
        <div className="border border-gray-200 rounded-md bg-white overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700">{label}</span>
                    <div className="flex gap-1">
                        {style.color && (
                            <div
                                className="w-3 h-3 rounded-full border border-gray-200"
                                style={{ backgroundColor: style.color }}
                                title="글자색"
                            />
                        )}
                        {showBackgroundColor && (style as any).backgroundColor && (
                            <div
                                className="w-3 h-3 rounded-full border border-gray-200"
                                style={{ backgroundColor: (style as any).backgroundColor }}
                                title="배경색"
                            />
                        )}
                        {style.fontSize && (
                            <span className="text-xs text-gray-400">({style.fontSize})</span>
                        )}
                    </div>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </button>

            {isOpen && (
                <div className="p-4 border-t border-gray-200 space-y-4 animate-slide-down">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Font Size */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">크기 (px, rem)</label>
                            <input
                                type="text"
                                value={style.fontSize || ''}
                                onChange={(e) => handleChange('fontSize', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                                placeholder="예: 64px, 4rem"
                            />
                        </div>

                        {/* Font Weight */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">굵기 (100-900)</label>
                            <select
                                value={style.fontWeight || ''}
                                onChange={(e) => handleChange('fontWeight', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                            >
                                <option value="">기본</option>
                                <option value="100">Thin (100)</option>
                                <option value="300">Light (300)</option>
                                <option value="400">Regular (400)</option>
                                <option value="500">Medium (500)</option>
                                <option value="700">Bold (700)</option>
                                <option value="900">Black (900)</option>
                            </select>
                        </div>

                        {/* Color */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">색상</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={style.color || '#ffffff'}
                                    onChange={(e) => handleChange('color', e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                                />
                                <input
                                    type="text"
                                    value={style.color || ''}
                                    onChange={(e) => handleChange('color', e.target.value)}
                                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs"
                                    placeholder="#ffffff"
                                />
                            </div>
                        </div>

                        {/* Letter Spacing */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">자간 (em, px)</label>
                            <input
                                type="text"
                                value={style.letterSpacing || ''}
                                onChange={(e) => handleChange('letterSpacing', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                                placeholder="예: 0.1em"
                            />
                        </div>

                        {/* Background Color */}
                        {showBackgroundColor && (
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">배경색</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={(style as any).backgroundColor || '#ffffff'}
                                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                                    />
                                    <input
                                        type="text"
                                        value={(style as any).backgroundColor || ''}
                                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                        className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs"
                                        placeholder="#ffffff"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TextStyleControl;
