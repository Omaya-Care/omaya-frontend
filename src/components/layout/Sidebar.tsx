import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronsUpDown,
  HeartHandshake,
  House,
  LogOut,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Settings,
  TriangleAlert,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { endSession, invalidateMe, logout } from "../../lib/auth-api";
import { usePermissions, type Permission } from "@/hooks/usePermissions";
import { MD_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";
import { SidebarAlertSoundReminder } from "./SidebarAlertSoundReminder";
import {
  EXPERT_HOSPITAL_NAME,
  SESSION_STORAGE_KEY,
  clearSession,
  getClinician,
} from "../../lib/auth";
import { cn } from "../../lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const MAIN_NAV: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: House },
  { to: "/mothers", label: "Mothers", icon: Users },
  { to: "/calls", label: "Calls", icon: Phone },
  { to: "/chats", label: "Chats", icon: MessageCircle },
  { to: "/escalations", label: "Escalations", icon: TriangleAlert },
  { to: "/expert-requests", label: "Expert requests", icon: HeartHandshake },
  { to: "/staff", label: "Staff", icon: UserCog },
];

// Nav items hidden without a role permission — the same map the router's
// <RequirePermission> guards enforce. Unlisted items are always shown.
const NAV_PERMISSIONS: Partial<Record<string, Permission>> = {
  "/mothers": "view_mothers",
  "/calls": "view_mothers",
  "/chats": "view_mothers",
  "/escalations": "escalate",
  "/expert-requests": "view_mothers",
  "/staff": "manage_staff",
};

// Mother-cohort pages are meaningless for an expert-roster account (it has no
// mothers of its own; RLS returns nothing), so they're hidden for it on top of
// the permission filter — hospital-name-gated, not permission-gated.
const NON_EXPERT_ROUTES = new Set(["/mothers", "/calls", "/chats", "/staff", "/escalations"]);
// The inverse: THE page for an expert account, pure noise for a hospital
// clinician (even one holding view_mothers). <RequireExpert> enforces it.
const EXPERT_ONLY_ROUTES = new Set(["/expert-requests"]);

const itemBase =
  "flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm font-normal transition-colors";

function SidebarLink({
  item,
  collapsed = false,
  onNavigate,
}: {
  item: NavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      // Closes the mobile drawer even on the current route (no pathname change).
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          itemBase,
          // Active background is drawn by the sliding indicator, not here.
          "relative z-10",
          isActive ? "text-[#7A2850]" : "text-black hover:bg-black/[0.04]",
        )
      }
    >
      <Icon size={17} strokeWidth={1.75} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

interface IndicatorBox {
  top: number;
  height: number;
  left: number;
  width: number;
}

/** Tracks the active nav link inside `containerRef` so a single highlight
 *  can slide between items instead of each link painting its own. */
function useActiveIndicator(
  containerRef: React.RefObject<HTMLDivElement | null>,
  /** Changes when the set of nav items changes (permissions load), so the
   *  pill re-measures when items appear above the active one. */
  itemsKey: string,
) {
  const { pathname } = useLocation();
  const [box, setBox] = useState<IndicatorBox | null>(null);
  // Only a route change slides the pill. The first placement and any resize
  // (sidebar collapse/expand, window resize) snap it, so it tracks the
  // shrinking item exactly instead of trailing behind it.
  const [animate, setAnimate] = useState(false);
  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const active = container.querySelector<HTMLElement>('[aria-current="page"]');
      setBox(
        active
          ? {
              top: active.offsetTop,
              height: active.offsetHeight,
              left: active.offsetLeft,
              width: active.offsetWidth,
            }
          : null,
      );
    };
    setAnimate(hasMounted.current);
    hasMounted.current = true;
    measure();
    // ResizeObserver fires once on observe — skip that one; it's not a resize.
    let initial = true;
    const observer = new ResizeObserver(() => {
      if (initial) {
        initial = false;
        return;
      }
      setAnimate(false);
      measure();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, pathname, itemsKey]);

  return { box, animate };
}

