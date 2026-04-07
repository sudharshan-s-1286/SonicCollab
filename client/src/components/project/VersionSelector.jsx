import React from 'react';

const VersionSelector = ({ versions = [], selectedVersionNumber, onSelect }) => {
  const sorted = [...versions].sort((a, b) => a.versionNumber - b.versionNumber);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {sorted.map((v) => {
        const isCurrent = v.versionNumber === selectedVersionNumber;
        return (
          <button
            key={v.versionNumber}
            onClick={() => onSelect(v.versionNumber)}
            className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all border ${
              isCurrent
                ? 'bg-[var(--accent-violet)] text-white border-[var(--accent-violet)] shadow-lg'
                : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:border-[var(--accent-violet)]/40 hover:text-[var(--text-primary)]'
            }`}
          >
            v{v.versionNumber}
            {v.versionNumber === selectedVersionNumber ? ' · selected' : ''}
          </button>
        );
      })}
    </div>
  );
};

export default VersionSelector;

