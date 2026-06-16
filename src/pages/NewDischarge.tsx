import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  UserPlus,
  CheckCircle2,
  Baby,
  Scissors,
  Heart,
  Phone,
  ArrowRight,
  ArrowLeft,
  CalendarIcon,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { format, parse, addDays } from "date-fns";
import {
  OnboardingShell,
  StepHeader,
  ChipSelect,
} from "../components/onboarding";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Alert,
  AlertTitle,
  AlertDescription,
  Card,
  CardContent,
} from "../components/ui";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { useDrawer } from "../contexts/DrawerContext";
import { api } from "../lib/api";
import { toast } from "sonner";

interface NewDischargeProps {
  onClose?: () => void;
}

interface MotherSearchResult {
  id: string;
  name: string;
  phone: string;
  edd: string;
}

const NewDischarge = ({ onClose }: NewDischargeProps = {}) => {
  const navigate = useNavigate();
  const { openDrawer } = useDrawer();
  const handleClose = onClose ?? (() => navigate("/dashboard"));
  const [searchPhase, setSearchPhase] = useState(true);
  const [foundMother, setFoundMother] = useState<MotherSearchResult | null>(
    null,
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [touched, setTouched] = useState(false);
  const [countryCode, setCountryCode] = useState("+233");
  const [emergencyCountryCode, setEmergencyCountryCode] = useState("+233");
  const [motherId, setMotherId] = useState("");
  const [searchResults, setSearchResults] = useState<MotherSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [formData, setFormData] = useState({
    motherName: "",
    phoneNumber: "",
    deliveryDate: "",
    dischargeDate: new Date().toISOString().split("T")[0],
    deliveryType: "" as "vaginal" | "caesarean" | "",
    outcome: "" as "well" | "loss" | "",
    medications: [] as string[],
    callingWindow: "" as "morning" | "afternoon" | "evening" | "inbound" | "",
    language: "",
    dateOfBirth: "",
    edd: "",
    gravida: "",
    para: "",
    risks: [] as string[],
    consentCalls: false,
    consentRecording: false,
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelationship: "",
    emergencyRelationshipCustom: "",
  });

  const totalSteps = foundMother ? 5 : 6;

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    setSearchError("");
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        console.log("Searching for:", searchQuery);
        const res = await api.get(
          `/mothers/search?q=${encodeURIComponent(searchQuery)}`,
        );
        console.log("Search response:", res.data);
        const results = res.data?.results;
        if (Array.isArray(results)) {
          setSearchResults(results);
        } else {
          setSearchResults([]);
          // Only show error if we expected results but got none due to error
          if (res.data?.error) {
            toast.error("Could not load results. Please try again.");
          }
        }
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
        toast.error("Search failed. Please check your connection.");
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deliveryDate = formData.deliveryDate
    ? parse(formData.deliveryDate, "yyyy-MM-dd", new Date())
    : null;
  const dischargeDate = formData.dischargeDate
    ? parse(formData.dischargeDate, "yyyy-MM-dd", new Date())
    : null;
  const firstCallDate =
    deliveryDate && dischargeDate
      ? deliveryDate >= today
        ? format(addDays(dischargeDate, 3), "dd/MM/yyyy")
        : format(addDays(new Date(), 1), "dd/MM/yyyy")
      : "";

  const phoneValid = /^\+233[25]\d{8}$/.test(formData.phoneNumber);

  const handleNext = async () => {
    // Step 0 intro - no validation
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    setTouched(true);

    if (foundMother) {
      // Shorter 4-step flow validation for existing patients
      if (currentStep === 1) {
        const step1Valid =
          formData.deliveryDate &&
          formData.dischargeDate &&
          formData.callingWindow &&
          formData.deliveryType;
        if (!step1Valid) return;
      } else if (currentStep === 2) {
        const step2Valid = formData.outcome;
        if (!step2Valid) return;
      }
      // Step 3 (Medications) is optional
      if (currentStep === 4) {
        const relValid =
          formData.emergencyRelationship &&
          (formData.emergencyRelationship !== "other" || formData.emergencyRelationshipCustom);
        const step4Valid =
          formData.emergencyName &&
          formData.emergencyPhone &&
          relValid;
        if (!step4Valid) return;
      }
    } else {
      // 6-step flow validation for new patients
      if (currentStep === 1) {
        const step1Valid =
          formData.motherName &&
          formData.phoneNumber &&
          phoneValid &&
          formData.dateOfBirth &&
          formData.gravida !== "" &&
          formData.para !== "" &&
          formData.deliveryDate &&
          formData.dischargeDate &&
          formData.language &&
          formData.callingWindow &&
          formData.deliveryType;
        if (!step1Valid) return;
      } else if (currentStep === 2) {
        const step2Valid = formData.outcome;
        if (!step2Valid) return;
      } else if (currentStep === 4) {
        const step4Valid = formData.consentCalls;
        if (!step4Valid) return;
      } else if (currentStep === 5) {
        const relValid =
          formData.emergencyRelationship &&
          (formData.emergencyRelationship !== "other" || formData.emergencyRelationshipCustom);
        const step5Valid =
          formData.emergencyName &&
          formData.emergencyPhone &&
          relValid;
        if (!step5Valid) return;
      }
    }

    setTouched(false);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const dischargePayload: Record<string, unknown> = {
        delivery_date: formData.deliveryDate,
        discharge_date: formData.dischargeDate,
        delivery_type: formData.deliveryType,
        medications: formData.medications.filter(
          (m) => m !== "none" && m !== "not_sure",
        ),
        outcome: formData.outcome,
        preferred_call_window: formData.callingWindow,
        consent_calls: foundMother ? true : formData.consentCalls,
        consent_recording: foundMother ? true : formData.consentRecording,
        emergency_contact_name: formData.emergencyName,
        emergency_contact_phone: formData.emergencyPhone,
        emergency_contact_relationship:
          formData.emergencyRelationship === "other"
            ? formData.emergencyRelationshipCustom
            : formData.emergencyRelationship,
      };
      if (formData.phoneNumber) {
        dischargePayload.phone = formData.phoneNumber;
      }

      let dischargeRes;
      if (motherId) {
        // existing patient OR new patient whose record was already created on a prior failed attempt
        dischargeRes = await api.post(`/mothers/${motherId}/discharge`, dischargePayload);
      } else {
        const motherRes = await api.post("/mothers", {
          full_name: formData.motherName,
          phone: formData.phoneNumber,
          date_of_birth: formData.dateOfBirth,
          edd: formData.deliveryDate,
          gravida: parseInt(formData.gravida) || 0,
          para: parseInt(formData.para) || 0,
          language: formData.language,
          risks: formData.risks.filter((r) => r !== "none"),
          consent_calls: formData.consentCalls,
          consent_recording: formData.consentRecording,
        });
        const newId: string = motherRes.data.mother_id ?? motherRes.data.id;
        setMotherId(newId);
        dischargeRes = await api.post(`/mothers/${newId}/discharge`, dischargePayload);
      }

      const firstCallAt: string | null = dischargeRes.data?.first_call_scheduled_at ?? null;
      const successMsg =
        formData.outcome === "loss"
          ? "Discharge recorded. Bereavement support flow activated."
          : firstCallAt
            ? `Discharge recorded. First call scheduled for ${format(new Date(firstCallAt), "d MMM 'at' h:mm a")}.`
            : "Discharge recorded. Her first call has been scheduled.";
      toast.success(successMsg);
      handleClose();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { error?: string } } })?.response?.status;
      const code = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (status === 409 || code === "already_discharged") {
        setSubmitError("This mother has already been discharged. Search for her record to view or update it.");
      } else if (status === 403 || code === "insufficient_role") {
        setSubmitError("You don't have permission to record discharges. Contact your administrator.");
      } else {
        setSubmitError("Could not save discharge. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setTouched(false);
    if (currentStep === 0) {
      handleClose();
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (currentStep === 1) {
      if (foundMother) {
        setSearchPhase(true);
      } else {
        setCurrentStep(0);
      }
    }
  };

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => {
    if (field === "risks") {
      const newRisks = value as string[];
      const prevRisks = formData.risks;

      // If 'none' was just added, clear others
      if (newRisks.includes("none") && !prevRisks.includes("none")) {
        setFormData((prev) => ({ ...prev, risks: ["none"] }));
        return;
      }
      // If something else was added while 'none' was present, remove 'none'
      if (newRisks.length > 1 && newRisks.includes("none")) {
        setFormData((prev) => ({
          ...prev,
          risks: newRisks.filter((r) => r !== "none"),
        }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const labelForMedication = (value: string) => {
    const labels: Record<string, string> = {
      pain_relief: "Pain relief",
      antibiotics: "Antibiotics",
      iron_folic: "Iron & folic acid",
      wound_care: "Wound-care supplies",
      none: "None",
      not_sure: "Not sure",
    };
    return labels[value] || value.replace(/_/g, " ");
  };

  if (searchPhase) {
    return (
      <OnboardingShell
        onClose={handleClose}
        currentStep={0}
        totalSteps={totalSteps}
        stepLabel="Discharge"
      >
        <div className="max-w-lg mx-auto mt-6">
          <StepHeader
            step={1}
            title="Find her record"
            description="She enrolled during a pregnancy visit"
          />

          {searchError && (
            <div className="mt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            </div>
          )}

          <label className="text-sm font-medium text-gray-700 mt-6">
            Search for an existing patient
          </label>

          <div className="relative mt-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <Input
              placeholder="Search by name or phone number"
              className="border-gray-200 placeholder:text-gray-400 h-10 pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {!searching &&
              searchResults?.length > 0 &&
              searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => {
                    setMotherId(result.id);
                    setFoundMother(result);
                    setFormData((prev) => ({
                      ...prev,
                      motherName: result.name,
                      phoneNumber: result.phone,
                    }));
                    setSearchPhase(false);
                    setCurrentStep(1);
                  }}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-[#93406B] cursor-pointer transition-all flex justify-between items-center group shadow-sm"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {result.name}
                    </span>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400 font-normal">
                        {result.phone}
                      </span>
                      {result.edd && (
                        <>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400 font-normal">
                            EDD{" "}
                            {format(
                              parse(result.edd, "yyyy-MM-dd", new Date()),
                              "dd/MM/yyyy",
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[#93406B] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Select →
                  </span>
                </div>
              ))}
            {!searchError &&
              searchQuery.length >= 2 &&
              !searching &&
              searchResults?.length === 0 && (
                <Alert className="border-gray-200 bg-gray-50 text-gray-500 mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Not found</AlertTitle>
                  <AlertDescription>
                    No record found for '{searchQuery}'. If she was not enrolled
                    during pregnancy, use the new discharge option below.
                  </AlertDescription>
                </Alert>
              )}
            {searching && (
              <div className="flex flex-col gap-2 mt-2">
                <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Loader2 className="h-4 w-4 animate-spin text-[#93406B]" />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px bg-gray-100 flex-1" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
              or
            </span>
            <div className="h-px bg-gray-100 flex-1" />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div
              onClick={() => {
                setFoundMother(null);
                setSearchPhase(false);
                setCurrentStep(0);
              }}
              className="bg-white border border-gray-200 rounded-xl px-5 py-6 cursor-pointer hover:border-[#93406B] hover:bg-[#F7E8F0]/30 transition-all flex flex-col items-center text-center gap-3 shadow-sm"
            >
              <div className="w-10 h-10 bg-[#F7E8F0] rounded-full flex items-center justify-center">
                <UserPlus size={20} className="text-[#93406B]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  Discharging a new mother
                </span>
                <span className="text-xs text-gray-400 font-normal mt-1 leading-relaxed">
                  She has no antenatal record with us
                </span>
              </div>
            </div>
            <div
              onClick={() => openDrawer("add-mother")}
              className="bg-white border border-gray-200 rounded-xl px-5 py-6 cursor-pointer hover:border-[#93406B] hover:bg-[#F7E8F0]/30 transition-all flex flex-col items-center text-center gap-3 shadow-sm"
            >
              <div className="w-10 h-10 bg-[#F7E8F0] rounded-full flex items-center justify-center">
                <Baby size={20} className="text-[#93406B]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  Enrolling during pregnancy
                </span>
                <span className="text-xs text-gray-400 font-normal mt-1 leading-relaxed">
                  She is still pregnant, not yet delivered
                </span>
              </div>
            </div>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      onClose={handleClose}
      currentStep={currentStep}
      totalSteps={totalSteps}
      stepLabel={
        foundMother ? "Discharge - existing patient" : "Discharge - new patient"
      }
      leftAction={
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft size={18} />
          <span>Back</span>
        </Button>
      }
      rightAction={
        <Button
          variant="default"
          onClick={handleNext}
          className="gap-2"
          disabled={submitting}
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          <span>
            {currentStep === 0
              ? "Start enrollment"
              : currentStep === totalSteps
                ? "Confirm discharge"
                : "Continue"}
          </span>
          {!submitting && <ArrowRight size={18} />}
        </Button>
      }
    >
      {currentStep === 0 && (
        <div className="flex flex-col mt-6">
          <StepHeader
            title="Before we start"
            description="This takes about 3 minutes. You're enrolling her in Omaya's follow-up care program. She'll receive check-in calls after delivery to make sure she and her baby are doing well."
          />
          <div className="flex flex-col gap-3">
            {[
              {
                icon: Phone,
                title: "She'll receive calls, not messages",
                description:
                  "Omaya calls her directly. No app needed. Works on any phone.",
              },
              {
                icon: ShieldCheck,
                title: "Her data is private",
                description:
                  "Only her care team can see her record. She controls her consent.",
              },
              {
                icon: Clock,
                title: "You can stop anytime",
                description:
                  "If she changes her mind, you can withdraw her from the program in one click.",
              },
            ].map((card, idx) => (
              <Card key={idx} className="border-gray-100 shadow-sm">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F7E8F0] flex items-center justify-center shrink-0">
                    <card.icon size={20} className="text-[#93406B]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {card.title}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {card.description}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── EXISTING PATIENT FLOW ── */}

      {foundMother && currentStep === 1 && (
        <div className="flex flex-col mt-6">
          <StepHeader
            step={1}
            title="Discharge details"
            description="Dates, delivery type, and preferred contact window."
          />
          <div className="flex flex-col gap-5">
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium">
                  Full name
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {foundMother.name}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium">Phone</span>
                <span className="text-sm font-semibold text-gray-900">
                  {foundMother.phone}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Delivery date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`justify-start gap-2 bg-white border rounded-md px-3 py-2 text-sm text-gray-900 font-normal w-full h-10 hover:bg-gray-50 ${touched && !formData.deliveryDate ? "border-red-400" : "border-gray-200"}`}
                    >
                      <CalendarIcon
                        size={16}
                        className="text-gray-400 shrink-0"
                      />
                      {formData.deliveryDate ? (
                        format(
                          parse(
                            formData.deliveryDate,
                            "yyyy-MM-dd",
                            new Date(),
                          ),
                          "dd/MM/yyyy",
                        )
                      ) : (
                        <span className="text-gray-400">Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        formData.deliveryDate
                          ? parse(
                              formData.deliveryDate,
                              "yyyy-MM-dd",
                              new Date(),
                            )
                          : undefined
                      }
                      onSelect={(date) =>
                        updateField(
                          "deliveryDate",
                          date ? format(date, "yyyy-MM-dd") : "",
                        )
                      }
                    />
                  </PopoverContent>
                </Popover>
                {touched && !formData.deliveryDate && (
                  <span className="text-xs text-red-500">
                    Please select a delivery date
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Discharge date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`justify-start gap-2 bg-white border rounded-md px-3 py-2 text-sm text-gray-900 font-normal w-full h-10 hover:bg-gray-50 ${touched && !formData.dischargeDate ? "border-red-400" : "border-gray-200"}`}
                    >
                      <CalendarIcon
                        size={16}
                        className="text-gray-400 shrink-0"
                      />
                      {formData.dischargeDate ? (
                        format(
                          parse(
                            formData.dischargeDate,
                            "yyyy-MM-dd",
                            new Date(),
                          ),
                          "dd/MM/yyyy",
                        )
                      ) : (
                        <span className="text-gray-400">Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        formData.dischargeDate
                          ? parse(
                              formData.dischargeDate,
                              "yyyy-MM-dd",
                              new Date(),
                            )
                          : undefined
                      }
                      onSelect={(date) =>
                        updateField(
                          "dischargeDate",
                          date ? format(date, "yyyy-MM-dd") : "",
                        )
                      }
                    />
                  </PopoverContent>
                </Popover>
                {touched && !formData.dischargeDate && (
                  <span className="text-xs text-red-500">
                    Please select a discharge date
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Delivery type
              </label>
              <div
                className={`grid grid-cols-2 gap-4 ${touched && !formData.deliveryType ? "[&>div]:border-red-400" : ""}`}
              >
                {[
                  { id: "vaginal", icon: Baby, title: "Vaginal delivery" },
                  { id: "caesarean", icon: Scissors, title: "C-section" },
                ].map((type) => (
                  <div
                    key={type.id}
                    onClick={() => updateField("deliveryType", type.id as any)}
                    className={`border rounded-xl px-5 py-4 cursor-pointer transition-all flex flex-col items-center text-center gap-2 ${formData.deliveryType === type.id ? "border-[#93406B] bg-[#F7E8F0]" : "border-gray-200 hover:border-[#93406B]/40"}`}
                  >
                    <type.icon
                      size={24}
                      className={
                        formData.deliveryType === type.id
                          ? "text-[#93406B]"
                          : "text-gray-400"
                      }
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      {type.title}
                    </span>
                  </div>
                ))}
              </div>
              {touched && !formData.deliveryType && (
                <span className="text-xs text-red-500 mt-2">
                  Please select a delivery type
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Preferred calling window
              </label>
              <ChipSelect
                options={[
                  { value: "morning", label: "Morning 8am-11am" },
                  { value: "afternoon", label: "Afternoon 12pm-3pm" },
                  { value: "evening", label: "Evening 4pm-6pm" },
                  { value: "inbound", label: "She will call in" },
                ]}
                selected={
                  formData.callingWindow ? [formData.callingWindow] : []
                }
                onChange={(val) =>
                  updateField(
                    "callingWindow",
                    val.length > 0 ? (val[0] as any) : "",
                  )
                }
                max={1}
              />
              {formData.callingWindow === "inbound" && (
                <span className="text-xs text-[#93406B] font-medium mt-2">
                  We will share the care line number with her on the welcome SMS
                </span>
              )}
              {touched && !formData.callingWindow && (
                <span className="text-xs text-red-500 mt-1">
                  Please select a calling window
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {foundMother && currentStep === 2 && (
        <div className="flex flex-col mt-6">
          <StepHeader
            step={2}
            title="Birth outcome"
            description="How did mother and baby do?"
          />
          <div className="flex flex-col gap-3">
            {[
              {
                id: "well",
                icon: CheckCircle2,
                title: "Mother and baby are well",
                description: "Both mother and newborn are stable and healthy",
              },
              {
                id: "loss",
                icon: Heart,
                title: "There was a loss",
                description: "Bereavement support flow will be activated",
              },
            ].map((outcome) => (
              <div
                key={outcome.id}
                onClick={() => updateField("outcome", outcome.id as any)}
                className={`border rounded-xl px-5 py-4 cursor-pointer transition-all flex items-center gap-4 ${formData.outcome === outcome.id ? "border-[#93406B] bg-[#F7E8F0]" : "border-gray-200 hover:border-[#93406B]/40"} ${touched && !formData.outcome ? "border-red-400" : ""}`}
              >
                <outcome.icon
                  size={24}
                  className={`shrink-0 ${formData.outcome === outcome.id ? "text-[#93406B]" : "text-gray-400"}`}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    {outcome.title}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">
                    {outcome.description}
                  </span>
                </div>
              </div>
            ))}
            {touched && !formData.outcome && (
              <span className="text-xs text-red-500">
                Please select an outcome
              </span>
            )}
          </div>
        </div>
      )}

      {foundMother && currentStep === 3 && (
        <div className="flex flex-col mt-6">
          <StepHeader
            step={3}
            title="Medications"
            description="What was she discharged with?"
          />
          <div className="flex flex-col gap-5">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Medications sent home
              </label>
              <ChipSelect
                options={[
                  { value: "pain_relief", label: "Pain relief" },
                  { value: "antibiotics", label: "Antibiotics" },
                  { value: "iron_folic", label: "Iron & folic acid" },
                  { value: "wound_care", label: "Wound care" },
                  { value: "none", label: "None sent home" },
                  { value: "not_sure", label: "Not sure" },
                ]}
                selected={formData.medications}
                onChange={(val) => updateField("medications", val)}
              />
            </div>
          </div>
        </div>
      )}

      {foundMother && currentStep === 4 && (
        <div className="flex flex-col mt-6">
          <StepHeader
            step={4}
            title="Emergency contact"
            description="Who should we call if we cannot reach her?"
          />
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Input
                label="Full name"
                placeholder="e.g. Kwame Asante"
                value={formData.emergencyName}
                onChange={(e) =>
                  updateField("emergencyName", e.target.value)
                }
                className={
                  touched && !formData.emergencyName ? "border-red-400" : ""
                }
                fullWidth
              />
              {touched && !formData.emergencyName && (
                <span className="text-xs text-red-500">
                  Please enter emergency contact name
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Phone number
              </label>
              <div
                className={`flex items-center border rounded-md h-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${touched && !formData.emergencyPhone ? "border-red-400" : "border-gray-200"}`}
              >
                <Select
                  value={emergencyCountryCode}
                  onValueChange={(val) => {
                    setEmergencyCountryCode(val);
                    const local = formData.emergencyPhone.replace(
                      emergencyCountryCode,
                      "",
                    );
                    updateField(
                      "emergencyPhone",
                      local ? `${val}${local}` : "",
                    );
                  }}
                >
                  <SelectTrigger className="h-auto w-fit border-0 bg-transparent px-2 py-2 text-sm font-medium text-gray-700 shadow-none focus:ring-0 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-gray-400 [&>span]:line-clamp-none whitespace-nowrap shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="min-w-[100px]">
                    <SelectItem value="+233">🇬🇭 +233</SelectItem>
                    <SelectItem value="+234">🇳🇬 +234</SelectItem>
                    <SelectItem value="+225">🇨🇮 +225</SelectItem>
                    <SelectItem value="+228">🇹🇬 +228</SelectItem>
                    <SelectItem value="+221">🇸🇳 +221</SelectItem>
                  </SelectContent>
                </Select>
                <div className="h-6 w-px bg-gray-200" />
                <Input
                  type="tel"
                  placeholder="55 123 4567"
                  value={formData.emergencyPhone.replace(emergencyCountryCode, "")}
                  onChange={(e) => {
                    const raw = e.target.value
                      .replace(/\D/g, "")
                      .replace(/^0+/, "");
                    updateField(
                      "emergencyPhone",
                      raw ? `${emergencyCountryCode}${raw}` : "",
                    );
                  }}
                  className="flex-1 border-0 bg-transparent px-2 py-2 text-gray-900 focus-visible:ring-0 shadow-none h-auto"
                />
              </div>
              {touched && !formData.emergencyPhone && (
                <span className="text-xs text-red-500">
                  Please enter emergency contact phone number
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Relationship
              </label>
              <ChipSelect
                max={1}
                options={[
                  { value: "husband", label: "Husband" },
                  { value: "wife", label: "Wife" },
                  { value: "mother", label: "Mother" },
                  { value: "father", label: "Father" },
                  { value: "brother", label: "Brother" },
                  { value: "sister", label: "Sister" },
                  { value: "son", label: "Son" },
                  { value: "daughter", label: "Daughter" },
                  { value: "uncle", label: "Uncle" },
                  { value: "aunt", label: "Aunt" },
                  { value: "cousin", label: "Cousin" },
                  { value: "grandmother", label: "Grandmother" },
                  { value: "grandfather", label: "Grandfather" },
                  { value: "friend", label: "Friend" },
                  { value: "neighbour", label: "Neighbour" },
                  { value: "colleague", label: "Colleague" },
                  { value: "other", label: "Other" },
                ]}
                selected={formData.emergencyRelationship ? [formData.emergencyRelationship] : []}
                onChange={(val) => {
                  if (val.length === 0) {
                    updateField("emergencyRelationship", "");
                  } else {
                    updateField("emergencyRelationship", val[0]);
                  }
                }}
              />
              {formData.emergencyRelationship === "other" && (
                <div className="flex flex-col gap-1.5 mt-3">
                  <Input
                    placeholder="Please specify"
                    value={formData.emergencyRelationshipCustom || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        emergencyRelationshipCustom: e.target.value,
                      }))
                    }
                    className={
                      touched && !formData.emergencyRelationshipCustom
                        ? "border-red-400"
                        : ""
                    }
                    fullWidth
                  />
                  {touched && !formData.emergencyRelationshipCustom && (
                    <span className="text-xs text-red-500">
                      Please specify relationship
                    </span>
                  )}
                </div>
              )}
              {touched && !formData.emergencyRelationship && (
                <span className="text-xs text-red-500 mt-1">
                  Please select a relationship
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {!foundMother && currentStep === 5 && (
        <div className="flex flex-col mt-6">
          <StepHeader
            step={5}
            title="Emergency contact"
            description="Who should we call if we cannot reach her?"
          />
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Input
                label="Full name"
                placeholder="e.g. Kwame Asante"
                value={formData.emergencyName}
                onChange={(e) =>
                  updateField("emergencyName", e.target.value)
                }
                className={
                  touched && !formData.emergencyName ? "border-red-400" : ""
                }
                fullWidth
              />
              {touched && !formData.emergencyName && (
                <span className="text-xs text-red-500">
                  Please enter emergency contact name
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Phone number
              </label>
              <div
                className={`flex items-center border rounded-md h-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${touched && !formData.emergencyPhone ? "border-red-400" : "border-gray-200"}`}
              >
                <Select
                  value={emergencyCountryCode}
                  onValueChange={(val) => {
                    setEmergencyCountryCode(val);
                    const local = formData.emergencyPhone.replace(
                      emergencyCountryCode,
                      "",
                    );
                    updateField(
                      "emergencyPhone",
                      local ? `${val}${local}` : "",
                    );
                  }}
                >
                  <SelectTrigger className="h-auto w-fit border-0 bg-transparent px-2 py-2 text-sm font-medium text-gray-700 shadow-none focus:ring-0 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-gray-400 [&>span]:line-clamp-none whitespace-nowrap shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="min-w-[100px]">
                    <SelectItem value="+233">🇬🇭 +233</SelectItem>
                    <SelectItem value="+234">🇳🇬 +234</SelectItem>
                    <SelectItem value="+225">🇨🇮 +225</SelectItem>
                    <SelectItem value="+228">🇹🇬 +228</SelectItem>
                    <SelectItem value="+221">🇸🇳 +221</SelectItem>
                  </SelectContent>
                </Select>
                <div className="h-6 w-px bg-gray-200" />
                <Input
                  type="tel"
                  placeholder="55 123 4567"
                  value={formData.emergencyPhone.replace(emergencyCountryCode, "")}
                  onChange={(e) => {
                    const raw = e.target.value
                      .replace(/\D/g, "")
                      .replace(/^0+/, "");
                    updateField(
                      "emergencyPhone",
                      raw ? `${emergencyCountryCode}${raw}` : "",
                    );
                  }}
                  className="flex-1 border-0 bg-transparent px-2 py-2 text-gray-900 focus-visible:ring-0 shadow-none h-auto"
                />
              </div>
              {touched && !formData.emergencyPhone && (
                <span className="text-xs text-red-500">
                  Please enter emergency contact phone number
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Relationship
              </label>
              <ChipSelect
                max={1}
                options={[
                  { value: "husband", label: "Husband" },
                  { value: "wife", label: "Wife" },
                  { value: "mother", label: "Mother" },
                  { value: "father", label: "Father" },
                  { value: "brother", label: "Brother" },
                  { value: "sister", label: "Sister" },
                  { value: "son", label: "Son" },
                  { value: "daughter", label: "Daughter" },
                  { value: "uncle", label: "Uncle" },
                  { value: "aunt", label: "Aunt" },
                  { value: "cousin", label: "Cousin" },
                  { value: "grandmother", label: "Grandmother" },
                  { value: "grandfather", label: "Grandfather" },
                  { value: "friend", label: "Friend" },
                  { value: "neighbour", label: "Neighbour" },
                  { value: "colleague", label: "Colleague" },
                  { value: "other", label: "Other" },
                ]}
                selected={formData.emergencyRelationship ? [formData.emergencyRelationship] : []}
                onChange={(val) => {
                  if (val.length === 0) {
                    updateField("emergencyRelationship", "");
                  } else {
                    updateField("emergencyRelationship", val[0]);
                  }
                }}
              />
              {formData.emergencyRelationship === "other" && (
                <div className="flex flex-col gap-1.5 mt-3">
                  <Input
                    placeholder="Please specify"
                    value={formData.emergencyRelationshipCustom || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        emergencyRelationshipCustom: e.target.value,
                      }))
                    }
                    className={
                      touched && !formData.emergencyRelationshipCustom
                        ? "border-red-400"
                        : ""
                    }
                    fullWidth
                  />
                  {touched && !formData.emergencyRelationshipCustom && (
                    <span className="text-xs text-red-500">
                      Please specify relationship
                    </span>
                  )}
                </div>
              )}
              {touched && !formData.emergencyRelationship && (
                <span className="text-xs text-red-500 mt-1">
                  Please select a relationship
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {foundMother && currentStep === 5 && (
        <div className="flex flex-col mt-6">
          <StepHeader
            step={5}
            title="Summary"
            description="Review all details before confirming discharge."
          />
          {submitError && (
            <div className="mb-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            </div>
          )}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {[
              { label: "Full name", value: formData.motherName },
              { label: "Phone", value: formData.phoneNumber },
              {
                label: "Delivery date",
                value: formData.deliveryDate
                  ? format(
                      parse(formData.deliveryDate, "yyyy-MM-dd", new Date()),
                      "dd/MM/yyyy",
                    )
                  : "",
              },
              {
                label: "Discharge date",
                value: formData.dischargeDate
                  ? format(
                      parse(formData.dischargeDate, "yyyy-MM-dd", new Date()),
                      "dd/MM/yyyy",
                    )
                  : "",
              },
              {
                label: "Delivery type",
                value:
                  formData.deliveryType === "vaginal"
                    ? "Vaginal delivery"
                    : "C-section",
              },
              {
                label: "Outcome",
                value:
                  formData.outcome === "well"
                    ? "Mother and baby well"
                    : "Pregnancy loss",
              },
              {
                label: "Medications",
                value:
                  formData.medications.length > 0
                    ? formData.medications.map(labelForMedication).join(", ")
                    : "None recorded",
              },
              {
                label: "Calling window",
                value: ({
                    morning: "Morning 8am–11am",
                    afternoon: "Afternoon 12pm–3pm",
                    evening: "Evening 4pm–6pm",
                    inbound: "She will call in",
                  } as Record<string, string>)[formData.callingWindow] || "",
              },
              {
                label: "First call",
                value:
                  formData.outcome === "well"
                    ? formData.callingWindow === "inbound"
                      ? "Care line number will be sent to her"
                      : firstCallDate || ""
                    : "Bereavement support flow",
                highlight: true,
              },
              {
                label: "Emergency contact",
                value:
                  formData.emergencyName
                    ? `${formData.emergencyName} (${formData.emergencyRelationship === "other" ? formData.emergencyRelationshipCustom : formData.emergencyRelationship})`
                    : "None recorded",
              },
              {
                label: "Emergency phone",
                value: formData.emergencyPhone || "None recorded",
              },
            ].map((row, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center px-6 py-3 ${idx % 2 === 1 ? "bg-gray-50" : ""}`}
              >
                <span className="text-sm text-gray-500 font-normal">
                  {row.label}
                </span>
                <span
                  className={`text-sm font-semibold ${row.highlight ? "text-[#93406B]" : "text-gray-900"}`}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── NEW PATIENT FLOW ── */}

      {!foundMother && currentStep === 1 && (
        <div className="flex flex-col mt-6">
          <StepHeader
            step={1}
            title="Discharge details"
            description="Her details, dates, and how to reach her after discharge."
          />
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Input
                  label="Full name"
                  placeholder="e.g. Ama Mensah"
                  value={formData.motherName}
                  onChange={(e) => updateField("motherName", e.target.value)}
                  className={
                    touched && !formData.motherName ? "border-red-400" : ""
                  }
                  fullWidth
                />
                {touched && !formData.motherName && (
                  <span className="text-xs text-red-500">
                    Please enter her full name
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <div
                  className={`flex items-center border rounded-md h-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${touched && (!formData.phoneNumber || !phoneValid) ? "border-red-400" : "border-gray-200"}`}
                >
                  <Select
                    value={countryCode}
                    onValueChange={(val) => {
                      setCountryCode(val);
                      const local = formData.phoneNumber.replace(
                        countryCode,
                        "",
                      );
                      updateField("phoneNumber", local ? `${val}${local}` : "");
                    }}
                  >
                    <SelectTrigger className="h-auto w-fit border-0 bg-transparent px-2 py-2 text-sm font-medium text-gray-700 shadow-none focus:ring-0 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-gray-400 [&>span]:line-clamp-none whitespace-nowrap shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="min-w-[100px]">
                      <SelectItem value="+233">🇬🇭 +233</SelectItem>
                      <SelectItem value="+234">🇳🇬 +234</SelectItem>
                      <SelectItem value="+225">🇨🇮 +225</SelectItem>
                      <SelectItem value="+228">🇹🇬 +228</SelectItem>
                      <SelectItem value="+221">🇸🇳 +221</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="h-6 w-px bg-gray-200" />
                  <Input
                    type="tel"
                    placeholder="55 123 4567"
                    value={formData.phoneNumber.replace(countryCode, "")}
                    onChange={(e) => {
                      const raw = e.target.value
                        .replace(/\D/g, "")
                        .replace(/^0+/, "");
                      updateField(
                        "phoneNumber",
                        raw ? `${countryCode}${raw}` : "",
                      );
                    }}
                    className="flex-1 border-0 bg-transparent px-2 py-2 text-gray-900 focus-visible:ring-0 shadow-none h-auto"
                  />
                </div>
                {touched && !formData.phoneNumber && (
                  <span className="text-xs text-red-500">
                    Please enter a phone number
                  </span>
                )}
                {touched && formData.phoneNumber && !phoneValid && (
                  <span className="text-xs text-red-500">
                    Please enter a valid phone number
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Date of birth
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`justify-start gap-2 bg-white border rounded-md px-3 py-2 text-sm text-gray-900 font-normal w-full h-10 hover:bg-gray-50 ${touched && !formData.dateOfBirth ? "border-red-400" : "border-gray-200"}`}
                  >
                    <CalendarIcon
                      size={16}
                      className="text-gray-400 shrink-0"
                    />
                    {formData.dateOfBirth ? (
                      format(
                        parse(formData.dateOfBirth, "yyyy-MM-dd", new Date()),
                        "dd/MM/yyyy",
                      )
                    ) : (
                      <span className="text-gray-400">Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.dateOfBirth
                        ? parse(formData.dateOfBirth, "yyyy-MM-dd", new Date())
                        : undefined
                    }
                    onSelect={(date) =>
                      updateField(
                        "dateOfBirth",
                        date ? format(date, "yyyy-MM-dd") : "",
                      )
                    }
                  />
                </PopoverContent>
              </Popover>
              {touched && !formData.dateOfBirth && (
                <span className="text-xs text-red-500">
                  Please select her date of birth
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Input
                  label="Gravida"
                  type="number"
                  min="0"
                  placeholder="Number of pregnancies"
                  value={formData.gravida}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseInt(val) >= 0)
                      updateField("gravida", val);
                  }}
                  className={
                    touched && formData.gravida === "" ? "border-red-400" : ""
                  }
                  fullWidth
                />
                {touched && formData.gravida === "" && (
                  <span className="text-xs text-red-500">
                    Please enter number of pregnancies
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Input
                  label="Para"
                  type="number"
                  min="0"
                  placeholder="Number of births"
                  value={formData.para}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseInt(val) >= 0)
                      updateField("para", val);
                  }}
                  className={
                    touched && formData.para === "" ? "border-red-400" : ""
                  }
                  fullWidth
                />
                {touched && formData.para === "" && (
                  <span className="text-xs text-red-500">
                    Please enter number of births
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Delivery date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`justify-start gap-2 bg-white border rounded-md px-3 py-2 text-sm text-gray-900 font-normal w-full h-10 hover:bg-gray-50 ${touched && !formData.deliveryDate ? "border-red-400" : "border-gray-200"}`}
                    >
                      <CalendarIcon
                        size={16}
                        className="text-gray-400 shrink-0"
                      />
                      {formData.deliveryDate ? (
                        format(
                          parse(
                            formData.deliveryDate,
                            "yyyy-MM-dd",
                            new Date(),
                          ),
                          "dd/MM/yyyy",
                        )
                      ) : (
                        <span className="text-gray-400">Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        formData.deliveryDate
                          ? parse(
                              formData.deliveryDate,
                              "yyyy-MM-dd",
                              new Date(),
                            )
                          : undefined
                      }
                      onSelect={(date) =>
                        updateField(
                          "deliveryDate",
                          date ? format(date, "yyyy-MM-dd") : "",
                        )
                      }
                    />
                  </PopoverContent>
                </Popover>
                {touched && !formData.deliveryDate && (
                  <span className="text-xs text-red-500">
                    Please select a delivery date
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Discharge date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`justify-start gap-2 bg-white border rounded-md px-3 py-2 text-sm text-gray-900 font-normal w-full h-10 hover:bg-gray-50 ${touched && !formData.dischargeDate ? "border-red-400" : "border-gray-200"}`}
                    >
                      <CalendarIcon
                        size={16}
                        className="text-gray-400 shrink-0"
                      />
                      {formData.dischargeDate ? (
                        format(
                          parse(
                            formData.dischargeDate,
                            "yyyy-MM-dd",
                            new Date(),
                          ),
                          "dd/MM/yyyy",
                        )
                      ) : (
                        <span className="text-gray-400">Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        formData.dischargeDate
                          ? parse(
                              formData.dischargeDate,
                              "yyyy-MM-dd",
                              new Date(),
                            )
                          : undefined
                      }
                      onSelect={(date) =>
                        updateField(
                          "dischargeDate",
                          date ? format(date, "yyyy-MM-dd") : "",
                        )
                      }
                    />
                  </PopoverContent>
                </Popover>
                {touched && !formData.dischargeDate && (
                  <span className="text-xs text-red-500">
                    Please select a discharge date
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Preferred language for calls
              </label>
              <ChipSelect
                max={1}
                options={[
                  { value: "english", label: "English" },
                  { value: "twi", label: "Twi" },
                  { value: "ga", label: "Ga" },
                  { value: "ewe", label: "Ewe" },
                ]}
                selected={formData.language ? [formData.language] : []}
                onChange={(val) =>
                  updateField("language", val.length > 0 ? val[0] : "")
                }
              />
              {touched && !formData.language && (
                <span className="text-xs text-red-500 mt-1">
                  Please select a preferred language
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Preferred calling window
              </label>
              <ChipSelect
                max={1}
                options={[
                  { value: "morning", label: "Morning 8am-11am" },
                  { value: "afternoon", label: "Afternoon 12pm-3pm" },
                  { value: "evening", label: "Evening 4pm-6pm" },
                  { value: "inbound", label: "She will call in" },
                ]}
                selected={
                  formData.callingWindow ? [formData.callingWindow] : []
                }
                onChange={(val) =>
                  updateField(
                    "callingWindow",
                    val.length > 0 ? (val[0] as any) : "",
                  )
                }
              />
              {formData.callingWindow === "inbound" && (
                <span className="text-xs text-[#93406B] font-medium mt-2">
                  We will share the care line number with her on the welcome SMS
                </span>
              )}
              {touched && !formData.callingWindow && (
                <span className="text-xs text-red-500 mt-1">
                  Please select a calling window
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Delivery type
              </label>
              <div
                className={`grid grid-cols-2 gap-4 ${touched && !formData.deliveryType ? "[&>div]:border-red-400" : ""}`}
              >
                {[
                  { id: "vaginal", icon: Baby, title: "Vaginal delivery" },
                  { id: "caesarean", icon: Scissors, title: "C-section" },
                ].map((type) => (
                  <div
                    key={type.id}
                    onClick={() => updateField("deliveryType", type.id as any)}
                    className={`border rounded-xl px-5 py-4 cursor-pointer transition-all flex flex-col items-center text-center gap-2 ${formData.deliveryType === type.id ? "border-[#93406B] bg-[#F7E8F0]" : "border-gray-200 hover:border-[#93406B]/40"}`}
                  >
                    <type.icon
                      size={24}
                      className={
                        formData.deliveryType === type.id
                          ? "text-[#93406B]"
                          : "text-gray-400"
                      }
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      {type.title}
                    </span>
                  </div>
                ))}
              </div>
              {touched && !formData.deliveryType && (
                <span className="text-xs text-red-500 mt-2">
                  Please select a delivery type
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {!foundMother && currentStep === 2 && (
        <div className="flex flex-col mt-6">
          <StepHeader
            step={2}
            title="Birth outcome"
            description="How did mother and baby do?"
          />
          <div className="flex flex-col gap-3">
            {[
              {
                id: "well",
                icon: CheckCircle2,
                title: "Mother and baby are well",
                description: "Both mother and newborn are stable and healthy",
              },
              {
                id: "loss",
                icon: Heart,
                title: "There was a loss",
                description: "Bereavement support flow will be activated",
              },
            ].map((outcome) => (
              <div
                key={outcome.id}
                onClick={() => updateField("outcome", outcome.id as any)}
                className={`border rounded-xl px-5 py-4 cursor-pointer transition-all flex items-center gap-4 ${formData.outcome === outcome.id ? "border-[#93406B] bg-[#F7E8F0]" : "border-gray-200 hover:border-[#93406B]/40"} ${touched && !formData.outcome ? "border-red-400" : ""}`}
              >
                <outcome.icon
                  size={24}
                  className={`shrink-0 ${formData.outcome === outcome.id ? "text-[#93406B]" : "text-gray-400"}`}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    {outcome.title}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">
                    {outcome.description}
                  </span>
                </div>
              </div>
            ))}
            {touched && !formData.outcome && (
              <span className="text-xs text-red-500">
                Please select an outcome
              </span>
            )}
          </div>
        </div>
      )}

      {!foundMother && currentStep === 3 && (
        <div className="flex flex-col mt-6">
          <StepHeader
            step={3}
            title="Clinical background"
            description="Select anything that applies. This helps Omaya ask the right questions and know when to escalate faster."
          />
          <div className="flex flex-col gap-5">
            <div className="flex flex-col">
              <h4 className="text-xs font-semibold text-gray-400 tracking-wide uppercase mb-4">
                Risk factors
              </h4>
              <ChipSelect
                options={[
                  { value: "prior_csection", label: "Previous C-section" },
                  {
                    value: "hypertension",
                    label: "High blood pressure or pre-eclampsia",
                  },
                  {
                    value: "diabetes",
                    label: "Diabetes (including during pregnancy)",
                  },
                  { value: "multiple", label: "Twins or more" },
                  { value: "sickle_cell", label: "Sickle cell disease" },
                  { value: "prior_loss", label: "Previous pregnancy loss" },
                  { value: "hiv_pmtct", label: "On HIV care (PMTCT)" },
                ]}
                selected={formData.risks}
                onChange={(val) => updateField("risks", val)}
              />
            </div>
          </div>
        </div>
      )}

      {!foundMother && currentStep === 4 && (
        <div className="flex flex-col mt-6">
          <StepHeader
            step={4}
            title="Her consent"
            description="Read this to her out loud, or show her the screen. Both options below must be addressed before you can enroll her."
          />
          {touched && !formData.consentCalls && (
            <div className="mb-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Consent required</AlertTitle>
                <AlertDescription>
                  You must obtain consent to check-in calls before enrolling
                </AlertDescription>
              </Alert>
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div
              onClick={() =>
                updateField("consentCalls", !formData.consentCalls)
              }
              className={`border rounded-xl px-5 py-4 flex items-start gap-4 cursor-pointer transition-all ${formData.consentCalls ? "border-[#93406B] bg-[#F7E8F0]" : "border-gray-200 bg-white"} ${touched && !formData.consentCalls ? "border-red-400" : ""}`}
            >
              <div
                className={`w-5 h-5 rounded flex-shrink-0 border mt-0.5 flex items-center justify-center ${formData.consentCalls ? "bg-[#93406B] border-[#93406B]" : "bg-white border-gray-300"}`}
              >
                {formData.consentCalls && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  Check-in calls
                </span>
                <p className="text-sm text-gray-500 font-normal mt-1 leading-relaxed">
                  Omaya will call her to check how she and her baby are doing
                  after she goes home. She can ask to stop at any time.
                </p>
                <span className="text-xs text-[#93406B] font-semibold mt-2 uppercase tracking-wide">
                  Required to enroll
                </span>
              </div>
            </div>

            <div
              onClick={() =>
                updateField("consentRecording", !formData.consentRecording)
              }
              className={`border rounded-xl px-5 py-4 flex items-start gap-4 cursor-pointer transition-all ${formData.consentRecording ? "border-[#93406B] bg-[#F7E8F0]" : "border-gray-200 bg-white"}`}
            >
              <div
                className={`w-5 h-5 rounded flex-shrink-0 border mt-0.5 flex items-center justify-center ${formData.consentRecording ? "bg-[#93406B] border-[#93406B]" : "bg-white border-gray-300"}`}
              >
                {formData.consentRecording && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  Call recording
                </span>
                <p className="text-sm text-gray-500 font-normal mt-1 leading-relaxed">
                  Calls may be recorded to improve care quality. Recordings are
                  stored securely and only used by her care team.
                </p>
                <span className="text-xs text-gray-400 font-semibold mt-2 uppercase tracking-wide">
                  Optional
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 font-normal mt-6">
            By tapping 'Confirm discharge', you confirm that you have explained
            this program to the mother and she has agreed to participate.
          </p>
        </div>
      )}

      {!foundMother && currentStep === 6 && (
        <div className="flex flex-col mt-6">
          <StepHeader
            step={6}
            title="Summary"
            description="Review all details before confirming discharge."
          />
          {submitError && (
            <div className="mb-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            </div>
          )}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {[
              { label: "Full name", value: formData.motherName },
              { label: "Phone", value: formData.phoneNumber },
              {
                label: "Date of birth",
                value: formData.dateOfBirth
                  ? format(
                      parse(formData.dateOfBirth, "yyyy-MM-dd", new Date()),
                      "dd/MM/yyyy",
                    )
                  : "",
              },
              {
                label: "Gravida / Para",
                value: `G${formData.gravida} P${formData.para}`,
              },
              {
                label: "Delivery date",
                value: formData.deliveryDate
                  ? format(
                      parse(formData.deliveryDate, "yyyy-MM-dd", new Date()),
                      "dd/MM/yyyy",
                    )
                  : "",
              },
              {
                label: "Discharge date",
                value: formData.dischargeDate
                  ? format(
                      parse(formData.dischargeDate, "yyyy-MM-dd", new Date()),
                      "dd/MM/yyyy",
                    )
                  : "",
              },
              {
                label: "Delivery type",
                value:
                  formData.deliveryType === "vaginal"
                    ? "Vaginal delivery"
                    : "C-section",
              },
              {
                label: "Outcome",
                value:
                  formData.outcome === "well"
                    ? "Mother and baby well"
                    : "Pregnancy loss",
              },
              {
                label: "Language",
                value:
                  { english: "English", twi: "Twi", ga: "Ga" }[
                    formData.language
                  ] || formData.language,
              },
              {
                label: "Clinical risks",
                value:
                  formData.risks.length > 0
                    ? formData.risks.map((r) => r.replace(/_/g, " ")).join(", ")
                    : "None recorded",
              },
              {
                label: "Consent",
                value: formData.consentCalls
                  ? "Consented to calls"
                  : "No consent",
                highlight: formData.consentCalls,
              },
              {
                label: "First call",
                value:
                  formData.outcome === "well"
                    ? formData.callingWindow === "inbound"
                      ? "Care line number will be sent to her"
                      : firstCallDate || ""
                    : "Bereavement support flow",
                highlight: true,
              },
              {
                label: "Emergency contact",
                value:
                  formData.emergencyName
                    ? `${formData.emergencyName} (${formData.emergencyRelationship === "other" ? formData.emergencyRelationshipCustom : formData.emergencyRelationship})`
                    : "None recorded",
              },
              {
                label: "Emergency phone",
                value: formData.emergencyPhone || "None recorded",
              },
            ].map((row, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center px-6 py-3 ${idx % 2 === 1 ? "bg-gray-50" : ""}`}
              >
                <span className="text-sm text-gray-500 font-normal">
                  {row.label}
                </span>
                <span
                  className={`text-sm font-semibold ${row.highlight ? "text-[#93406B]" : "text-gray-900"}`}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </OnboardingShell>
  );
};

export default NewDischarge;
