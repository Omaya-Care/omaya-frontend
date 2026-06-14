import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Phone,
  UserCog,
  //ShieldCheck,
  Settings,
  Bell,
  ChevronsUpDown,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useDrawer } from "../../contexts/DrawerContext";
import { getClinician, clearSession, initialsOf } from "../../lib/auth";

const AddMother = lazy(() => import("../../pages/AddMother"));
const NewDischarge = lazy(() => import("../../pages/NewDischarge"));

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", route: "/dashboard" },
  { icon: Users, label: "Mothers", route: "/mothers" },
  { icon: Phone, label: "Calls", route: "/calls" },
  { icon: UserCog, label: "Staff", route: "/staff" },
  // { icon: ShieldCheck, label: "Admin", route: "/admin" },
  { icon: Settings, label: "Settings", route: "/settings" },
];

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { drawerType, closeDrawer } = useDrawer();

  const clinician = getClinician();
  const displayName = clinician?.name ?? clinician?.email ?? "";
  const roleLabel = clinician?.role ?? "";

  const handleSignOut = () => {
    clearSession();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white">
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 lg:z-auto
          w-[220px] flex-none h-full flex flex-col px-3 py-4
          bg-white border-r border-gray-100
          transition-transform duration-200 ease-in-out
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo + mobile close button */}
        <div className="pt-6 pb-8 flex items-center justify-between px-2">
          <Link
            to="/dashboard"
            className="w-7 h-7 bg-[#93406B] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div className="w-2 h-2 bg-white rounded-full" />
          </Link>
          <button
            className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.route}
              to={item.route}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group
                ${
                  isActive
                    ? "bg-[#93406B] text-white font-medium"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 font-normal"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    className={
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-500"
                    }
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User profile */}
        <div className="mt-auto" ref={dropdownRef}>
          {dropdownOpen && (
            <div className="absolute bottom-[72px] left-3 right-3 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
              <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
                <User size={16} />
                <span>My profile</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
                <Bell size={16} />
                <span>Notifications</span>
              </div>
              <div className="h-px bg-gray-100 my-1" />
              <div
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 cursor-pointer hover:bg-red-50 transition-colors"
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </div>
            </div>
          )}
          <div className="h-px bg-gray-100 mb-3" />
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-[#93406B] rounded-full flex-none flex items-center justify-center text-white text-xs font-semibold">
              {initialsOf(clinician)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-gray-700 truncate">
                {displayName}
              </span>
              <span className="text-xs font-normal text-gray-400 truncate">
                {roleLabel}
              </span>
            </div>
            <ChevronsUpDown
              size={14}
              className="text-gray-400 ml-auto flex-none"
            />
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main
        className="flex-1 bg-[#F4F4F5] relative flex flex-col lg:rounded-tl-2xl overflow-y-auto"
      >
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 flex-shrink-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="w-6 h-6 bg-[#93406B] rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        </div>

        {/* Content with responsive padding */}
        <div className="p-3 md:p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Global Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-[40] transition-opacity duration-200 ${
          drawerType ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
      />

      {/* Onboarding drawer — renders on top of everything */}
      {drawerType && (
        <div className="fixed inset-y-0 right-0 z-[50] w-full sm:w-auto shadow-2xl transition-transform duration-300 transform translate-x-0">
          <Suspense fallback={null}>
            {drawerType === "add-mother" && (
              <AddMother onClose={closeDrawer} />
            )}
            {drawerType === "discharge" && (
              <NewDischarge onClose={closeDrawer} />
            )}
          </Suspense>
        </div>
      )}
    </div>
  );
};
