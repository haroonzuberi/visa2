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
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ArrowLeftIcon } from "lucide-react";

export default function CustomerDetails() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const fromPage = searchParams.get("fromPage");
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

  const toggleSection = (id: number) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((sec) => sec !== id) : [...prev, id]
    );
  };

  const handleBack = () => {
    router.push(`/main/customers?fromDetails=true&page=${fromPage}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!customerData) return <div>No data found</div>;

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

        {/* Table */}
        <div className="bg-white overflow-y-auto rounded-xl">
          {customerData.map((customer) => {
            const isExpanded = expandedSections.includes(customer.id);
            return (
              <div key={customer.id}>
                {/* Customer Row */}
                <div className="flex flex-row justify-between items-center py-2 sm:py-3 px-2 sm:px-4 gap-2 sm:gap-3">
                  <div className="w-[210px]">
                    <p className="text-[12px] sm:text-[14px] font-[500] text-[#24282E]">
                      {customer.name}
                    </p>
                    <p className="text-[10px] sm:text-[12px] font-[400] text-[#727A90]">
                      {customer.email}
                    </p>
                  </div>

                  <p className="text-[10px] sm:text-[12px] font-[400] text-[#727A90]">
                    {customer.phone}
                  </p>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className={styles.tableChip}>
                      +{customer.applications.length}
                    </span>
                    {customer.applications.length > 0 && (
                      <button onClick={() => toggleSection(customer.id)}>
                        {isExpanded ? <DropDownSvg /> : <RightIconSvg />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Applications */}
                {isExpanded && (
                  <div className="border-gray-200">
                    {customer.applications.map((record, idx) => (
                      <div key={idx} className="overflow-x-auto">
                        <div className="flex flex-row items-center justify-between min-w-[900px] px-2 sm:px-4 py-2 border-b last:border-none gap-2 sm:gap-3 whitespace-nowrap">
                          <p className="text-[10px] sm:text-[12px] font-[400] text-[#727A90]">
                            {record.application_id}
                          </p>

                          <p className="text-[10px] sm:text-[12px] font-[400] text-[#727A90]"></p>

                          <p className="text-[12px] sm:text-[14px] font-[500] text-[#24282E]">
                            {record.created_at}
                          </p>
                          <p className="text-[12px] sm:text-[14px] font-[500] text-[#24282E]">
                            {record.flight_date}
                          </p>

                          <p className="text-[12px] sm:text-[14px] font-[500] text-[#F05D3D]">
                            • {record.payment_status}
                          </p>

                          <div className="flex flex-col">
                            <p className="text-[10px] sm:text-[12px] font-[400] text-[#727A90]">
                              {record.visa_type}
                            </p>
                            <p className="flex items-center gap-2">
                              <Image
                                src={FlagImage}
                                alt="Flag"
                                className="w-4 h-4"
                              />
                              <span className="text-[12px] sm:text-[14px] font-[500] text-[#24282E]">
                                {record.visa_country}
                              </span>
                            </p>
                          </div>

                          <Chip status={record.visa_status} />

                          <span className="flex items-center justify-end gap-2 relative">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button type="button">
                                  <DropdownSVG className="cursor-pointer" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className={`${styles.dropdownItem} absolute right-0 w-52 top-full z-[50] mt-1 shadow-md bg-white rounded-md border`}
                                sideOffset={5}
                              >
                                <DropdownMenuItem className="flex items-center p-4 gap-2 hover:bg-gray-100 cursor-pointer">
                                  <EditSvg className="w-4 h-4" />
                                  <span className={styles.dropdownText}>
                                    Edit
                                  </span>
                                </DropdownMenuItem>
                                <hr />
                                <DropdownMenuItem className="flex items-center p-4 gap-2 hover:bg-gray-100 cursor-pointer">
                                  <DownloadSvg className="w-4 h-4" />
                                  <span className={styles.dropdownText}>
                                    Send Email
                                  </span>
                                </DropdownMenuItem>
                                <hr />
                                <DropdownMenuItem className="flex items-center p-4 gap-2 hover:bg-gray-100 cursor-pointer">
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Table Footer */}
        <TableFooter />
      </div>
    </>
  );
}
