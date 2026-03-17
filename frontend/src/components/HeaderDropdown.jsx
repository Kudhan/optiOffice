import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HeaderDropdown = ({ trigger, items, title, align = 'right' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer h-full flex items-center">
                {trigger}
            </div>

            {isOpen && (
                <div className={`absolute top-full mt-4 w-72 bg-primary-surface border border-border rounded-3xl shadow-2xl z-50 animate-fade-in ${align === 'right' ? 'right-0' : 'left-0'}`}>
                    <div className="p-6">
                        {title && (
                            <div className="mb-4 pb-4 border-b border-border">
                                <h3 className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em]">{title}</h3>
                            </div>
                        )}
                        <div className="space-y-1">
                            {items.map((item, index) => (
                                item.type === 'divider' ? (
                                    <div key={index} className="h-px bg-border my-3 mx-2" />
                                ) : (
                                    <div 
                                        key={index}
                                        onClick={() => {
                                            if (item.onClick) item.onClick();
                                            setIsOpen(false);
                                        }}
                                        className="group p-3 rounded-2xl hover:bg-primary-muted transition-all cursor-pointer flex items-center gap-4"
                                    >
                                        <div className={`p-2 rounded-xl transition-colors ${item.colorClass || 'bg-primary-muted text-content-muted group-hover:text-sky-500'}`}>
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-content-main truncate tracking-tight">{item.label}</p>
                                            {item.description && (
                                                <p className="text-[10px] text-content-muted font-medium truncate mt-0.5">{item.description}</p>
                                            )}
                                        </div>
                                        {item.badge && (
                                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeaderDropdown;
