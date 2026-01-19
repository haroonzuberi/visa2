'use client';
import CrossSvg from '@/Assets/svgs/CrossSvg';
import LeftArrowSvg from '@/Assets/svgs/LeftArrow';
import InputField from '@/components/ui/input/input';
import styles from './../ApplicationDetailModal/styles.module.css';

const RefundAmount = ({ setIsRefund }: any) => {
    return (
        <>
            {/* Header */}
            <div className="flex flex-col h-full justify-between items-center w-full">
                <div className='w-full'>
                    <div className="flex justify-between p-6 pb-0 items-center">
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setIsRefund(false) }}>
                                <LeftArrowSvg />
                            </button>
                            <h2 className="text-lg font-semibold">Refund Amount</h2>
                        </div>
                        <button className="border-[#E9EAEA] border-[1px] p-2 rounded-[10px]" onClick={() => { setIsRefund(false) }}>
                            <CrossSvg size={24} />
                        </button>
                    </div>
                    <hr className='my-3' />
                    {/* Main Content */}
                    <div className="p-6">
                        <div className='flex items-center justify-between gap-6 mb-2'>
                            <InputField
                                fieldName="Amount"
                                placeHolder="$250"
                                type="number"
                                label="Refund Amount"
                            />
                        </div>
                        <div className='items-center gap-6'>
                            <h3 className="text highlight-color font-jakarta text-[#24282E]">Internal Notes</h3>
                            <textarea className={styles.textArenaStyles} placeholder="Write Description Here"></textarea>
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div className='w-full'>
                    <hr className='my-2' />
                    <div className="flex justify-end p-6 pt-0 items-center pt-4">
                        <div className="flex gap-2">
                            <button onClick={() => setIsRefund(false)} className="bg-[#42DA82] text-white px-6 py-2 rounded-[12px] font-semibold">
                                <span>Submit</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RefundAmount