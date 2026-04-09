"use client";

export interface Filters {
  contactType: string;
  company: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  contactTypes: string[];
  companies: string[];
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] font-medium text-muted uppercase tracking-wider whitespace-nowrap">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2.5 py-1.5 bg-card border border-card-border rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 cursor-pointer transition-all min-w-[140px]"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function FilterBar({ filters, onChange, contactTypes, companies }: FilterBarProps) {
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <FilterSelect
        label="Type"
        value={filters.contactType}
        onChange={(v) => onChange({ ...filters, contactType: v })}
        options={contactTypes}
      />
      <FilterSelect
        label="Company"
        value={filters.company}
        onChange={(v) => onChange({ ...filters, company: v })}
        options={companies}
      />
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ contactType: "", company: "" })}
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
}
