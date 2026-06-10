// dash-ui.jsx — Omaya shared form + menu primitives.
// Input matches the reference: white surface, hairline border, soft shadow,
// gray placeholder, optional leading/trailing icon, focus ring.
import React from "react";
import { OM, Icons, TK } from "./dash-foundation.jsx";

const BORDER = "#E4E7EC";

// ---------------- Input ----------------
function Input({
  value,
  onChange,
  placeholder,
  leadingIcon,
  trailingIcon,
  onTrailingClick,
  type = "text",
  disabled,
  style,
  inputRef,
  onKeyDown,
}) {
  const [f, setF] = React.useState(false);
  const LI = leadingIcon ? Icons[leadingIcon] : null;
  const TI = trailingIcon ? Icons[trailingIcon] : null;
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: "100%",
        ...style,
      }}
    >
      {LI && (
        <span
          style={{
            position: "absolute",
            left: 14,
            color: OM.tertiary,
            display: "inline-flex",
            pointerEvents: "none",
          }}
        >
          <LI size={18} sw={2} />
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        ref={inputRef}
        onKeyDown={onKeyDown}
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
        style={{
          width: "100%",
          height: 44,
          padding: `0 ${TI ? 40 : 14}px 0 ${LI ? 42 : 14}px`,
          borderRadius: 10,
          boxSizing: "border-box",
          fontFamily: "var(--ui-font)",
          fontSize: 14.5,
          color: OM.navy,
          background: disabled ? "#F8F9FA" : OM.surface,
          outline: "none",
          border: `1px solid ${f ? OM.focus : BORDER}`,
          boxShadow: f
            ? `0 0 0 3px ${OM.periBg}`
            : "0 1px 2px rgba(16,24,40,0.05)",
          transition: "border-color .12s, box-shadow .12s",
        }}
      />
      {TI && (
        <span
          onClick={disabled ? undefined : onTrailingClick}
          style={{
            position: "absolute",
            right: 13,
            color: OM.tertiary,
            display: "inline-flex",
            cursor: onTrailingClick ? "pointer" : "default",
          }}
        >
          <TI size={17} sw={2} />
        </span>
      )}
    </div>
  );
}

function Field({ label, hint, ...input }) {
  return (
    <label style={{ display: "block" }}>
      {label && (
        <span
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: 500,
            color: OM.navy,
            marginBottom: 7,
          }}
        >
          {label}
        </span>
      )}
      <Input {...input} />
      {hint && (
        <span
          style={{
            display: "block",
            fontSize: 12.5,
            color: OM.tertiary,
            marginTop: 6,
          }}
        >
          {hint}
        </span>
      )}
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 4 }) {
  const [f, setF] = React.useState(false);
  return (
    <label style={{ display: "block" }}>
      {label && (
        <span
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: 500,
            color: OM.navy,
            marginBottom: 7,
          }}
        >
          {label}
        </span>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: 10,
          boxSizing: "border-box",
          resize: "vertical",
          fontFamily: "var(--ui-font)",
          fontSize: 14.5,
          lineHeight: 1.5,
          color: OM.navy,
          background: OM.surface,
          outline: "none",
          border: `1px solid ${f ? OM.focus : BORDER}`,
          boxShadow: f
            ? `0 0 0 3px ${OM.periBg}`
            : "0 1px 2px rgba(16,24,40,0.05)",
          transition: "border-color .12s, box-shadow .12s",
        }}
      />
    </label>
  );
}

// ---------------- Menu popover (matches the dropdown-menu reference) ----------------
function MenuItem({ item, selected, onSelect }) {
  const [h, setH] = React.useState(false);
  if (item.divider)
    return (
      <div
        style={{ height: 1, background: OM.borderSoft, margin: "5px 0" }}
      />
    );
  if (item.heading)
    return (
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: OM.tertiary,
          padding: "8px 12px 4px",
        }}
      >
        {item.heading}
      </div>
    );
  const I = item.icon ? Icons[item.icon] : null;
  return (
    <button
      type="button"
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={() => onSelect(item)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        textAlign: "left",
        border: "none",
        background: h ? "#F5F6F8" : "transparent",
        cursor: "pointer",
        borderRadius: 8,
        padding: "9px 12px",
        fontFamily: "var(--ui-font)",
        fontSize: 14,
        fontWeight: 500,
        color: item.danger ? "#B42318" : OM.navy,
        transition: "background .1s",
      }}
    >
      {I && (
        <I
          size={17}
          sw={2}
          style={{
            color: item.danger ? "#B42318" : OM.tertiary,
            flexShrink: 0,
          }}
        />
      )}
      <span
        style={{
          flex: 1,
          minWidth: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {item.label}
      </span>
      {item.shortcut && (
        <span
          style={{
            fontFamily: OM.mono,
            fontSize: 12,
            color: OM.borderStrong,
            flexShrink: 0,
          }}
        >
          {item.shortcut}
        </span>
      )}
      {selected && (
        <Icons.check
          size={16}
          sw={2.4}
          style={{ color: OM.plum, flexShrink: 0 }}
        />
      )}
    </button>
  );
}

