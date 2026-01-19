import FlagSvg from '@/Assets/svgs/FlagSvg';
import IsraelFlagSvg from '@/Assets/svgs/IsraelFlagSvg';
import i18next from 'i18next';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFlag, setSelectedFlag] = useState('israel'); // Default to Israel

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const { i18n } = useTranslation();

    // Load language preference from localStorage (if available)
    useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage) {
            setSelectedFlag(savedLanguage);
            i18n.changeLanguage(savedLanguage === 'usa' ? 'en' : 'he');
        } else {
            // Default to Hebrew if no language is saved
            i18n.changeLanguage('he');
        }
    }, [i18n]);

    const handleFlagSelect = (flag) => {
        setSelectedFlag(flag);
        setIsOpen(false);

        const language = flag === 'usa' ? 'en' : 'he';
        i18n.changeLanguage(language);

        // Save the selected language in localStorage
        localStorage.setItem('language', flag);
    };

    return (
        <div className="relative">
            {/* Display the currently selected flag */}
            <div onClick={toggleDropdown} className="cursor-pointer">
                {selectedFlag === 'usa' ? <FlagSvg /> : <IsraelFlagSvg />}
            </div>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute top-5 left-0 mt-2 w-12 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div
                        onClick={() => handleFlagSelect('usa')}
                        className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                    >
                        <FlagSvg />
                    </div>
                    <div
                        onClick={() => handleFlagSelect('israel')}
                        className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                    >
                        <IsraelFlagSvg />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
