import FlagSvg from '@/Assets/svgs/FlagSvg';
import IsraelFlagSvg from '@/Assets/svgs/IsraelFlagSvg';
import i18next from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFlag, setSelectedFlag] = useState('israel'); // Default to USA

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    console.log(selectedFlag);

    const { i18n } = useTranslation();

    const handleFlagSelect = (flag) => {
        setSelectedFlag(flag);
        setIsOpen(false);
        if (flag === 'usa') {
            i18n.changeLanguage('en');
        } else if (flag === 'israel') {
            i18n.changeLanguage('he');
        }
    };

    return (
        <div className="relative">
            {/* Display the currently selected flag */}
            <div onClick={toggleDropdown} className="cursor-pointer">
                {selectedFlag === 'usa' ? <FlagSvg /> : <IsraelFlagSvg />}
            </div>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute top-8 left-0 mt-2 w-12 bg-white border border-gray-200 rounded-md shadow-lg z-10">
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