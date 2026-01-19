'use client';
import CrossSvg from '@/Assets/svgs/CrossSvg';
import LeftArrowSvg from '@/Assets/svgs/LeftArrow';
import InputField from '@/components/ui/input/input';

const EditInfo = ({ setIsEdit }: any) => {
    return (
        <>
            {/* Header */}
            <div className="flex flex-col h-full justify-between items-center w-full">
                <div className='w-full'>
                    <div className="flex justify-between p-6 pb-0 items-center">
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setIsEdit(false) }}>
                                <LeftArrowSvg />
                            </button>
                            <h2 className="text-lg font-semibold">Edit Info</h2>
                        </div>
                        <button className="border-[#E9EAEA] border-[1px] p-2 rounded-[10px]" onClick={() => { setIsEdit(false) }}>
                            <CrossSvg size={24} />
                        </button>
                    </div>
                    <hr className='my-3' />
                    {/* Main Content */}
                    <div className="p-6">
                        <div className='flex items-center justify-between gap-6'>
                            <InputField
                                fieldName="Name"
                                placeHolder="Email"
                                type="text"
                                label="Name"
                            />
                            <InputField
                                fieldName="id"
                                label="ID"
                                placeHolder="Email"
                                type="text"
                            />
                        </div>
                        <div className='flex items-center justify-between gap-6 mt-3'>
                            <InputField
                                fieldName='Application Date'
                                label='Application Date'
                                placeHolder='Application Date'
                                type='date'
                            ></InputField>
                            <InputField
                                fieldName='Flight Date'
                                label='Flight Date'
                                placeHolder='Flight Date'
                                type='date'
                            ></InputField>
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div className='w-full'>
                    <hr className='my-2' />
                    <div className="flex justify-end p-6 pt-0 items-center pt-4">
                        <div className="flex gap-2">
                            <button onClick={() => setIsEdit(false)} className="bg-[#42DA82] text-white px-6 py-2 rounded-[12px] font-semibold">
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EditInfo