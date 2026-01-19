"use client";
import CrossSvg from "@/Assets/svgs/CrossSvg";
import { useEffect, useState } from "react";
import { Check, ArrowLeft } from "lucide-react";
import "@/styles/globals.css";
import { useDispatch } from "react-redux";
import { fetchFormsList } from "@/store/slices/applicationsSlice";
import { AppDispatch } from "@/store";

const NewApplication = ({ setIsNewApplication, onClose }: any) => {
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [formsList, setFormsList] = useState<any[]>([]);
  const [isLoadingForms, setIsLoadingForms] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const loadForms = async () => {
      setIsLoadingForms(true);
      try {
        const result = await dispatch(fetchFormsList({ skip: 0, limit: 10 })).unwrap();
        if (result?.data) {
          setFormsList(result.data);
        }
      } catch (error) {
        console.error("Error loading forms:", error);
      } finally {
        setIsLoadingForms(false);
      }
    };
    loadForms();
  }, [dispatch]);

  const handleFormSelect = (formId: number) => {
    setSelectedFormId(formId);
  };

  const handleNext = () => {
    if (selectedFormId) {
      setShowIframe(true);
      setIsIframeLoading(true);
    }
  };

  const handleBack = () => {
    setShowIframe(false);
    setIsIframeLoading(true);
  };

  const handleIframeLoad = () => {
    setIsIframeLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm">
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh]">
          <div className="bg-white rounded-xl w-[90vw] xl:w-[800px] lg:w-[800px] md:w-[800px] h-[90vh] shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex justify-between p-6 pb-0 items-center flex-shrink-0">
              <h2 className="text-lg font-semibold">Add New Application</h2>
              <button
                className="border-[#E9EAEA] border-[1px] p-2 rounded-[10px]"
                onClick={() => {
                  console.log("SET APP---");
                  onClose();
                }}
              >
                <CrossSvg size={24} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {!showIframe ? (
                <div className="px-8 py-6 flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-[20px] font-semibold text-[#24282E] mb-2">
                      Select Application Form
                    </h3>
                    <p className="text-[14px] text-[#727A90]">
                      Choose the form type you want to create an application for
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {isLoadingForms ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-[#727A90]">Loading forms...</div>
                      </div>
                    ) : formsList.length === 0 ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-[#727A90]">No forms available</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {formsList.map((form) => (
                          <button
                            key={form.id}
                            type="button"
                            onClick={() => handleFormSelect(form.id)}
                            className={`relative w-full p-5 rounded-[16px] border-2 transition-all duration-200 text-left hover:shadow-md ${
                              selectedFormId === form.id
                                ? "border-[#42DA82] bg-[#42DA8210] shadow-sm"
                                : "border-[#E9EAEA] bg-white hover:border-[#42DA8250]"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-[18px] font-semibold text-[#24282E]">
                                    {form.name}
                                  </h4>
                                  {form.status === "published" && (
                                    <span className="px-2 py-1 text-[10px] font-medium bg-[#42DA821A] text-[#42DA82] rounded-full">
                                      Published
                                    </span>
                                  )}
                                </div>
                                {form.description && (
                                  <p className="text-[14px] text-[#727A90] mb-3">
                                    {form.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-[12px] text-[#727A90]">
                                  <span>ID: #{form.id}</span>
                                  {form.updated_at && (
                                    <span>
                                      Updated:{" "}
                                      {new Date(form.updated_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div
                                className={`ml-4 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  selectedFormId === form.id
                                    ? "border-[#42DA82] bg-[#42DA82]"
                                    : "border-[#D1D5DB] bg-white"
                                }`}
                              >
                                {selectedFormId === form.id && (
                                  <Check className="w-4 h-4 text-white" />
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedFormId && (
                    <div className="mt-6 flex justify-end flex-shrink-0">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="bg-[#42DA82] text-white px-6 py-2 rounded-[12px] font-semibold hover:bg-[#42DA82]/90 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="px-8 py-4 border-b border-[#E9EAEA] flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-2 text-[#24282E] hover:text-[#42DA82] transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span className="text-[14px] font-medium">Back to Form Selection</span>
                    </button>
                  </div>
                  <div className="flex-1 relative min-h-0">
                    {isIframeLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-4 border-[#42DA82] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[14px] text-[#727A90]">Loading form...</span>
                        </div>
                      </div>
                    )}
                    <iframe
                      src={`https://api.visa2.pro/form/${selectedFormId}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      onLoad={handleIframeLoad}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewApplication;
