"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerDetails } from "@/store/slices/customerDetailsSlice";
import styles from "./styles.module.css";
import tableStyles from "../../table.styles.module.css";
import { AppDispatch, RootState } from "@/store";
import PlusGreenSvg from "@/Assets/svgs/PlusGreenSvg";
import GeneralData from "../../../../components/ui/tableheader/page";
import TableFooter from "../../../../components/ui/tablefooter/page";
import DropdownSVG from "@/Assets/svgs/DropdownSVG";
import FlagImage from "./../../../../Assets/Images/flag.png";
import Image from "next/image";
import EyeSvg from "@/Assets/svgs/EyeSvg";
import RightIconSvg from "@/Assets/svgs/RightSvg";
import DropDownSvg from "@/Assets/svgs/DropDown";
import Chip from "../../../../components/ui/chipMenu/page";
import EditSvg from "@/Assets/svgs/EditSvg";
import DownloadSvg from "@/Assets/svgs/DownloadSvg";
import WhatsappSvg from "@/Assets/svgs/WhatsappSvf";
import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ArrowLeftIcon } from "lucide-react";

export default function CustomerDetails() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const fromPage = searchParams.get('fromPage');
  const dispatch = useDispatch<AppDispatch>();
  const [expandedSections, setExpandedSections] = useState<number[]>([]);

  const { customerData, isLoading } = useSelector(
    (state: RootState) => state.customerDetails
  );

  useEffect(() => {
    if (params.id) {
      dispatch(fetchCustomerDetails(params.id as string));
    }
  }, [dispatch, params.id]);

  // Toggle Expand/Collapse
  const toggleSection = (id: number) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((sec) => sec !== id) : [...prev, id]
    );
  };

  const handleBack = () => {
    // if (fromPage) {
      router.push(`/main/customers?fromDetails=true&page=${fromPage}`);
    // } else {
    //   router.push('/main/customers');
    // }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!customerData) {
    return <div>No data found</div>;
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex justify-between mt-3">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon className="w-[30px] h-[30px]" />
          </button>
          <h1 className={styles.header}>All Customers</h1>
        </div>
        <button type="button" className={styles.customerBtn}>
          <PlusGreenSvg className={styles.btnPlusIcon} />
          Add New User
        </button>
      </div>

      {/* Main Container */}
      <div className={tableStyles.mainContainer}>
        <GeneralData search={true} header="Applicants" />

        {/* Customer Table */}
        <div className="bg-white rounded-xl">
          {customerData.map((customer) => {
            const isExpanded = expandedSections.includes(customer.id);

            return (
              <div key={customer.id}>
                {/* Main Section Row */}
                <div className="flex justify-between items-center py-3 px-4">
                  {/* Left Section (Name & Email) */}
                  <div>
                    <p className="text-[14px] font-[500] text-[#24282E]">
                      {customer.name}
                    </p>
                    <p className="text-[12px] font-[400] text-[#727A90]">
                      {customer.email}
                    </p>
                  </div>

                  {/* Middle Section (Phone) */}
                  <p className="text-[12px] font-[400] text-[#727A90]">
                    {customer.phone}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className={styles.tableChip}>
                      +{customer.applications.length}
                    </span>
                    {/* Right Section (Expand/Collapse Button) */}
                    {customer.applications.length > 0 && (
                      <>
                        <button onClick={() => toggleSection(customer.id)}>
                          {isExpanded ? (
                            <>
                              <DropDownSvg />
                            </>
                          ) : (
                            <>
                              <RightIconSvg />
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Sub-Section (Only Visible When Expanded) */}
                {isExpanded && (
                  <div className="border-gray-200">
                    {customer.applications.map((record, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between px-4 items-center py-2 border-b last:border-none"
                      >
                        {/* Record ID*/}
                        <div>
                          <p className="text-[12px] font-[400] text-[#727A90]">
                            {record.application_id}
                          </p>
                        </div>

                        {/* Tags */}
                        <div>
                          <p className="text-[12px] font-[400] text-[#727A90]">
                            {/* {record.tags.join(", ")} */}
                          </p>
                        </div>

                        {/* Dates */}
                        <p className="text-[14px] font-[500] text-[#24282E]">
                          {record.created_at}
                        </p>
                        <p className="text-[14px] font-[500] text-[#24282E]">
                          {record.flight_date}
                        </p>

                        {/* Priority */}
                        <p className="text-[14px] font-[500] text-[#F05D3D]">
                          • {record.payment_status}
                        </p>

                        <div className="flex flex-col">
                          {/* Visa Type */}
                          <p className="text-[12px] font-[400] text-[#727A90]">
                            {record.visa_type}
                          </p>

                          {/* Country */}
                          <p className="flex items-center gap-2">
                            <Image src={FlagImage} alt="Flag Image" />
                            <span className="text-[14px] font-[500] text-[#24282E]">
                              {record.visa_country}
                            </span>
                          </p>
                        </div>
                        {/* Chip Component Called */}
                        <Chip status={record.visa_status} />
                        {/* Actions */}
                        <span className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <DropdownSVG className="cursor-pointer" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className={styles.dropdownItem}
                            >
                              <DropdownMenuItem className="flex items-center p-4">
                                <EditSvg className="w-4 h-4" />
                                <span className={styles.dropdownText}>
                                  Edit
                                </span>
                              </DropdownMenuItem>
                              <hr />
                              <DropdownMenuItem className="flex items-center p-4">
                                <DownloadSvg className="w-4 h-4" />
                                <span className={styles.dropdownText}>
                                  Send Email
                                </span>
                              </DropdownMenuItem>
                              <hr />
                              <DropdownMenuItem className="flex items-center p-4">
                                <WhatsappSvg className="w-4 h-4" />
                                <span className={styles.dropdownText}>
                                  Send Whatsapp
                                </span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <EyeSvg className="cursor-pointer" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Section */}
        <TableFooter />
      </div>
    </>
  );
}
