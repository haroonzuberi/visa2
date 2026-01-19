'use client';
import CrossSvg from '@/Assets/svgs/CrossSvg';
import EditSvg from '@/Assets/svgs/EditSvg';
import LeftArrowSvg from '@/Assets/svgs/LeftArrow';

const ViewInfo = ({ setIsViewInfo }: any) => {
    return (
        <>
            {/* Header */}
            <div className="flex flex-col h-full justify-between items-center w-full">
                <div className='w-full'>
                    <div className="flex justify-between p-6 pb-0 items-center">
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setIsViewInfo(false) }}>
                                <LeftArrowSvg />
                            </button>
                            <h2 className="text-lg font-semibold">View All Info</h2>
                        </div>
                        <button className="border-[#E9EAEA] border-[1px] p-2 rounded-[10px]" onClick={() => { setIsViewInfo(false) }}>
                            <CrossSvg size={24} />
                        </button>
                    </div>
                    <hr className='my-3' />
                    {/* Main Content */}
                    <div className="bg-white rounded-lg p-6 w-full relative">
                        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition">
                            <EditSvg size={20} />
                        </button>
                        <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                            <div>
                                <p className="text-[14px] font-[500] text-[#727A90]">Name</p>
                                <p className="text-[14px] font-[500] text-[#24282E]">Name goes here</p>
                            </div>
                            <div>
                                <p className="text-[14px] font-[500] text-[#727A90]">Passport Number</p>
                                <p className="text-[14px] font-[500] text-[#24282E]">050 414 8788</p>
                            </div>
                            <div>
                                <p className="text-[14px] font-[500] text-[#727A90]">Date of Birth</p>
                                <p className="text-[14px] font-[500] text-[#24282E]">26 October 2024</p>
                            </div>
                            <div>
                                <p className="text-[14px] font-[500] text-[#727A90]">Gender</p>
                                <p className="text-[14px] font-[500] text-[#24282E]">Male</p>
                            </div>
                            <div>
                                <p className="text-[14px] font-[500] text-[#727A90]">Marital Status</p>
                                <p className="text-[14px] font-[500] text-[#24282E]">Married</p>
                            </div>
                            <div>
                                <p className="text-[14px] font-[500] text-[#727A90]">Spouse Name</p>
                                <p className="text-[14px] font-[500] text-[#24282E]">Mrs. Bhaarti</p>
                            </div>
                            <div>
                                <p className="text-[14px] font-[500] text-[#727A90]">Spouse Country of Birth</p>
                                <p className="text-[14px] font-[500] text-[#24282E]">India</p>
                            </div>
                            <div>
                                <p className="text-[14px] font-[500] text-[#727A90]">Have you Visited India Before?</p>
                                <p className="text-[14px] font-[500] text-[#24282E]">Yes</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div className='w-full'>
                    <hr className='my-2' />
                    <div className="flex justify-end p-6 pt-0 items-center pt-4">
                        <div className="flex gap-2">
                            <button onClick={() => setIsViewInfo(false)} className="bg-[#42DA82] text-white px-6 py-2 rounded-[12px] font-semibold">
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ViewInfo