import CrossSvg from '@/Assets/svgs/CrossSvg'
import LeftArrowSvg from '@/Assets/svgs/LeftArrow'
import React, { useEffect, useState } from 'react';
import styles from '../ApplicationDetailModal/styles.module.css';
import InfoSvg from '@/Assets/svgs/InfoSvg';
import TimeSvg from '@/Assets/svgs/TimeSvg';
import { Check } from 'lucide-react';
import BellSvg from '@/Assets/svgs/BellSvg';

function NotificationModal({ closeModal }: { closeModal: () => void }) {

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "New Order #30854",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus finibus vestibulum hendrerit. Nulla est diam, efficitur eu ullamcorper quis, ultrices nec nisl.",
            tag: "Tag",
            time: "Time",
            read: false,
        },
        {
            id: 2,
            title: "Order #30851 Has Been Shipped",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus finibus vestibulum hendrerit. Nulla est diam, efficitur eu ullamcorper quis, ultrices nec nisl.",
            tag: "Tag",
            time: "Time",
            read: true,
        },
        {
            id: 3,
            title: 'Your Product "iMac 2021" Out of Stock',
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus finibus vestibulum hendrerit. Nulla est diam, efficitur eu ullamcorper quis, ultrices nec nisl.",
            tag: "Tag",
            time: "Time",
            read: false,
        },
        {
            id: 4,
            title: 'Your Product "iMac 2021" Out of Stock',
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus finibus vestibulum hendrerit. Nulla est diam, efficitur eu ullamcorper quis, ultrices nec nisl.",
            tag: "Tag",
            time: "Time",
            read: true,
        },
        {
            id: 5,
            title: 'Your Product "iMac 2021" Out of Stock',
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus finibus vestibulum hendrerit. Nulla est diam, efficitur eu ullamcorper quis, ultrices nec nisl.",
            tag: "Tag",
            time: "Time",
            read: false,
        },
    ]);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [closeModal]);

    const markAsRead = (id) => {
        setNotifications(
            notifications.map((notif) =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`} >
                <div className={`bg-white w-[880px] rounded-lg shadow-lg relative ${styles.modalMain}`}>
                    <div className="flex flex-col h-full justify-between items-center w-full">
                        <div className='w-full'>
                            <div className="flex justify-between p-6 pb-0 items-center">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { closeModal() }}>
                                        <LeftArrowSvg />
                                    </button>
                                    <div className="relative cursor-pointer mr-2">
                                        <BellSvg />
                                        {notifications.filter((notif) => !notif.read).length > 0 && (
                                            <div className="Notification">
                                                <span className="NotifactionNm">
                                                    {notifications.filter((notif) => !notif.read).length || ""}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-lg font-semibold">Notifications</h2>
                                </div>
                                <button onClick={() => { closeModal() }} className="border-[#E9EAEA] border-[1px] p-2 rounded-[10px]">
                                    <CrossSvg />
                                </button>
                            </div>
                            <hr className='my-3' />



                            <div className="overflow-y-auto p-3">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`px-4 py-3 bg-white ${styles.mainDiv} my-2`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2 text-[12px] font-[500] text-[#727A90]">
                                                <InfoSvg />
                                                <span>{notification.tag}</span>
                                                <TimeSvg />
                                                <span>{notification.time}</span>
                                            </div>
                                        </div>
                                        <h4 className="mt-1 text-[16px] font-[600] text-[#24282E]">
                                            {notification.title}
                                        </h4>
                                        <p className="text-[14px] font-[400] text-[#686F83]">{notification.description}</p>
                                        <div className="flex justify-start w-full">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className={styles.underlineBtn}
                                                >
                                                    <Check className="w-4 h-4" />
                                                    <span className="text-[14px] font-[700] font-sacs underline">Mark as Read</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NotificationModal