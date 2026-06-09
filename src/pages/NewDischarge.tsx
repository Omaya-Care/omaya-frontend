import React, { useState } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { OnboardingShell, StepHeader, ChipSelect } from '../components/onboarding';
import { Button, Input } from '../components/ui';

const NewDischarge = () => {
  const navigate = useNavigate();
  const [searchPhase, setSearchPhase] = useState(true);
  const [foundMother, setFoundMother] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    deliveryDate: '',
    dischargeDate: new Date().toISOString().split('T')[0],
    deliveryType: '' as 'vaginal' | 'caesarean' | '',
    outcome: '' as 'well' | 'loss' | '',
    medications: [] as string[],
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Recording discharge:', { foundMother, ...formData });
      setIsSuccess(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setSearchPhase(true);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const mockResults = [
    { id: 'm1', name: 'Abena Frimpong', edd: '12 Jun 2026' },
    { id: 'm2', name: 'Akosua Adjei', edd: '18 Jun 2026' },
  ];

  const filteredResults = searchQuery.length >= 2
    ? mockResults.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  if (isSuccess) {
    return (
      <OnboardingShell
        onClose={() => navigate('/dashboard')}
        currentStep={4}
        totalSteps={4}
        stepLabel="Discharge complete"
      >
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <CheckCircle2 size={52} className="text-[#93406B]" />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Discharge recorded</h2>
          <p className="text-sm text-gray-500 mt-2 text-center max-w-sm font-normal">
            {formData.outcome === 'well'
              ? "Her first call is scheduled for tomorrow morning. You'll be notified if she needs attention."
              : "The discharge has been recorded. No automated calls will be made."}
          </p>
          <div className="mt-8 flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Back to dashboard
            </Button>
            <Button variant="primary" onClick={() => {
              setIsSuccess(false);
              setSearchPhase(true);
              setFoundMother(null);
              setCurrentStep(1);
              setFormData({
                deliveryDate: '',
                dischargeDate: new Date().toISOString().split('T')[0],
                deliveryType: '',
                outcome: '',
                medications: [],
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
        onClose={() => navigate('/dashboard')}
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
      onClose={() => navigate('/dashboard')}
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
          disabled={
            (currentStep === 1 && (!formData.deliveryDate || !formData.deliveryType)) ||
            (currentStep === 2 && !formData.outcome)
          }
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
              <Input
                label="Delivery date"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => updateField('deliveryDate', e.target.value)}
                fullWidth
              />
              <Input
                label="Discharge date"
                type="date"
                value={formData.dischargeDate}
                onChange={(e) => updateField('dischargeDate', e.target.value)}
                fullWidth
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-3">How was the baby delivered?</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'vaginal', icon: Baby, title: 'Vaginal delivery', sub: 'Natural birth' },
                  { id: 'caesarean', icon: Scissors, title: 'C-section', sub: 'Surgical delivery' }
                ].map((type) => (
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
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="flex flex-col">
          <StepHeader
            step={2}
            title="How is the baby?"
            description="This determines what happens next. Take a moment — it's okay to pause here."
          />
          <div className="flex flex-col gap-4">
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
                  Postpartum calls will begin the morning after discharge.
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
                  Automated calls will not be scheduled. A member of the care team will follow up directly.
                </span>
              </div>
            </div>

            {formData.outcome === 'loss' && (
              <div className="bg-gray-50 rounded-xl px-4 py-3 mt-4">
                <p className="text-sm text-gray-500 font-normal leading-relaxed">
                  Please make sure the care team is aware. No automated calls will be made to this mother.
                </p>
              </div>
            )}
          </div>
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
            ]}
            selected={formData.medications}
            onChange={(val) => {
              if (val.includes('none') && !formData.medications.includes('none')) {
                updateField('medications', ['none']);
              } else {
                updateField('medications', val.filter(v => v !== 'none'));
              }
            }}
          />
          <p className="mt-6 text-xs text-gray-400 font-normal">
            Not sure? It's okay to leave this blank — Omaya will ask her directly on the first call.
          </p>
        </div>
      )}

      {currentStep === 4 && (
        <div className="flex flex-col">
          <StepHeader
            step={4}
            title="Ready to go"
            description="Here's a summary of what you've recorded. Her first check-in call is scheduled for tomorrow morning."
          />
          <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-sm">
            {[
              { label: 'Mother', value: foundMother?.name || 'New mother' },
              { label: 'Delivery', value: formData.deliveryType === 'vaginal' ? 'Vaginal delivery' : 'C-section' },
              { label: 'Discharge date', value: formData.dischargeDate },
              { label: 'Outcome', value: formData.outcome === 'well' ? 'Live birth' : 'Adverse outcome' },
              { label: 'Medications', value: formData.medications.includes('none') ? 'None' : (formData.medications.length > 0 ? formData.medications.join(', ') : 'None recorded') },
              {
                label: 'First call',
                value: formData.outcome === 'well' ? 'Tomorrow morning' : 'No automated calls scheduled',
                highlight: formData.outcome === 'well'
              }
            ].map((row, idx) => (
              <div key={idx} className={`flex justify-between items-center ${idx !== 5 ? 'border-b border-gray-100 pb-3' : ''}`}>
                <span className="text-sm text-gray-500 font-normal">{row.label}</span>
                <span className={`text-sm font-semibold ${row.highlight ? 'text-[#93406B]' : 'text-gray-900'}`}>{row.value}</span>
              </div>
            ))}
          </div>

          {formData.outcome === 'well' && (
            <div className="bg-[#F7E8F0] rounded-xl px-4 py-3 mt-4 flex items-start gap-3">
              <Phone size={16} className="text-[#93406B] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#93406B] font-normal leading-relaxed">
                Her first check-in call will go out tomorrow morning. You'll be notified if she flags anything.
              </p>
            </div>
          )}
        </div>
      )}
    </OnboardingShell>
  );
};

export default NewDischarge;