/** First letter of the name, else the email. */
function initialFor(name: string | null | undefined, email: string): string {
  return (name?.trim().charAt(0) || email.charAt(0)).toUpperCase();
}

/** Nav items this clinician may see. Deny-until-loaded: gated items appear
 *  once /auth/me answers. */
function useVisibleNav(isExpertAccount: boolean): NavItem[] {
  const { can } = usePermissions();
  return MAIN_NAV.filter((item) => {
    if (isExpertAccount && NON_EXPERT_ROUTES.has(item.to)) return false;
    if (!isExpertAccount && EXPERT_ONLY_ROUTES.has(item.to)) return false;
    const required = NAV_PERMISSIONS[item.to];
    return !required || can(required);
  });
}

/** Portal sidebar — sits on the grey app backdrop; logo + collapse toggle,
 *  primary nav on top, settings + account card pinned to the bottom. */
export function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  /** Below `md`: whether the off-canvas drawer is open. */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
} = {}) {
  const clinician = getClinician();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const visibleNav = useVisibleNav(clinician?.hospital_name === EXPERT_HOSPITAL_NAME);
  const navigate = useNavigate();

  // Cross-tab sign-out. `clearSession()` only removes localStorage keys, and
  // nothing listened for that, so a SECOND open tab kept its in-memory profile
  // and went on polling /alerts with the still-valid HttpOnly cookie — showing
  // patient escalation data after the clinician had signed out. On a shared
  // clinic machine that is the whole threat model. JS cannot clear the
  // HttpOnly cookie; what IS guaranteed client-side is that the instant any
  // tab clears the session, every other tab drops it too.
  // A DIFFERENT clinician signing in from another tab replaces the cookie
  // under this one, so this tab would show A's profile while every request
  // rides B's session — reload so it re-reads who is signed in.
  const mountedClinicianId = clinician?.id;
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      // `key === null` is a whole-storage clear(); otherwise only care about ours.
      if (e.key !== null && e.key !== SESSION_STORAGE_KEY) return;
      const now = getClinician();
      if (now && now.id === mountedClinicianId) return; // same user, unrelated rewrite
      if (now) {
        invalidateMe();
        window.location.reload();
        return;
      }
      endSession();
      navigate("/login", { replace: true });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [navigate, mountedClinicianId]);

  // Below `md` the sidebar is an off-canvas drawer (opened from AppLayout's top
  // bar) and never collapses to the icon rail; from `md` up it docks exactly
  // as before. Inert while the drawer is shut so it isn't tab-reachable.
  const isDesktop = useMediaQuery(MD_QUERY);
  const railCollapsed = collapsed && isDesktop;

  return (
    <aside
      inert={!isDesktop && !mobileOpen}
      className={cn(
        "flex shrink-0 flex-col px-3 pb-3 pt-4 duration-200",
        // Mobile drawer.
        "fixed inset-y-0 left-0 z-40 w-[78vw] max-w-[300px] bg-[#FAFAFA] shadow-xl transition-transform motion-reduce:transition-none",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        // Docked (md+) — unchanged desktop sidebar.
        "md:static md:z-auto md:max-w-none md:transform-none md:bg-transparent md:shadow-none md:transition-[width]",
        collapsed ? "md:w-16" : "md:w-64",
      )}
    >
      <SidebarBrand
        collapsed={railCollapsed}
        onToggle={() => {
          setMenuOpen(false);
          // On mobile the same button closes the drawer.
          if (isDesktop) setCollapsed((c) => !c);
          else onMobileClose?.();
        }}
      />
      <SidebarNav items={visibleNav} collapsed={railCollapsed} onNavigate={onMobileClose} />
      <SidebarAlertSoundReminder collapsed={railCollapsed} onNavigate={onMobileClose} />
      <AccountMenu
        name={clinician?.name}
        email={clinician?.email ?? ""}
        collapsed={railCollapsed}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onLogout={() => setLogoutOpen(true)}
      />
      <LogoutDialog open={logoutOpen} setOpen={setLogoutOpen} />
    </aside>
  );
}

