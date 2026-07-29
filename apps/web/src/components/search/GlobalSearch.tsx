import { useState, type FormEvent, type KeyboardEvent } from "react";

export interface GlobalSearchProps {
  onFocusChange?: (focused: boolean) => void;
}

export function GlobalSearch({ onFocusChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const clear = () => {
    setQuery("");
    setStatus("");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submittedQuery = query.trim();
    if (!submittedQuery) {
      setStatus("");
      return;
    }
    setStatus(
      `Search indexing is not connected yet. No search was performed for “${submittedQuery}”.`,
    );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      clear();
    }
  };

  const onFocus = () => onFocusChange?.(true);
  const onBlur = () => onFocusChange?.(false);

  return (
    <form className="global-search" onSubmit={submit} role="search">
      <label className="visually-hidden" htmlFor="global-search-input">
        Search stories, companies, or themes
      </label>
      <div className="global-search__control">
        <input
          autoComplete="off"
          id="global-search-input"
          onBlur={onBlur}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          placeholder="Search stories, companies, or themes"
          type="search"
          value={query}
        />
        {query && (
          <button
            aria-label="Clear search"
            className="global-search__clear"
            onClick={clear}
            type="button"
          >
            ×
          </button>
        )}
      </div>
      <p aria-live="polite" className="global-search__status" role="status">
        {status}
      </p>
    </form>
  );
}
