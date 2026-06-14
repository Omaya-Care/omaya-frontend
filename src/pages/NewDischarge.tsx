import { useState } from 'react';
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
  CalendarIcon
} from 'lucide-react';
import { format, parse, addDays } from 'date-fns';
import { OnboardingShell, StepHeader, ChipSelect } from '../components/onboarding';
import { Button, Input } from '../components/ui';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

interface NewDischargeProps {
  onClose?: () => void;
}

interface MotherSearchResult {
  id: string;
  name: string;
  edd: string;
}

const NewDischarge = ({ onClose }: NewDischargeProps = {}) => {
  const navigate = useNavigate();
  const handleClose = onClose ?? (() => navigate('/dashboard'));
  const [searchPhase, setSearchPhase] = useState(true);
  const [foundMother, setFoundMother] = useState<MotherSearchResult | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [touched, setTouched] = useState(false);
  const [countryCode, setCountryCode] = useState('+233');

  const [formData, setFormData] = useState({
    motherName: '',
    phoneNumber: '',
    deliveryDate: '',
    dischargeDate: new Date().toISOString().split('T')[0],
    deliveryType: '' as 'vaginal' | 'caesarean' | '',
    outcome: '' as 'well' | 'loss' | '',
    medications: [] as string[],
    callingWindow: '' as 'morning' | 'afternoon' | 'evening' | 'inbound' | '',
  });

  const totalSteps = 4;

  const handleNext = () => {
    setTouched(true);
    const step1Valid = formData.motherName && formData.phoneNumber && phoneValid && formData.deliveryDate && formData.dischargeDate && formData.deliveryType;
    const step2Valid = formData.outcome;
    if ((currentStep === 1 && !step1Valid) || (currentStep === 2 && !step2Valid)) return;
    setTouched(false);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Recording discharge:', { foundMother, ...formData });
      console.log(`Sending SMS to ${formData.phoneNumber}: Welcome to Omaya Care. Your postpartum care has been scheduled. Reply HELP for assistance.`);
      setIsSuccess(true);
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

  const mockResults = [
    { id: 'm1', name: 'Abena Frimpong', edd: '12 Jun 2026' },
    { id: 'm2', name: 'Akosua Adjei', edd: '18 Jun 2026' },
  ];

  const filteredResults = searchQuery.length >= 2
    ? mockResults.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deliveryDate = formData.deliveryDate ? parse(formData.deliveryDate, 'yyyy-MM-dd', new Date()) : null;
  const dischargeDate = formData.dischargeDate ? parse(formData.dischargeDate, 'yyyy-MM-dd', new Date()) : null;
  const firstCallDate = deliveryDate && dischargeDate
    ? deliveryDate >= today
      ? format(addDays(dischargeDate, 3), 'dd/MM/yyyy')
      : format(addDays(new Date(), 1), 'dd/MM/yyyy')
    : '';

  const localDigits = formData.phoneNumber.replace(countryCode, '');
  const phoneValid = localDigits.length >= 9;

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
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <CheckCircle2 size={52} className="text-[#93406B]" />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Discharge recorded</h2>
          <p className="text-sm text-gray-500 mt-2 text-center max-w-sm font-normal">
            {formData.outcome === 'well'
              ? formData.callingWindow === 'inbound'
                ? "She will call in — share the care line number on the welcome SMS."
                : firstCallDate
                  ? `Her first call is scheduled for ${firstCallDate}.`
                  : 'The discharge has been recorded.'
              : "The discharge has been recorded. A bereavement call schedule has been assigned."}
          </p>
          <div className="mt-8 flex gap-3">
            <Button variant="secondary" onClick={() => { handleClose(); navigate('/dashboard'); }}>
              Back to dashboard
            </Button>
            <Button variant="primary" onClick={() => {
              setIsSuccess(false);
              setSearchPhase(true);
              setFoundMother(null);
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
        stepLabel="Find her record"
      >
        <div className="max-w-lg mx-auto">
          <StepHeader
            step={1}
            title="Is she already enrolled?"
            description="Search for her antenatal record first. If she enrolled during a pregnancy visit, her details are already here."
          />

          <div className="mt-6">
            <Input
              placeholder="Search by name or phone number"
              leftIcon={<Search size={20} />}
              className="py-3.5 text-base bg-gray-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                onClick={() => {
                  setFoundMother(result);
                  setSearchPhase(false);
                  setCurrentStep(1);
                }}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-[#93406B] cursor-pointer transition-all flex justify-between items-center group shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">{result.name}</span>
                  <span className="text-xs text-gray-400 font-normal mt-0.5">ANC enrolled · EDD {result.edd}</span>
                </div>
                <span className="text-xs text-[#93406B] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Select →
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px bg-gray-100 flex-1" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">or</span>
            <div className="h-px bg-gray-100 flex-1" />
          </div>

          <div
            onClick={() => {
              setFoundMother(null);
              setSearchPhase(false);
              setCurrentStep(1);
            }}
            className="mt-8 bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 cursor-pointer hover:bg-gray-100 transition-all flex items-start gap-4"
          >
            <UserPlus size={18} className="text-gray-400 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-700">She wasn't enrolled antenatally</span>
              <span className="text-xs text-gray-400 font-normal mt-0.5">Start a full enrollment at discharge</span>
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
      stepLabel="Discharge details"
      leftAction={
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft size={18} />
          <span>Back</span>
        </Button>
      }
      rightAction={
        <Button
          variant="primary"
          onClick={handleNext}
          className="gap-2"
        >
          <span>{currentStep === 4 ? 'Confirm discharge' : 'Continue'}</span>
          <ArrowRight size={18} />
        </Button>
      }
    >
      {currentStep === 1 && (
        <div className="flex flex-col">
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
                <Input
                  placeholder="e.g. Abena Frimpong"
                  value={formData.motherName}
                  onChange={(e) => updateField('motherName', e.target.value)}
                  className={`${touched && !formData.motherName ? 'border-red-400' : ''}`}
                  fullWidth
                />
                {touched && !formData.motherName && (
                  <span className="text-xs text-red-500">Please enter the mother's name</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Phone number</label>
                <div className="relative flex items-center">
                  <select
                    value={countryCode}
                    onChange={(e) => {
                      const newCode = e.target.value;
                      setCountryCode(newCode);
                      const local = formData.phoneNumber.replace(countryCode, '');
                      updateField('phoneNumber', local ? `${newCode}${local}` : '');
                    }}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-transparent border-none text-sm text-gray-700 font-medium cursor-pointer pl-2 pr-5 py-2 appearance-none focus:outline-none"
                  >
                    <option value="+233">🇬🇭 +233</option>
                    <option value="+234">🇳🇬 +234</option>
                    <option value="+225">🇨🇮 +225</option>
                    <option value="+228">🇹🇬 +228</option>
                    <option value="+221">🇸🇳 +221</option>
                  </select>
                  <svg className="absolute left-[72px] top-1/2 -translate-y-1/2 z-10 pointer-events-none" width="8" height="4" viewBox="0 0 8 4" fill="none">
                    <path d="M1 0.5L4 3.5L7 0.5" stroke="#9CA3AF" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="tel"
                    placeholder="55 123 4567"
                    value={formData.phoneNumber.replace(countryCode, '')}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                      updateField('phoneNumber', raw ? `${countryCode}${raw}` : '');
                    }}
                    className={`w-full bg-gray-50 border rounded-lg pl-[92px] pr-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#93406B] focus:border-transparent ${touched && (!formData.phoneNumber || !phoneValid) ? 'border-red-400' : 'border-gray-200'}`}
                  />
                </div>
                {touched && !formData.phoneNumber && (
                  <span className="text-xs text-red-500">Please enter a phone number</span>
                )}
                {touched && formData.phoneNumber && !phoneValid && (
                  <span className="text-xs text-red-500">Please enter a valid phone number</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Delivery date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`justify-start gap-2 bg-gray-50 border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 font-normal w-full hover:bg-gray-100 ${touched && !formData.deliveryDate ? 'border-red-400' : 'border-gray-200'}`}
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
                      className={`justify-start gap-2 bg-gray-50 border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 font-normal w-full hover:bg-gray-100 ${touched && !formData.dischargeDate ? 'border-red-400' : 'border-gray-200'}`}
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
              <label className="text-sm font-semibold text-gray-700 mb-3">Preferred calling window</label>
              <ChipSelect
                options={[
                  { value: "morning", label: "Morning (8am-11am)" },
                  { value: "afternoon", label: "Afternoon (12pm-3pm)" },
                  { value: "evening", label: "Evening (4pm-6pm)" },
                  { value: "inbound", label: "She will call in" },
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
        <div className="flex flex-col">
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
        <div className="flex flex-col">
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
              { value: "iron_folic", label: "Iron & folic acid" },
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
        <div className="flex flex-col">
          <StepHeader
            step={4}
            title="Ready to go"
            description={`Here's a summary of what you've recorded.${formData.outcome === 'well' ? formData.callingWindow === 'inbound' ? ' She will call in — share the care line number on the welcome SMS.' : firstCallDate ? ` Her first check-in call is scheduled for ${firstCallDate}.` : '' : ''}`}
          />
          <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-sm">
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
                    ? 'She will call in — share the care line number on the welcome SMS'
                    : firstCallDate || 'Pending dates'
                  : 'No automated calls scheduled',
                highlight: formData.outcome === 'well'
              }
            ].map((row, idx) => (
              <div key={idx} className={`flex justify-between items-center ${idx !== 6 ? 'border-b border-gray-100 pb-3' : ''}`}>
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
                  ? `She will call in — share the care line number on the welcome SMS.`
                  : `Her first check-in call is scheduled for ${firstCallDate}.`}
              </p>
            </div>
          )}
        </div>
      )}
    </OnboardingShell>
  );
};

export default NewDischarge;
