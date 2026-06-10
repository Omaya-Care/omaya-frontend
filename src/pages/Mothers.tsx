import { useState } from "react";
import { useDrawer } from "../contexts/DrawerContext";
import { Plus, Search, ChevronDown, ArrowLeft } from "lucide-react";
import { mothers } from "../data/mothers";
import {
  MotherListItem,
  MotherDetail,
  WithdrawModal,
  LogVisitModal,
  type LogVisitData,
} from "../components/mothers";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const MothersPage = () => {
  const { openDrawer } = useDrawer();
  const [selectedMotherId, setSelectedMotherId] = useState<string>(
    mothers[0]?.id || "",
  );
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [logVisitModalOpen, setLogVisitModalOpen] = useState(false);

  const selectedMother = mothers.find((m) => m.id === selectedMotherId) || null;

  const handleSelectMother = (id: string) => {
    setSelectedMotherId(id);
    setMobileDetailOpen(true);
  };

  const handleWithdrawConfirm = () => {
    if (selectedMother) {
      console.log("withdrawn", selectedMother.id);
    }
  };

  const handleLogVisitSave = (data: LogVisitData) => {
    console.log("visit saved", data);
  };

  return (
    <div className="h-full flex flex-row gap-4">
      {/* LEFT PANEL */}
      <div
        className={`
          flex-shrink-0 flex-col bg-white rounded-2xl overflow-hidden shadow-sm
          w-full lg:w-72 h-full
          ${mobileDetailOpen ? "hidden lg:flex" : "flex"}
        `}
      >
        {/* Top bar */}
        <div className="px-4 pt-5 pb-3 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Mothers</h2>
          <Button
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5 px-3"
            onClick={() => openDrawer('add-mother')}
          >
            <Plus size={16} />
            <span className="font-medium">Add</span>
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 flex-shrink-0">
          <Input
            placeholder="Search name or reference"
            leftIcon={<Search size={16} />}
            className="bg-gray-50/50"
          />
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 flex-shrink-0 flex gap-2">
          <button className="flex-1 flex items-center justify-between text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors font-medium">
            <span>All levels</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          <button className="flex-1 flex items-center justify-between text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors font-medium">
            <span>Most urgent</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto border-t border-gray-50">
          {mothers.map((mother) => (
            <MotherListItem
              key={mother.id}
              mother={mother}
              isSelected={selectedMotherId === mother.id}
              onClick={() => handleSelectMother(mother.id)}
            />
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className={`
          flex-col bg-white rounded-2xl overflow-y-auto shadow-sm p-6
          flex-1 h-full
          ${mobileDetailOpen ? "flex" : "hidden lg:flex"}
        `}
      >
        {/* Back button — mobile only */}
        <button
          className="lg:hidden flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 -mt-1 self-start"
          onClick={() => setMobileDetailOpen(false)}
        >
          <ArrowLeft size={16} />
          <span>Back to list</span>
        </button>

        <MotherDetail
          mother={selectedMother}
          onWithdrawClick={() => setWithdrawModalOpen(true)}
          onLogVisitClick={() => setLogVisitModalOpen(true)}
        />
      </div>

      {selectedMother && (
        <>
          <WithdrawModal
            isOpen={withdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            onConfirm={handleWithdrawConfirm}
            motherName={selectedMother.name}
          />
          <LogVisitModal
            isOpen={logVisitModalOpen}
            onClose={() => setLogVisitModalOpen(false)}
            onSave={handleLogVisitSave}
            motherName={selectedMother.name}
            dayPostpartum={selectedMother.dayPostpartum}
          />
        </>
      )}
    </div>
  );
};

export default MothersPage;