// Popover positioned under an anchor. items: [{value,label,icon?,divider?,heading?,danger?,shortcut?}]
function Popover({
  items,
  value,
  onSelect,
  onClose,
  width = 240,
  align = "left",
  top = 46,
}) {
  return (
    <React.Fragment>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 80 }}
      />
      <div
        style={{
          position: "absolute",
          top,
          [align]: 0,
          zIndex: 81,
          width,
          maxHeight: 340,
          overflowY: "auto",
          background: OM.surface,
          border: `1px solid ${OM.border}`,
          borderRadius: 12,
          boxShadow:
            "0 12px 32px -8px rgba(16,24,40,0.18), 0 4px 10px -4px rgba(16,24,40,0.10)",
          padding: 6,
          animation: "omFade .12s ease",
        }}
      >
        {items.map((it, i) => (
          <MenuItem
            key={i}
            item={it}
            selected={it.value != null && it.value === value}
            onSelect={(item) => {
              if (item.value != null) onSelect(item);
              else if (item.onClick) item.onClick();
              onClose();
            }}
          />
        ))}
      </div>
    </React.Fragment>
  );
}

// Dropdown — filled pill trigger (mothers style) OR bordered (input style). Populated menu.
function Dropdown({
  value,
  items,
  onChange,
  variant = "filled",
  width = 240,
  align = "left",
  flex,
}) {
  const [open, setOpen] = React.useState(false);
  const [h, setH] = React.useState(false);
  const selected = items.find((it) => it.value === value);
  const label = selected ? selected.label : items[0] && items[0].label;
  const filled = variant === "filled";
  return (
    <div style={{ position: "relative", flex: flex }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          width: flex ? "100%" : "auto",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          height: filled ? 44 : 40,
          padding: filled ? "0 14px 0 16px" : "0 12px 0 14px",
          borderRadius: filled ? 10 : 999,
          border: filled
            ? "1px solid transparent"
            : `1px solid ${h || open ? OM.borderStrong : OM.border}`,
          background: filled
            ? h || open
              ? "#E9E9ED"
              : "#F1F1F4"
            : h || open
              ? "#F3F5F8"
              : OM.surface,
          color: OM.slate,
          cursor: "pointer",
          fontFamily: "var(--ui-font)",
          fontSize: 14,
          fontWeight: 500,
          whiteSpace: "nowrap",
          transition: "background .12s, border-color .12s",
        }}
      >
        {label}
        <Icons.chevronDown
          size={16}
          sw={2}
          style={{ color: OM.tertiary, flexShrink: 0 }}
        />
      </button>
      {open && (
        <Popover
          items={items}
          value={value}
          onSelect={(it) => onChange(it.value)}
          onClose={() => setOpen(false)}
          width={width}
          align={align}
          top={filled ? 50 : 46}
        />
      )}
    </div>
  );
}

// ---------------- Toggle ----------------
function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        border: "none",
        padding: 2,
        cursor: "pointer",
        flexShrink: 0,
        background: on ? OM.plum : "#D2D6DD",
        transition: "background .15s ease",
      }}
    >
      <span
        style={{
          display: "block",
          width: 20,
          height: 20,
          borderRadius: 999,
          background: "#fff",
          transform: on ? "translateX(18px)" : "translateX(0)",
          transition: "transform .15s ease",
          boxShadow: "0 1px 2px rgba(16,24,40,0.2)",
        }}
      />
    </button>
  );
}

// ---------------- Card (Untitled UI style) ----------------
function Card({
  children,
  padding = "p-6",
  style,
  hoverable = true,
  ...props
}) {
  const [h, setH] = React.useState(false);
  const pMap = { "p-4": "16px", "p-6": "24px", "p-8": "32px" };
  const paddingVal = pMap[padding] || padding;
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        ...TK.card,
        padding: paddingVal,
        ...(h && hoverable ? TK.cardHover : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, children, style }) {
  return (
    <div
      style={{
        marginBottom: 20,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        ...style,
      }}
    >
      <div>
        {title && (
          <h3 style={{ ...TK.sectionTitle, margin: 0, fontSize: 18 }}>
            {title}
          </h3>
        )}
        {subtitle && (
          <p style={{ ...TK.bodySmall, margin: "4px 0 0" }}>{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

const UI = {
  Input,
  Field,
  Textarea,
  Dropdown,
  Popover,
  Toggle,
  MenuItem,
  Card,
  CardHeader,
};

export { UI };
