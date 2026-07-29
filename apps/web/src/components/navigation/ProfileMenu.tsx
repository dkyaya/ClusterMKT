import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export interface ProfileMenuProps {
  onOpenChange?: (open: boolean) => void;
}

export function ProfileMenu({ onOpenChange }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const updateOpen = useCallback(
    (next: boolean, restoreFocus = false) => {
      setOpen(next);
      onOpenChange?.(next);
      if (!next && restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        updateOpen(false, true);
      }
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        updateOpen(false, true);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, updateOpen]);

  const settingsCurrent = location.pathname === "/settings";
  const profileCurrent = location.pathname === "/profile";

  return (
    <div className="profile-menu">
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open profile menu"
        className="profile-menu__trigger"
        onClick={() => updateOpen(!open, open)}
        ref={triggerRef}
        type="button"
      >
        <span aria-hidden="true">CM</span>
      </button>
      {open && (
        <div
          aria-label="Profile options"
          className="profile-menu__popover"
          ref={menuRef}
          role="menu"
        >
          <p className="profile-menu__label">Demonstration profile</p>
          <Link
            aria-current={profileCurrent ? "page" : undefined}
            onClick={() => updateOpen(false)}
            role="menuitem"
            to="/profile"
          >
            Profile
          </Link>
          <Link
            aria-current={settingsCurrent ? "page" : undefined}
            onClick={() => updateOpen(false)}
            role="menuitem"
            to="/settings"
          >
            Settings
          </Link>
          <Link onClick={() => updateOpen(false)} role="menuitem" to="/settings#appearance">
            Appearance
          </Link>
        </div>
      )}
    </div>
  );
}
