import { useEffect, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from "lucide-react";
import styles from './styles.module.css';
import BellSvg from "@/Assets/svgs/BellSvg";
import TimeSvg from "@/Assets/svgs/TimeSvg";
import InfoSvg from "@/Assets/svgs/InfoSvg";
import CrossSvg from "@/Assets/svgs/CrossSvg";
import MarkAllSvg from "@/Assets/svgs/MarkAllSvg";
import RightArrowSvg from "@/Assets/svgs/RightArrowGreen";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const NotificationPopover = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const openModal = () => {
        const current = new URLSearchParams(searchParams);
        current.set("modal", "seeMore");
        router.push(`?${current.toString()}`, { scroll: false });
        setIsOpen(false);
    };

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
    const [isOpen, setIsOpen] = useState(false);
    const markAsRead = (id) => {
        setNotifications(
            notifications.map((notif) =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
    };

    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <div className="relative cursor-pointer">
                        <BellSvg />
                        {notifications.filter((notif) => !notif.read).length > 0 && (
                            <div className="Notification">
                                <span className="NotifactionNm">
                                    {notifications.filter((notif) => !notif.read).length || ""}
                                </span>
                            </div>
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className=" ml-[20px] sm:ml-0 w-[250px] md:w-[300px] lg:w-[432px] h-[580px] border border-[1px] rounded-[16px] p-0 border-[#E9EAEA] shadow-none bg-white z-[60]" // Added blue border and shadow
                    align="end"
                >
                    {/* Header */}
                    <div className="border-b border-[#E9EAEA]-200 px-4 py-3 flex items-center justify-between">
                        <h3 className="text-[20px] font-[600] text-[#24282E]">Notification</h3>
                        <button onClick={() => setIsOpen(false)}>
                            <CrossSvg />
                        </button>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[466px] overflow-y-auto">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`px-4 py-3 ${!notification.read ? "bg-[#E6F4F5]" : "bg-white"
                                    }`} // Match Figma: blue for unread, white for read
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
                                <div className="flex justify-end w-full">
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

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-2 py-4 flex justify-between">
                        <button
                            onClick={() => markAllAsRead}
                            className={styles.underlineBtn}
                        >
                            <MarkAllSvg />
                            <span className="text-[12px] sm:text-[14px] font-[700] font-sacs underline">Mark All as Read</span>
                        </button>
                        <button onClick={openModal}
                            className={styles.underlineBtn}
                        >
                            <span className="text-[12px] sm:text-[14px] font-[700] font-sacs underline">See More</span>
                            <RightArrowSvg />
                        </button>
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
};

export default NotificationPopover;