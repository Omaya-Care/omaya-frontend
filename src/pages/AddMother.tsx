import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Info,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { OnboardingShell, StepHeader, ChipSelect } from '../components/onboarding';
import { Button, Input } from '../components/ui';

interface AddMotherProps {
  onClose?: () => void;
}

const AddMother = ({ onClose }: AddMotherProps = {}) => {
  const navigate = useNavigate();
  const handleClose = onClose ?? (() => navigate('/mothers'));
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dob: '',
    edd: '',
    gravida: '',
    para: '',
    language: [] as string[],
    risks: [] as string[],
    consentCalls: false,
    consentRecording: false,
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Enrolling mother:', formData);
      setIsSuccess(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isSuccess) {
    return (
      <OnboardingShell
        onClose={handleClose}
        currentStep={4}
        totalSteps={4}
        stepLabel="Enrollment complete"
      >
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <CheckCircle2 size={52} className="text-[#93406B]" />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">She's enrolled</h2>
          <p className="text-sm text-gray-500 mt-2 text-center max-w-sm font-normal">
            {formData.fullName} has been added to Omaya Care. Her first check-in call will be scheduled after her delivery date.
          </p>
          <div className="mt-8 flex gap-3">
            <Button variant="secondary" onClick={() => { handleClose(); navigate('/mothers'); }}>
              View her record
            </Button>
            <Button variant="primary" onClick={() => {
              setIsSuccess(false);
              setCurrentStep(1);
              setFormData({
                fullName: '',
                phone: '',
                dob: '',
                edd: '',
                gravida: '',
                para: '',
                language: [],
                risks: [],
                consentCalls: false,
                consentRecording: false,
              });
            }}>
              Enroll another
            </Button>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  const stepLabels = [
    "Antenatal enrollment",
    "Her details",
    "Clinical background",
    "Consent"
  ];

  return (
    <OnboardingShell
      onClose={handleClose}
      currentStep={currentStep}
      totalSteps={totalSteps}
      stepLabel={stepLabels[currentStep - 1]}
      leftAction={
        currentStep > 1 && (
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft size={18} />
            <span>Back</span>
          </Button>
        )
      }
      rightAction={
        <Button
          variant="primary"
          onClick={handleNext}
          className="gap-2"
          disabled={
            (currentStep === 2 && (!formData.fullName || !formData.phone)) ||
            (currentStep === 4 && !formData.consentCalls)
          }
        >
          <span>
            {currentStep === 1 ? 'Start enrollment' : currentStep === 4 ? 'Enroll her' : 'Continue'}
          </span>
          <ArrowRight size={18} />
        </Button>
      }
    >
      {currentStep === 1 && (
        <div className="flex flex-col">
          <StepHeader
            step={1}
            title="Before we start"
            description="This takes about 3 minutes. You're enrolling her in Omaya's follow-up care program — she'll receive check-in calls after delivery to make sure she and her baby are doing well."
          />
          <div className="flex flex-col gap-3">
            {[
              { icon: Phone, title: "She'll receive calls, not messages", body: "Omaya calls her directly. No app needed. Works on any phone." },
              { icon: ShieldCheck, title: "Her data is private", body: "Only her care team can see her record. She controls her consent." },
              { icon: Clock, title: "You can stop anytime", body: "If she changes her mind, you can withdraw her from the program in one click." }
            ].map((card, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl px-5 py-4 flex items-start gap-4">
                <card.icon size={20} className="text-[#93406B] mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">{card.title}</span>
                  <span className="text-sm text-gray-500 font-normal mt-0.5">{card.body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="flex flex-col">
          <StepHeader
            step={2}
            title="Her details"
            description="Pre-fill from her ANC record where possible. Double-check the phone number — this is how Omaya reaches her."
          />
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full name"
                placeholder="e.g. Ama Mensah"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                fullWidth
              />
              <div className="flex flex-col gap-1.5">
                <Input
                  label="Phone number"
                  placeholder="+233 XX XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  fullWidth
                />
                <span className="text-xs text-gray-400 font-normal">
                  We'll use this number for all calls. Make sure it's active.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date of birth"
                type="date"
                value={formData.dob}
                onChange={(e) => updateField('dob', e.target.value)}
                fullWidth
              />
              <Input
                label="Expected delivery date"
                type="date"
                value={formData.edd}
                onChange={(e) => updateField('edd', e.target.value)}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Gravida"
                type="number"
                placeholder="Number of pregnancies"
                value={formData.gravida}
                onChange={(e) => updateField('gravida', e.target.value)}
                fullWidth
              />
              <Input
                label="Para"
                type="number"
                placeholder="Number of births"
                value={formData.para}
                onChange={(e) => updateField('para', e.target.value)}
                fullWidth
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-700">Preferred language for calls</label>
              <ChipSelect
                max={1}
                options={[
                  { value: 'english', label: 'English' },
                  { value: 'twi', label: 'Twi' },
                  { value: 'ga', label: 'Ga' },
                  { value: 'ewe', label: 'Ewe' },
                  { value: 'dagbani', label: 'Dagbani' },
                ]}
                selected={formData.language}
                onChange={(val) => updateField('language', val)}
              />
            </div>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="flex flex-col">
          <StepHeader
            step={3}
            title="Clinical background"
            description="Select anything that applies. This helps Omaya ask the right questions and know when to escalate faster. Leave blank if nothing applies."
          />
          <h4 className="text-xs font-semibold text-gray-400 tracking-wide uppercase mb-4">SELECT ALL THAT APPLY</h4>
          <ChipSelect
            options={[
              { value: "prior_csection", label: "Previous C-section" },
              { value: "hypertension", label: "High blood pressure or pre-eclampsia" },
              { value: "diabetes", label: "Diabetes (including during pregnancy)" },
              { value: "multiple", label: "Twins or more" },
              { value: "sickle_cell", label: "Sickle cell disease" },
              { value: "prior_loss", label: "Previous pregnancy loss" },
              { value: "hiv_pmtct", label: "On HIV care (PMTCT)" },
            ]}
            selected={formData.risks}
            onChange={(val) => updateField('risks', val)}
          />
          <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-start gap-3 mt-6">
            <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500 font-normal leading-relaxed">
              These flags are stored securely and only visible to her assigned midwife and hospital admin. They are never shared or used for anything outside her care.
            </p>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="flex flex-col">
          <StepHeader
            step={4}
            title="Her consent"
            description="Read this to her out loud, or show her the screen. Both options below must be addressed before you can enroll her."
          />
          <div className="flex flex-col gap-4">
            <div
              onClick={() => updateField('consentCalls', !formData.consentCalls)}
              className={`
                border rounded-xl px-5 py-4 flex items-start gap-4 cursor-pointer transition-all
                ${formData.consentCalls ? 'border-[#93406B] bg-[#F7E8F0]' : 'border-gray-200 bg-white'}
              `}
            >
              <div className={`
                w-5 h-5 rounded flex-shrink-0 border mt-0.5 flex items-center justify-center
                ${formData.consentCalls ? 'bg-[#93406B] border-[#93406B]' : 'bg-white border-gray-300'}
              `}>
                {formData.consentCalls && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">Check-in calls</span>
                <p className="text-sm text-gray-500 font-normal mt-1 leading-relaxed">
                  Omaya will call her to check how she and her baby are doing after she goes home. She can ask to stop at any time.
                </p>
                <span className="text-xs text-[#93406B] font-semibold mt-2 uppercase tracking-wide">REQUIRED TO ENROLL</span>
              </div>
            </div>

            <div
              onClick={() => updateField('consentRecording', !formData.consentRecording)}
              className={`
                border rounded-xl px-5 py-4 flex items-start gap-4 cursor-pointer transition-all
                ${formData.consentRecording ? 'border-[#93406B] bg-[#F7E8F0]' : 'border-gray-200 bg-white'}
              `}
            >
              <div className={`
                w-5 h-5 rounded flex-shrink-0 border mt-0.5 flex items-center justify-center
                ${formData.consentRecording ? 'bg-[#93406B] border-[#93406B]' : 'bg-white border-gray-300'}
              `}>
                {formData.consentRecording && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">Call recording</span>
                <p className="text-sm text-gray-500 font-normal mt-1 leading-relaxed">
                  Calls may be recorded to improve care quality. Recordings are stored securely and only used by her care team.
                </p>
                <span className="text-xs text-gray-400 font-semibold mt-2 uppercase tracking-wide">OPTIONAL</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 font-normal mt-6">
            By tapping 'Enroll her', you confirm that you have explained this program to the mother and she has agreed to participate.
          </p>
        </div>
      )}
    </OnboardingShell>
  );
};

export default AddMother;
