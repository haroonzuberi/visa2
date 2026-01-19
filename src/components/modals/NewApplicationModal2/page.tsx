import Chip from '@/components/ui/chipMenu/page'
import React, { useState } from 'react';
import Image from "next/image";
import FlagImage from "./../../../Assets/Images/flag.png";
import { Checkbox } from "@/components/ui/checkbox";

const customers = [
    {
        recordId: "#1235",
        tags: ["#tag", "#tag", "#tag"],
        createdDate: "26 July 2024",
        priority: "High Priority",
        visaType: "Tourist Visa",
        country: "India",
        status: "New",
    },
    {
        recordId: "#1235",
        tags: ["#tag", "#tag", "#tag"],
        createdDate: "26 July 2024",
        priority: "High Priority",
        visaType: "Tourist Visa",
        country: "India",
        status: "New",
    },
    {
        recordId: "#1235",
        tags: ["#tag", "#tag", "#tag"],
        createdDate: "26 July 2024",
        priority: "High Priority",
        visaType: "Tourist Visa",
        country: "India",
        status: "New",
    },
];

const NewApplication2 = () => {
    return (
        <>
            <div>
                <div className="border-gray-200">
                    {customers.map((record, idx) => (
                        <div
                            key={idx}
                            className="flex justify-between px-4 items-center py-2 border-b last:border-none"
                        >
                            {/* Checkbox */}
                            <Checkbox className="w-6 h-6 border-[#42DA82] data-[state=checked]:bg-[#42DA82] data-[state=checked]:text-white rounded-[5px]" />
                            {/* Record ID*/}
                            <div>
                                <p className="text-[12px] font-[400] text-[#727A90]">{record.recordId}</p>
                            </div>

                            {/* Tags */}
                            <div>
                                <p className="text-[12px] font-[400] text-[#727A90]">
                                    {record.tags.join(", ")}
                                </p>
                            </div>

                            {/* Dates */}
                            <p className="text-[14px] font-[500] text-[#24282E]">{record.createdDate}</p>

                            <div className="flex flex-col">
                                {/* Visa Type */}
                                <p className="text-[12px] font-[400] text-[#727A90]">{record.visaType}</p>

                                {/* Country */}
                                <p className="flex items-center gap-2">
                                    <Image src={FlagImage} alt="Flag Image" />
                                    <span className="text-[14px] font-[500] text-[#24282E]">{record.country}</span>
                                </p>
                            </div>
                            {/* Chip Component Called */}
                            <Chip status={record.status} />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-12 mt-3">
                    <div className="col-span-5 flex flex-col gap-4">
                        <span className="text-[#24282E] font-jakarta font-[500] text-[18px]">Payment Link Via Whatsapp?</span>
                        <div className='flex items-center gap-4'>
                            <label className="flex items-center gap-2 cursor-pointer text-[#24282E] font-jakarta font-[500] text-[18px]">
                                <input
                                    type="radio"
                                    name="group"
                                    value="yes"
                                    className="hidden peer"
                                />
                                <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-400 peer-checked:bg-green-500 peer-checked:border-green-500">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                </div>
                                Yes
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-[#24282E] font-jakarta font-[500] text-[18px]">
                                <input
                                    type="radio"
                                    name="group"
                                    value="no"
                                    className="hidden peer"
                                />
                                <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-400 peer-checked:bg-green-500 peer-checked:border-green-500">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                </div>
                                No
                            </label>
                        </div>
                    </div>
                    <div className="col-span-5 flex flex-col gap-4">
                        <span className="text-[#24282E] font-jakarta font-[500] text-[18px]">Payment Link Via Email?</span>
                        <div className='flex items-center gap-4'>
                            <label className="flex items-center gap-2 cursor-pointer text-[#24282E] font-jakarta font-[500] text-[18px]">
                                <input
                                    type="radio"
                                    name="group"
                                    value="yes"
                                    className="hidden peer"
                                />
                                <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-400 peer-checked:bg-green-500 peer-checked:border-green-500">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                </div>
                                Yes
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-[#24282E] font-jakarta font-[500] text-[18px]">
                                <input
                                    type="radio"
                                    name="group"
                                    value="no"
                                    className="hidden peer"
                                />
                                <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-400 peer-checked:bg-green-500 peer-checked:border-green-500">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                </div>
                                No
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NewApplication2