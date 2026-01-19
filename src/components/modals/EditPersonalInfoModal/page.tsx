'use client';
import CrossSvg from '@/Assets/svgs/CrossSvg';
import LeftArrowSvg from '@/Assets/svgs/LeftArrow';
import InputField from '@/components/ui/input/input';
import DropDown from '@/components/ui/dropdown/page';

const EditPersonalInfo = ({ setIsPersonalEdit }: any) => {
    return (
        <>
            {/* Header */}
            <div className="flex flex-col h-full justify-between items-center w-full">
                <div className='w-full'>
                    <div className="flex justify-between p-6 pb-0 items-center">
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setIsPersonalEdit(false) }}>
                                <LeftArrowSvg />
                            </button>
                            <h2 className="text-lg font-semibold">Edit Info</h2>
                        </div>
                        <button className="border-[#E9EAEA] border-[1px] p-2 rounded-[10px]" onClick={() => { setIsPersonalEdit(false) }}>
                            <CrossSvg size={24} />
                        </button>
                    </div>
                    <hr className='my-3' />
                    {/* Main Content */}
                    <div className="p-6">
                        <div className='flex items-center justify-between gap-6'>
                            <InputField
                                fieldName="name"
                                placeHolder="Name"
                                type="text"
                                label="Name"
                            />
                            <InputField
                                fieldName="passportNumber"
                                label="Passport Number"
                                placeHolder="Passport Number"
                                type="number"
                            />
                        </div>
                        <div className='flex items-center justify-between gap-6 mt-3'>
                            <InputField
                                fieldName='DOB'
                                label='Date of Birth'
                                placeHolder='Date of Birth'
                                type='date'
                            ></InputField>
                            <DropDown label='Gender' options={['Male', 'Female']} fieldName='gender' />
                        </div>
                        <div className='flex items-center justify-between gap-6 mt-3'>
                            <InputField
                                fieldName="occupation"
                                placeHolder="Occupation"
                                type="text"
                                label="Occupation"
                            />
                            <DropDown label='Gender' options={['Male', 'Female']} fieldName='gender' />
                        </div>
                        <div className='flex items-center justify-between gap-6 mt-3'>
                            <DropDown label='Gender' options={['Male', 'Female']} fieldName='gender' />
                            <InputField
                                fieldName="spouseName"
                                label="Spouse Name"
                                placeHolder="Spouse Name"
                                type="text"
                            />
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div className='w-full'>
                    <hr className='my-2' />
                    <div className="flex justify-end p-6 pt-0 items-center pt-4">
                        <div className="flex gap-2">
                            <button onClick={() => setIsPersonalEdit(false)} className="bg-[#42DA82] text-white px-6 py-2 rounded-[12px] font-semibold">
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EditPersonalInfo