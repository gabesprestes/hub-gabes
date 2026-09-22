function initials(label: string) {
  const words = label
    .replace(/[[\]()]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !/^(de|da|do|e|por|-)$/i.test(word));
  const letters = words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "");
  return (letters.join("") || label.slice(0, 2)).slice(0, 2).toUpperCase();
}

type Kind =
  | "sheets"
  | "slides"
  | "docs"
  | "forms"
  | "drive"
  | "miro"
  | "databricks"
  | "jira"
  | "confluence"
  | "quicksight"
  | "github"
  | "generic";

function kindOf(url: string): Kind {
  const value = url.toLowerCase();
  if (value.includes("miro.com")) return "miro";
  if (value.includes("databricks.com")) return "databricks";
  if (value.includes("quicksight")) return "quicksight";
  if (value.includes("/jira") || value.includes("servicedesk")) return "jira";
  if (value.includes("/wiki") || value.includes("confluence")) return "confluence";
  if (value.includes("spreadsheets") || value.includes("sheets.google")) return "sheets";
  if (value.includes("/presentation") || value.includes("slides.google")) return "slides";
  if (value.includes("docs.google.com/document")) return "docs";
  if (value.includes("docs.google.com/forms") || value.includes("forms.google")) return "forms";
  if (value.includes("drive.google.com")) return "drive";
  if (value.includes("github.com")) return "github";
  return "generic";
}

export function LinkMark({ url, label }: { url: string; label: string }) {
  const kind = kindOf(url);
  if (kind === "generic") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--purple-tint)] text-[9px] font-bold text-[var(--purple)]">
        {initials(label)}
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 items-center justify-center" aria-hidden>
      <Mark kind={kind} />
    </span>
  );
}

function Mark({ kind }: { kind: Exclude<Kind, "generic"> }) {
  if (kind === "sheets") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <rect width="24" height="24" rx="5" fill="#0F9D58" />
        <rect x="5" y="4" width="14" height="16" rx="1.2" fill="#fff" />
        <path d="M5 9.2h14M5 13.6h14M10.2 4v16" stroke="#0F9D58" strokeWidth="1.2" />
      </svg>
    );
  }
  if (kind === "slides") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <rect width="24" height="24" rx="5" fill="#F4B400" />
        <rect x="4" y="6" width="16" height="12" rx="1.2" fill="#fff" />
        <path d="M8 10.5h8M8 13.5h5" stroke="#F4B400" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "docs") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <rect width="24" height="24" rx="5" fill="#4285F4" />
        <rect x="6" y="4" width="12" height="16" rx="1.2" fill="#fff" />
        <path d="M8.5 9h7M8.5 12h7M8.5 15h4.5" stroke="#4285F4" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "forms") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <rect width="24" height="24" rx="5" fill="#7B3FF2" />
        <circle cx="8.5" cy="9" r="1.3" fill="#fff" />
        <circle cx="8.5" cy="14" r="1.3" fill="#fff" />
        <path d="M11.5 9h5M11.5 14h5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "drive") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M8.2 4.5h7.6L22 14.2h-7.6L8.2 4.5Z" fill="#FFBA00" />
        <path d="M2 16.8 5.8 10l6.2 6.8H2Z" fill="#00AC47" />
        <path d="M8.6 19.5h12.2l-3.7-6.4H4.8l3.8 6.4Z" fill="#2684FC" />
      </svg>
    );
  }
  if (kind === "miro") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <rect width="24" height="24" rx="5" fill="#FFD02F" />
        <path d="M7 16.5c2.2-4.8 3.4-7.2 3.6-8.2.4 2.2 1.6 4.6 3.2 6.2 1.2-2.4 2-4.2 2.4-5.2.2 2.6 1 4.4 2.4 6.6" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "databricks") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <rect width="24" height="24" rx="5" fill="#FF3621" />
        <path d="M12 5 18 8.2v3.1L12 14.5 6 11.3V8.2L12 5Zm0 6.2 6 3.2v3.1L12 20.7 6 17.5v-3.1l6-3.2Z" fill="#fff" />
      </svg>
    );
  }
  if (kind === "jira") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <rect width="24" height="24" rx="5" fill="#2684FF" />
        <path d="M12.2 6.2 7 11.6a3.4 3.4 0 0 0 4.8 4.8l.4-.4.4.4a3.4 3.4 0 0 0 4.8-4.8L12.2 6.2Z" fill="#fff" />
      </svg>
    );
  }
  if (kind === "confluence") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <rect width="24" height="24" rx="5" fill="#1868DB" />
        <path d="M8 15.5c2.4-1.2 3.6-2.6 4-4.2.6 2.4 2 4 4.4 5.2" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 8.5c-2.4 1.2-3.6 2.6-4 4.2-.6-2.4-2-4-4.4-5.2" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "quicksight") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <rect width="24" height="24" rx="5" fill="#FF9900" />
        <path d="M6.5 16V11M10.5 16V8M14.5 16v-4M18.5 16V9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <rect width="24" height="24" rx="5" fill="#24292f" />
      <path d="M12 6.2a5.8 5.8 0 0 0-1.8 11.3c.3 0 .4-.1.4-.3v-1.1c-1.6.3-2-.8-2-.8-.2-.6-.6-.8-.6-.8-.5-.3 0-.3 0-.3.6 0 .9.6.9.6.5.9 1.3.6 1.6.5.1-.4.2-.6.4-.8-1.3-.1-2.6-.6-2.6-2.8 0-.6.2-1.1.6-1.5-.1-.2-.3-.8.1-1.6 0 0 .5-.2 1.6.6a5.5 5.5 0 0 1 2.9 0c1.1-.8 1.6-.6 1.6-.6.4.8.2 1.4.1 1.6.4.4.6.9.6 1.5 0 2.2-1.3 2.7-2.6 2.8.2.2.4.5.4 1.1v1.6c0 .2.1.3.4.3A5.8 5.8 0 0 0 12 6.2Z" fill="#fff" />
    </svg>
  );
}