/** Logo + collapse toggle. */
function SidebarBrand({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <div className={cn("mb-8 flex h-8 items-center", collapsed ? "justify-center" : "gap-2 px-1")}>
      {!collapsed && (
        <Link to="/dashboard" className="flex min-w-0 flex-1 items-center gap-1.5">
          <span
            aria-hidden="true"
            className="block h-6 w-6 shrink-0 bg-[#7A2850] [mask:url(/brand/omaya-logo-mark-white.svg)_center/contain_no-repeat]"
          />
          <span className="sr-only">Omaya Care</span>
          <span
            aria-hidden="true"
            className="relative top-[3px] block h-4 w-[116px] bg-[#7A2850] [mask:url(/brand/omaya-care-wordmark-black.svg)_left_center/contain_no-repeat]"
          />
        </Link>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-black transition-colors hover:bg-black/[0.04]"
      >
        {collapsed ? <PanelLeftOpen size={17} strokeWidth={1.75} /> : <PanelLeftClose size={17} strokeWidth={1.75} />}
      </button>
    </div>
  );
}

/** Main nav + Settings share one container so the highlight can slide
 *  between any of them. */
function SidebarNav({
  items,
  collapsed,
  onNavigate,
}: {
  items: NavItem[];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const navRef = useRef<HTMLDivElement>(null);
  const { box, animate } = useActiveIndicator(navRef, items.map((i) => i.to).join("|"));
  return (
    <div ref={navRef} className="relative flex flex-1 flex-col">
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0 top-0 rounded-lg bg-[#F7E8F0]",
          animate && "transition-[transform,width,height,opacity] duration-150 ease-out motion-reduce:transition-none",
        )}
        style={{
          transform: `translate(${box?.left ?? 0}px, ${box?.top ?? 0}px)`,
          width: box?.width ?? 0,
          height: box?.height ?? 0,
          opacity: box ? 1 : 0,
        }}
      />
      <nav aria-label="Main" className="flex flex-1 flex-col gap-0.5">
        {items.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>

      <SidebarLink
        item={{ to: "/settings", label: "Settings", icon: Settings }}
        collapsed={collapsed}
        onNavigate={onNavigate}
      />
    </div>
  );
}

/** Account card pinned to the bottom, with its Log out popover. */
function AccountMenu({
  name,
  email,
  collapsed,
  menuOpen,
  setMenuOpen,
  onLogout,
}: {
  name: string | null | undefined;
  email: string;
  collapsed: boolean;
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => void;
}) {
  const displayName = name || email;
  return (
    <div className="relative mt-2 border-t border-gray-200 pt-2">
      {menuOpen && (
        <div className="absolute bottom-full left-0 z-10 mb-1 w-52 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/5">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onLogout();
            }}
            className={cn(itemBase, "w-full text-red-600 hover:bg-red-50")}
          >
            <LogOut size={17} className="shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        aria-expanded={menuOpen}
        aria-label="Account menu"
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg py-1.5 text-left transition-colors hover:bg-black/[0.04]",
          collapsed ? "justify-center px-0" : "px-1.5",
        )}
      >
        <div
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7A2850]/10 text-xs text-[#7A2850]"
        >
          {initialFor(name, email || "?")}
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] leading-tight text-black">{displayName}</p>
              <p className="truncate text-xs leading-tight text-gray-500">{email}</p>
            </div>
            <ChevronsUpDown size={15} className="shrink-0 text-black" />
          </>
        )}
      </button>
    </div>
  );
}

function LogoutDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const navigate = useNavigate();

  function handleLogout() {
    // Fire-and-forget. The server still needs the round-trip to clear the
    // HttpOnly session cookie (JS can't), but the clinician must never WAIT on
    // it: awaiting held local cleanup behind the request timeout, so on a
    // stalled network the portal stayed signed-in and usable after sign-out
    // was confirmed. `logout()` swallows its own errors, and navigating does
    // not abort the in-flight request.
    void logout();
    clearSession();
    endSession();
    navigate("/login", { replace: true });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Log out?</DialogTitle>
          <DialogDescription>
            You'll need to sign in again to see mothers, calls and escalations.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Log out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
