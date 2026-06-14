import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Lock
} from 'lucide-react';
import { format, parse, addDays } from 'date-fns';
import { OnboardingShell, StepHeader, ChipSelect } from '../components/onboarding';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton } from '../components/ui';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { useDrawer } from '../contexts/DrawerContext';
import { api } from '../lib/api';

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
  const handleClose = onClose ?? (() => navigate('/dashboard'));
  const [searchPhase, setSearchPhase] = useState(true);
  const [foundMother, setFoundMother] = useState<MotherSearchResult | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [touched, setTouched] = useState(false);
  const [countryCode, setCountryCode] = useState('+233');
  const [motherId, setMotherId] = useState('');
  const [searchResults, setSearchResults] = useState<MotherSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    motherName: '',
    phoneNumber: '',
    deliveryDate: '',
    dischargeDate: new Date().toISOString().split('T')[0],
    deliveryType: '' as 'vaginal' | 'caesarean' | '',
    outcome: '' as 'well' | 'loss' | '',
    medications: [] as string[],
    callingWindow: '' as 'morning' | 'afternoon' | 'evening' | 'inbound' | '',
    language: '',
    dateOfBirth: '',
    edd: '',
    gravida: '',
    para: '',
    risks: [] as string[],
  });

  const totalSteps = 4;

  const handleNext = async () => {
    setTouched(true);
    const newPatientFields = !foundMother
      ? formData.dateOfBirth && formData.edd
      : true;
    const step1Valid = formData.motherName && formData.phoneNumber && phoneValid && formData.deliveryDate && formData.dischargeDate && formData.deliveryType && formData.language && newPatientFields;
    const step2Valid = formData.outcome;
    if ((currentStep === 1 && !step1Valid) || (currentStep === 2 && !step2Valid)) return;
    setTouched(false);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const dischargePayload: Record<string, unknown> = {
        delivery_date: formData.deliveryDate,
        discharge_date: formData.dischargeDate,
        delivery_type: formData.deliveryType,
        medications: formData.medications.filter(m => m !== 'none' && m !== 'not_sure'),
        outcome: formData.outcome,
        preferred_call_window: formData.callingWindow,
        consent_calls: true,
        consent_recording: true,
      };
      if (formData.phoneNumber) {
        dischargePayload.phone = formData.phoneNumber;
      }

      if (foundMother && motherId) {
        await api.post(`/mothers/${motherId}/discharge`, dischargePayload);
      } else {
        const motherRes = await api.post('/mothers', {
          full_name: formData.motherName,
          phone: formData.phoneNumber,
          date_of_birth: formData.dateOfBirth,
          edd: formData.edd,
          gravida: 0,
          para: 0,
          language: formData.language,
          risks: [],
          consent_calls: true,
          consent_recording: true,
        });
        const newId: string = motherRes.data.id ?? motherRes.data._id;
        await api.post(`/mothers/${newId}/discharge`, dischargePayload);
      }
      setIsSuccess(true);
    } catch {
      setSubmitError('Discharge could not be saved. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setTouched(false);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setSearchPhase(true);
    }
  };

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const filteredResults = searchResults;

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    setSearchError('');
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await api.get(`/mothers/search?q=${encodeURIComponent(searchQuery)}`);
        const results = res.data?.results;
        if (Array.isArray(results)) {
          setSearchResults(results);
        } else {
          console.log('Unexpected search response shape:', res.data);
          setSearchResults([]);
          setSearchError('Could not load results. Please try again.');
        }
      } catch {
        setSearchResults([]);
        setSearchError('');
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deliveryDate = formData.deliveryDate ? parse(formData.deliveryDate, 'yyyy-MM-dd', new Date()) : null;
  const dischargeDate = formData.dischargeDate ? parse(formData.dischargeDate, 'yyyy-MM-dd', new Date()) : null;
  const firstCallDate = deliveryDate && dischargeDate
    ? deliveryDate >= today
      ? format(addDays(dischargeDate, 3), 'dd/MM/yyyy')
      : format(addDays(new Date(), 1), 'dd/MM/yyyy')
    : '';

  const phoneValid = /^\+233[25]\d{8}$/.test(formData.phoneNumber);

  const labelForMedication = (value: string) => {
    const labels: Record<string, string> = {
      pain_relief: 'Pain relief',
      antibiotics: 'Antibiotics',
      iron_folic: 'Iron & folic acid',
      wound_care: 'Wound-care supplies',
      none: 'None',
      not_sure: 'Not sure',
    };
    return labels[value] || value.replace(/_/g, ' ');
  };

  if (isSuccess) {
    return (
      <OnboardingShell
        onClose={handleClose}
        currentStep={4}
        totalSteps={4}
        stepLabel="Discharge complete"
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] mt-6">
          <CheckCircle2 size={52} className="text-[#93406B]" />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Discharge recorded</h2>
          <p className="text-sm text-gray-500 mt-2 text-center max-w-sm font-normal">
            {formData.outcome === 'well'
              ? formData.callingWindow === 'inbound'
                ? "The care line number will be sent to her."
                : firstCallDate
                  ? `Her first call is scheduled for ${firstCallDate}.`
                  : 'The discharge has been recorded.'
              : "The discharge has been recorded. A bereavement call schedule has been assigned."}
          </p>
          <div className="mt-8 flex gap-3">
            <Button variant="outline" onClick={() => { handleClose(); navigate('/dashboard'); }}>
              Back to dashboard
            </Button>
            <Button variant="default" onClick={() => {
              setIsSuccess(false);
              setSearchPhase(true);
              setFoundMother(null);
              setMotherId('');
              setCurrentStep(1);
              setCountryCode('+233');
              setFormData({
                motherName: '',
                phoneNumber: '',
                deliveryDate: '',
                dischargeDate: new Date().toISOString().split('T')[0],
                deliveryType: '',
                outcome: '',
                medications: [],
                callingWindow: '',
                language: '',
                dateOfBirth: '',
                edd: '',
                gravida: '',
                para: '',
                risks: [],
              });
            }}>
              New discharge
            </Button>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  if (searchPhase) {
    return (
      <OnboardingShell
        onClose={handleClose}
        currentStep={0}
        totalSteps={4}
        stepLabel="Discharge"
      >
        <div className="max-w-lg mx-auto mt-6">
          <StepHeader
            step={1}
            title="Find her record"
            description="She enrolled during a pregnancy visit"
          />

          <label className="text-sm font-medium text-gray-700 mt-6">Search for an existing patient</label>

          <div className="relative mt-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search by name or phone number"
              className="border-gray-200 placeholder:text-gray-400 h-10 pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {filteredResults?.length > 0 && filteredResults.map((result) => (
              <div
                key={result.id}
                onClick={() => {
                  setMotherId(result.id);
                  setFoundMother(result);
                  setFormData(prev => ({
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
                  <span className="text-sm font-semibold text-gray-900">{result.name}</span>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400 font-normal">{result.phone}</span>
                    {result.edd && (
                      <>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400 font-normal">
                          EDD {format(parse(result.edd, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')}
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
            {searchError && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-6 flex flex-col items-center text-center">
                <span className="text-sm font-medium text-red-700">{searchError}</span>
              </div>
            )}
            {!searchError && searchQuery.length >= 2 && !searching && filteredResults?.length === 0 && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-6 flex flex-col items-center text-center">
                <span className="text-sm font-medium text-gray-700">No record found for '{searchQuery}'</span>
                <span className="text-xs text-gray-400 font-normal mt-1.5">If she was not enrolled during pregnancy, use the new discharge option below.</span>
              </div>
            )}
            {searching && (
              <div className="flex flex-col gap-2 mt-2">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-3 w-14" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px bg-gray-100 flex-1" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">or</span>
            <div className="h-px bg-gray-100 flex-1" />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div
              onClick={() => {
                setFoundMother(null);
                setSearchPhase(false);
                setCurrentStep(1);
              }}
              className="bg-white border border-gray-200 rounded-xl px-5 py-6 cursor-pointer hover:border-[#93406B] hover:bg-[#F7E8F0]/30 transition-all flex flex-col items-center text-center gap-3 shadow-sm"
            >
              <div className="w-10 h-10 bg-[#F7E8F0] rounded-full flex items-center justify-center">
                <UserPlus size={20} className="text-[#93406B]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">Discharging a new mother</span>
                <span className="text-xs text-gray-400 font-normal mt-1 leading-relaxed">She has no antenatal record with us</span>
              </div>
            </div>
            <div
              onClick={() => openDrawer('add-mother')}
              className="bg-white border border-gray-200 rounded-xl px-5 py-6 cursor-pointer hover:border-[#93406B] hover:bg-[#F7E8F0]/30 transition-all flex flex-col items-center text-center gap-3 shadow-sm"
            >
              <div className="w-10 h-10 bg-[#F7E8F0] rounded-full flex items-center justify-center">
                <Baby size={20} className="text-[#93406B]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">Enrolling during pregnancy</span>
                <span className="text-xs text-gray-400 font-normal mt-1 leading-relaxed">She is still pregnant, not yet delivered</span>
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
        foundMother
          ? 'Discharge - existing patient'
          : 'Discharge - new patient'
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
          <span>{currentStep === 4 ? 'Confirm discharge' : 'Continue'}</span>
          {!submitting && <ArrowRight size={18} />}
        </Button>
      }
    >
      {currentStep === 1 && (
        <div className="flex flex-col mt-6">
          {foundMother && (
            <div className="bg-[#F7E8F0] rounded-xl px-4 py-3 flex items-center gap-3 mb-6">
              <CheckCircle2 size={16} className="text-[#93406B]" />
              <span className="text-sm text-[#93406B] font-semibold">
                Filling in for {foundMother.name} · ANC record found
              </span>
            </div>
          )}
          <StepHeader
            step={1}
            title="Delivery details"
            description="Fill in what happened at delivery. This activates her postpartum follow-up calls."
          />
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Mother's name</label>
                <div className="relative">
                  <Input
                    placeholder="e.g. Abena Frimpong"
                    value={formData.motherName}
                    onChange={(e) => updateField('motherName', e.target.value)}
                    className={`${touched && !formData.motherName ? 'border-red-400' : ''} ${foundMother ? 'opacity-60' : ''}`}
                    fullWidth
                    readOnly={!!foundMother}
                    tabIndex={foundMother ? -1 : 0}
                  />
                  {foundMother && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <Lock size={14} />
                    </div>
                  )}
                </div>
                {touched && !formData.motherName && (
                  <span className="text-xs text-red-500">Please enter the mother's name</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Phone number</label>
                <div className={`flex items-center border rounded-md h-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${foundMother ? 'bg-gray-100 opacity-60' : ''} ${touched && (!formData.phoneNumber || !phoneValid) ? 'border-red-400' : 'border-gray-200'}`}>
                  <Select
                    value={countryCode}
                    onValueChange={(val) => {
                      setCountryCode(val);
                      const local = formData.phoneNumber.replace(countryCode, '');
                      updateField('phoneNumber', local ? `${val}${local}` : '');
                    }}
                    disabled={!!foundMother}
                  >
                    <SelectTrigger className={`h-auto w-auto min-w-0 border-0 bg-transparent px-2 py-2 text-sm font-medium shadow-none focus:ring-0 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-gray-400 ${foundMother ? 'text-gray-400' : 'text-gray-700'}`}>
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
                    value={formData.phoneNumber.replace(countryCode, '')}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                      updateField('phoneNumber', raw ? `${countryCode}${raw}` : '');
                    }}
                    readOnly={!!foundMother}
                    tabIndex={foundMother ? -1 : 0}
                    className="flex-1 border-0 bg-transparent px-2 py-2 text-gray-900 focus-visible:ring-0 shadow-none h-auto"
                  />
                  {foundMother && (
                    <div className="pr-3 text-gray-400 pointer-events-none">
                      <Lock size={14} />
                    </div>
                  )}
                </div>
                {touched && !formData.phoneNumber && (
                  <span className="text-xs text-red-500">Please enter a phone number</span>
                )}
                {touched && formData.phoneNumber && !phoneValid && (
                  <span className="text-xs text-red-500">Please enter a valid Ghana phone number</span>
                )}
              </div>
            </div>
            {!foundMother && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Date of birth</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`justify-start gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 font-normal w-full h-10 hover:bg-gray-50 ${touched && !formData.dateOfBirth ? 'border-red-400' : 'border-gray-200'}`}
                      >
                        <CalendarIcon size={16} className="text-gray-400 shrink-0" />
                        {formData.dateOfBirth
                          ? format(parse(formData.dateOfBirth, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')
                          : <span className="text-gray-400">Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dateOfBirth ? parse(formData.dateOfBirth, 'yyyy-MM-dd', new Date()) : undefined}
                        onSelect={(date) => updateField('dateOfBirth', date ? format(date, 'yyyy-MM-dd') : '')}
                      />
                    </PopoverContent>
                  </Popover>
                  {touched && !formData.dateOfBirth && (
                    <span className="text-xs text-red-500">Please select her date of birth</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Date of delivery</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`justify-start gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 font-normal w-full h-10 hover:bg-gray-50 ${touched && !formData.edd ? 'border-red-400' : 'border-gray-200'}`}
                      >
                        <CalendarIcon size={16} className="text-gray-400 shrink-0" />
                        {formData.edd
                          ? format(parse(formData.edd, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')
                          : <span className="text-gray-400">Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.edd ? parse(formData.edd, 'yyyy-MM-dd', new Date()) : undefined}
                        onSelect={(date) => updateField('edd', date ? format(date, 'yyyy-MM-dd') : '')}
                      />
                    </PopoverContent>
                  </Popover>
                  {touched && !formData.edd && (
                    <span className="text-xs text-red-500">Please select the date of delivery</span>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Delivery date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`justify-start gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 font-normal w-full h-10 hover:bg-gray-50 ${touched && !formData.deliveryDate ? 'border-red-400' : 'border-gray-200'}`}
                    >
                      <CalendarIcon size={16} className="text-gray-400 shrink-0" />
                      {formData.deliveryDate
                        ? format(parse(formData.deliveryDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')
                        : <span className="text-gray-400">Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.deliveryDate ? parse(formData.deliveryDate, 'yyyy-MM-dd', new Date()) : undefined}
                      onSelect={(date) => updateField('deliveryDate', date ? format(date, 'yyyy-MM-dd') : '')}
                    />
                  </PopoverContent>
                </Popover>
                {touched && !formData.deliveryDate && (
                  <span className="text-xs text-red-500">Please select a delivery date</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Discharge date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`justify-start gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 font-normal w-full h-10 hover:bg-gray-50 ${touched && !formData.dischargeDate ? 'border-red-400' : 'border-gray-200'}`}
                    >
                      <CalendarIcon size={16} className="text-gray-400 shrink-0" />
                      {formData.dischargeDate
                        ? format(parse(formData.dischargeDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')
                        : <span className="text-gray-400">Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dischargeDate ? parse(formData.dischargeDate, 'yyyy-MM-dd', new Date()) : undefined}
                      onSelect={(date) => updateField('dischargeDate', date ? format(date, 'yyyy-MM-dd') : '')}
                    />
                  </PopoverContent>
                </Popover>
                {touched && !formData.dischargeDate && (
                  <span className="text-xs text-red-500">Please select a discharge date</span>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-3">How was the baby delivered?</label>
              <div className={`grid grid-cols-2 gap-4 ${touched && !formData.deliveryType ? '[&>div]:border-red-400' : ''}`}>
                {([
                  { id: 'vaginal', icon: Baby, title: 'Vaginal delivery', sub: 'Natural birth' },
                  { id: 'caesarean', icon: Scissors, title: 'C-section', sub: 'Surgical delivery' }
                ] as const).map((type) => (
                  <div
                    key={type.id}
                    onClick={() => updateField('deliveryType', type.id)}
                    className={`
                      border rounded-xl px-5 py-4 cursor-pointer transition-all flex flex-col items-center text-center gap-2
                      ${formData.deliveryType === type.id ? 'border-[#93406B] bg-[#F7E8F0]' : 'border-gray-200 hover:border-[#93406B]/40'}
                    `}
                  >
                    <type.icon size={24} className={formData.deliveryType === type.id ? 'text-[#93406B]' : 'text-gray-400'} />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{type.title}</span>
                      <span className="text-xs text-gray-400 font-normal">{type.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
              {touched && !formData.deliveryType && (
                <span className="text-xs text-red-500 mt-2">Please select a delivery method</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-3">Preferred language for calls</label>
              <ChipSelect
                options={[
                  { value: "english", label: "English" },
                  { value: "twi", label: "Twi" },
                  { value: "ewe", label: "Ewe" },
                ]}
                selected={formData.language ? [formData.language] : []}
                onChange={(val) => updateField('language', val.length > 0 ? val[0] : '')}
                max={1}
              />
              {touched && !formData.language && (
                <span className="text-xs text-red-500">Please select a preferred language</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-3">Preferred calling window</label>
              <ChipSelect
                options={[
                  { value: "morning", label: "Morning (8am-11am)" },
                  { value: "afternoon", label: "Afternoon (12pm-3pm)" },
                  { value: "evening", label: "Evening (4pm-6pm)" },
                  { value: "inbound", label: "The care line number will be sent to her." },
                ]}
                selected={formData.callingWindow ? [formData.callingWindow] : []}
                onChange={(val) => updateField('callingWindow', val.length > 0 ? val[0] as 'morning' | 'afternoon' | 'evening' | 'inbound' : '')}
                max={1}
              />
              <span className="text-xs text-gray-400 mt-1">We will share the care line number with her on the welcome SMS.</span>
            </div>

            {firstCallDate && formData.callingWindow !== 'inbound' && (
              <div className="bg-[#F7E8F0] rounded-lg px-4 py-2.5 flex items-center gap-2.5">
                <Phone size={14} className="text-[#93406B] shrink-0" />
                <span className="text-xs text-[#93406B] font-medium">
                  First postpartum call scheduled for <strong>{firstCallDate}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="flex flex-col mt-6">
          <StepHeader
            step={2}
            title="How is the baby?"
            description="Select the outcome at discharge. This sets the follow-up call schedule."
          />
          <div className={`flex flex-col gap-4 ${touched && !formData.outcome ? '[&>div]:border-red-400' : ''}`}>
            <div
              onClick={() => updateField('outcome', 'well')}
              className={`
                border-2 rounded-2xl px-6 py-5 cursor-pointer transition-all flex flex-col gap-2
                ${formData.outcome === 'well' ? 'border-[#93406B] bg-[#F7E8F0]' : 'border-gray-200 hover:border-[#93406B]/40'}
              `}
            >
              <Baby size={22} className={formData.outcome === 'well' ? 'text-[#93406B]' : 'text-gray-400'} />
              <div className="flex flex-col">
                <span className="text-base font-semibold text-gray-900">Mother and baby are well</span>
                <span className="text-sm text-gray-500 font-normal mt-1 leading-relaxed">
                  {formData.callingWindow === 'inbound'
                    ? 'She prefers to call in.'
                    : firstCallDate
                      ? `Her first check-in call is scheduled for ${firstCallDate}.`
                      : 'Select a delivery and discharge date to see the first call schedule.'}
                </span>
              </div>
            </div>

            <div
              onClick={() => updateField('outcome', 'loss')}
              className={`
                border-2 rounded-2xl px-6 py-5 cursor-pointer transition-all flex flex-col gap-2
                ${formData.outcome === 'loss' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}
              `}
            >
              <Heart size={22} className="text-gray-400" />
              <div className="flex flex-col">
                <span className="text-base font-semibold text-gray-700">There was a loss</span>
                <span className="text-sm text-gray-500 font-normal mt-1 leading-relaxed">
                  A bereavement call schedule will be assigned. The care team will follow up with sensitivity.
                </span>
              </div>
            </div>
          </div>
          {touched && !formData.outcome && (
            <span className="text-xs text-red-500">Please select a baby outcome</span>
          )}
        </div>
      )}

      {currentStep === 3 && (
        <div className="flex flex-col mt-6">
          <StepHeader
            step={3}
            title="What is she going home with?"
            description="Select everything she was given. Omaya will check in on these during her follow-up calls."
          />
          <h4 className="text-xs font-semibold text-gray-400 tracking-wide uppercase mb-4">MEDICATIONS</h4>
          <ChipSelect
            options={[
              { value: "pain_relief", label: "Pain relief" },
              { value: "antibiotics", label: "Antibiotics" },
              { value: "iron_folic_acid", label: "Iron & folic acid" },
              ...(formData.deliveryType === 'caesarean' ? [{ value: "wound_care", label: "Wound-care supplies" }] : []),
              { value: "none", label: "None sent home" },
              { value: "not_sure", label: "Not sure" },
            ]}
            selected={formData.medications}
            onChange={(val) => {
              const exclusive = ['none', 'not_sure'];
              const pickedExclusive = val.filter(v => exclusive.includes(v));
              const alreadyHadExclusive = formData.medications.some(v => exclusive.includes(v));
              if (pickedExclusive.length > 0 && !alreadyHadExclusive) {
                updateField('medications', pickedExclusive);
              } else {
                updateField('medications', val.filter(v => !exclusive.includes(v)));
              }
            }}
          />
          <p className="mt-6 text-xs text-gray-400 font-normal">
            Not sure? Select that above. Omaya will ask her directly on the first call.
          </p>
        </div>
      )}

      {currentStep === 4 && (
        <div className="flex flex-col mt-6">
          <StepHeader
            step={4}
            title="Ready to go"
            description={`Here's a summary of what you've recorded.${formData.outcome === 'well' ? formData.callingWindow === 'inbound' ? ' The care line number will be sent to her.' : firstCallDate ? ` Her first check-in call is scheduled for ${firstCallDate}.` : '' : ''}`}
          />
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {[
              { label: 'Mother', value: formData.motherName || foundMother?.name || 'New mother' },
              { label: 'Phone', value: formData.phoneNumber || '—' },
              { label: 'Delivery date', value: formData.deliveryDate ? format(parse(formData.deliveryDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : '—' },
              { label: 'Delivery type', value: formData.deliveryType === 'vaginal' ? 'Vaginal delivery' : 'C-section' },
              { label: 'Baby outcome', value: formData.outcome === 'well' ? 'Live birth' : 'Pregnancy loss' },
              { label: 'Medications', value: formData.medications.includes('none') ? 'None' : (formData.medications.length > 0 ? formData.medications.map(labelForMedication).join(', ') : 'None recorded') },
              {
                label: 'First call',
                value: formData.outcome === 'well'
                  ? formData.callingWindow === 'inbound'
                    ? 'The care line number will be sent to her.'
                    : firstCallDate || 'Pending dates'
                  : 'No automated calls scheduled',
                highlight: formData.outcome === 'well'
              }
            ].map((row, idx) => (
              <div key={idx} className={`flex justify-between items-center px-6 py-3 ${idx % 2 === 1 ? 'bg-gray-50' : ''}`}>
                <span className="text-sm text-gray-500 font-normal">{row.label}</span>
                <span className={`text-sm font-semibold ${row.highlight ? 'text-[#93406B]' : 'text-gray-900'}`}>{row.value}</span>
              </div>
            ))}
          </div>

          {formData.outcome === 'well' && (
            <div className="bg-[#F7E8F0] rounded-xl px-4 py-3 mt-4 flex items-start gap-3">
              <Phone size={16} className="text-[#93406B] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#93406B] font-normal leading-relaxed">
                {formData.callingWindow === 'inbound'
                  ? `The care line number will be sent to her.`
                  : `Her first check-in call is scheduled for ${firstCallDate}.`}
              </p>
            </div>
          )}
        </div>
      )}
      {submitError && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-700 font-normal">{submitError}</p>
        </div>
      )}
    </OnboardingShell>
  );
};

export default NewDischarge;
