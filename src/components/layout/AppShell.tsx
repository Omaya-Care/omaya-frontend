import React, { useState, lazy, Suspense } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Phone,
  UserCog,
  Settings,
  Bell,
  ChevronsUpDown,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDrawer } from "../../contexts/DrawerContext";
import { getClinician, clearSession, initialsOf } from "../../lib/auth";
import {
  Sheet,
  SheetContent,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../components/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";

const AddMother = lazy(() => import("../../pages/AddMother"));
const NewDischarge = lazy(() => import("../../pages/NewDischarge"));

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", route: "/dashboard" },
  { icon: Users,           label: "Mothers",   route: "/mothers" },
  { icon: Phone,           label: "Calls",     route: "/calls" },
  { icon: UserCog,         label: "Staff",     route: "/staff" },
];

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { drawerType, closeDrawer } = useDrawer();

  const clinician = getClinician();
  const displayName = clinician?.name ?? clinician?.email ?? "";
  const roleLabel = clinician?.role ?? "";

  const handleSignOut = () => {
    clearSession();
    navigate("/", { replace: true });
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white">
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 lg:z-auto
          ${sidebarCollapsed ? "lg:w-[64px]" : "lg:w-[220px]"}
          w-[220px] flex-none h-full flex flex-col py-4
          bg-white border-r border-gray-100
          transition-[width] duration-200 ease-in-out overflow-hidden
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo row */}
        <div className={`pt-6 pb-8 flex items-center px-4 ${sidebarCollapsed ? "lg:justify-center" : "justify-between"}`}>
          <Link
            to="/dashboard"
            className="flex-none hover:opacity-80 transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <img src="/logo.svg" className="h-10 w-auto object-contain" alt="Omaya Care" />
          </Link>

          {/* Mobile close */}
          <button
            className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={18} />
          </button>

          {/* Desktop collapse toggle */}
          {!sidebarCollapsed && (
            <button
              className="hidden lg:flex text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
              onClick={() => setSidebarCollapsed(true)}
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 px-2">
          {/* Expand toggle when collapsed */}
          {sidebarCollapsed && (
            <div className="hidden lg:flex justify-center mb-3">
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-md hover:bg-gray-100"
                onClick={() => setSidebarCollapsed(false)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {navItems.map((item) => (
            <NavLink
              key={item.route}
              to={item.route}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm group
                ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}
                ${
                  isActive
                    ? "bg-[#F7E8F0] text-[#93406B] font-medium"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 font-normal"
                }
                focus-visible:ring-0 focus-visible:outline-none
              `}
            >
              {({ isActive }) => (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-3 ${sidebarCollapsed ? "lg:justify-center" : ""}`}>
                      <item.icon
                        size={18}
                        className={isActive ? "text-[#93406B]" : "text-gray-400 group-hover:text-gray-500"}
                      />
                      <span className={sidebarCollapsed ? "lg:hidden" : ""}>{item.label}</span>
                    </div>
                  </TooltipTrigger>
                  {sidebarCollapsed && (
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto px-2">
          {/* Notifications */}
          <div className={`flex mb-2 ${sidebarCollapsed ? "lg:justify-center" : "px-1"}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors relative">
                  <Bell size={18} />
                  {/* Unread dot — wire to real count when available */}
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#93406B] rounded-full" />
                </button>
              </TooltipTrigger>
              <TooltipContent side={sidebarCollapsed ? "right" : "top"}>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="h-px bg-gray-100 mb-2" />

          {/* Profile popover */}
          <Popover>
            <PopoverTrigger asChild>
              <div
                className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${sidebarCollapsed ? "lg:justify-center" : ""}`}
              >
                <div className="w-8 h-8 bg-[#93406B] rounded-full flex-none flex items-center justify-center text-white text-xs font-semibold">
                  {initialsOf(clinician)}
                </div>
                <div className={`flex flex-col min-w-0 flex-1 ${sidebarCollapsed ? "lg:hidden" : ""}`}>
                  <span className="text-sm font-medium text-gray-700 truncate">{displayName}</span>
                  <span className="text-xs font-normal text-gray-400 truncate">{roleLabel}</span>
                </div>
                <ChevronsUpDown
                  size={14}
                  className={`text-gray-400 flex-none ${sidebarCollapsed ? "lg:hidden" : ""}`}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              className="w-48 p-1"
              sideOffset={8}
            >
              <Link
                to="/settings"
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Settings size={15} />
                <span>Settings</span>
              </Link>
              <div className="h-px bg-gray-100 my-1" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut size={15} />
                <span>Sign out</span>
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main className="flex-1 bg-[#F4F4F5] relative flex flex-col lg:rounded-tl-2xl overflow-y-auto">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 flex-shrink-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Menu size={22} />
          </button>
          <img src="/logo.svg" className="h-8 w-auto object-contain" alt="Omaya Care" />
        </div>

        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>

      {/* ── ONBOARDING DRAWER ────────────────────────────────── */}
      <Sheet open={!!drawerType} onOpenChange={(open) => !open && closeDrawer()}>
        <SheetContent
          side="right"
          className="w-full sm:w-[580px] p-0 gap-0 sm:max-w-none [&>button]:hidden"
          overlayClassName="bg-black/40"
        >
          <Suspense fallback={
            <div className="w-full sm:w-[580px] h-full bg-white flex flex-col">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex-shrink-0">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-5 bg-gray-200 rounded-lg animate-pulse" />
              </div>
              <div className="flex-1 px-4 sm:px-8 py-6 sm:py-10 space-y-4">
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-64 bg-gray-100 rounded animate-pulse" />
                <div className="h-20 bg-gray-50 rounded-xl" />
                <div className="h-20 bg-gray-50 rounded-xl" />
              </div>
              <div className="border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-between flex-shrink-0">
                <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-9 w-32 bg-gray-200 rounded-md animate-pulse" />
              </div>
            </div>
          }>
            {drawerType === "add-mother" && <AddMother onClose={closeDrawer} />}
            {drawerType === "discharge" && <NewDischarge onClose={closeDrawer} />}
          </Suspense>
        </SheetContent>
      </Sheet>
    </div>
  );
};
