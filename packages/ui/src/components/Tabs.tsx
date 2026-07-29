import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./Tabs.module.css";

export interface TabItem {
  id: string;
  label: string;
  panel: ReactNode;
}
export interface TabsProps {
  items: readonly TabItem[];
  label: string;
  defaultTab?: string;
  onChange?: (id: string) => void;
}

export function Tabs({ items, label, defaultTab, onChange }: TabsProps) {
  const baseId = useId();
  const [active, setActive] = useState(defaultTab ?? items[0]?.id ?? "");
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const select = (id: string) => {
    setActive(id);
    onChange?.(id);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = items.findIndex((item) => item.id === active);
    if (current < 0) return;
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % items.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    const item = items[next];
    if (item) {
      select(item.id);
      refs.current[next]?.focus();
    }
  };

  return (
    <div className={styles.tabs}>
      <div
        aria-label={label}
        className={styles.list}
        onKeyDown={onKeyDown}
        role="tablist"
        tabIndex={0}
      >
        {items.map((item, index) => (
          <button
            aria-controls={`${baseId}-${item.id}-panel`}
            aria-selected={active === item.id}
            className={styles.tab}
            id={`${baseId}-${item.id}-tab`}
            key={item.id}
            onClick={() => select(item.id)}
            ref={(element) => {
              refs.current[index] = element;
            }}
            role="tab"
            tabIndex={active === item.id ? 0 : -1}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          aria-labelledby={`${baseId}-${item.id}-tab`}
          className={styles.panel}
          hidden={active !== item.id}
          id={`${baseId}-${item.id}-panel`}
          key={item.id}
          role="tabpanel"
          tabIndex={0}
        >
          {item.panel}
        </div>
      ))}
    </div>
  );
}
