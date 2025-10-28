'use client';

import { useState } from 'react';
import type { PullRequest, ColumnConfig, Label } from '../types';
import { PRTable } from './PRTable';

interface GroupedPRDisplayProps {
  pullRequests: PullRequest[];
  columns: ColumnConfig[];
  isLoading?: boolean;
  groupByLabels: string[];
  availableLabels: Label[];
}

interface PRGroup {
  label: string;
  labelColor: string;
  pullRequests: PullRequest[];
}

export function GroupedPRDisplay({
  pullRequests,
  columns,
  isLoading,
  groupByLabels,
  availableLabels,
}: GroupedPRDisplayProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groupByLabels)
  );

  const toggleGroup = (labelName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(labelName)) {
        next.delete(labelName);
      } else {
        next.add(labelName);
      }
      return next;
    });
  };

  // Group PRs by selected labels
  const groups: PRGroup[] = groupByLabels.map((labelName) => {
    const label = availableLabels.find((l) => l.name === labelName);
    
    // Check if this is a prefix match - a prefix is when:
    // 1. The selected label doesn't contain a colon, AND
    // 2. There exists at least one label in availableLabels that starts with "selectedLabel:"
    const isPrefix = !labelName.includes(':') && 
      availableLabels.some((l) => l.name.startsWith(`${labelName}:`));
    
    const prsWithLabel = pullRequests.filter((pr) =>
      pr.labels.some((l) => {
        if (isPrefix) {
          // Match labels that start with "prefix:"
          return l.name.startsWith(`${labelName}:`);
        }
        // Exact match
        return l.name === labelName;
      })
    );

    return {
      label: labelName,
      labelColor: label?.color || '6b7280',
      pullRequests: prsWithLabel,
    };
  });

  // PRs that don't match any selected label (including prefix matches)
  const ungroupedPRs = pullRequests.filter(
    (pr) => !pr.labels.some((prLabel) => 
      groupByLabels.some((selectedLabel) => {
        const isPrefix = !selectedLabel.includes(':') && 
          availableLabels.some((l) => l.name.startsWith(`${selectedLabel}:`));
        if (isPrefix) {
          return prLabel.name.startsWith(`${selectedLabel}:`);
        }
        return prLabel.name === selectedLabel;
      })
    )
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading pull requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label} className="bg-white rounded-lg shadow overflow-hidden">
          <button
            type="button"
            onClick={() => toggleGroup(group.label)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg
                className={`w-5 h-5 transition-transform ${
                  expandedGroups.has(group.label) ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span
                className="px-3 py-1 text-sm font-semibold rounded-full"
                style={{
                  backgroundColor: `#${group.labelColor}20`,
                  color: `#${group.labelColor}`,
                }}
              >
                {group.label}
              </span>
              <span className="text-sm text-gray-600">
                {group.pullRequests.length} PR{group.pullRequests.length !== 1 ? 's' : ''}
              </span>
            </div>
          </button>

          {expandedGroups.has(group.label) && (
            <div className="border-t border-gray-200">
              {group.pullRequests.length > 0 ? (
                <PRTable
                  pullRequests={group.pullRequests}
                  columns={columns}
                  isLoading={false}
                />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No pull requests with this label
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {ungroupedPRs.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <button
            type="button"
            onClick={() => toggleGroup('__other__')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg
                className={`w-5 h-5 transition-transform ${
                  expandedGroups.has('__other__') ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Other</span>
              <span className="text-sm text-gray-600">
                {ungroupedPRs.length} PR{ungroupedPRs.length !== 1 ? 's' : ''}
              </span>
            </div>
          </button>

          {expandedGroups.has('__other__') && (
            <div className="border-t border-gray-200">
              <PRTable
                pullRequests={ungroupedPRs}
                columns={columns}
                isLoading={false}
              />
            </div>
          )}
        </div>
      )}

      {groups.every((g) => g.pullRequests.length === 0) && ungroupedPRs.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No pull requests found
        </div>
      )}
    </div>
  );
}
