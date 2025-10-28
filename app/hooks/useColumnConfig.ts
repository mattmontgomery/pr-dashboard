'use client';

import { useState, useEffect } from 'react';
import type { ColumnConfig, ColumnId } from '../types';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'number', label: '#', visible: true, order: 0, width: 80, sortable: true },
  { id: 'title', label: 'Title', visible: true, order: 1, width: 400, sortable: true },
  { id: 'repository', label: 'Repository', visible: true, order: 2, width: 200, sortable: true },
  { id: 'author', label: 'Author', visible: true, order: 3, width: 150, sortable: true },
  { id: 'state', label: 'Status', visible: true, order: 4, width: 100, sortable: true },
  { id: 'labels', label: 'Labels', visible: true, order: 5, width: 200 },
  { id: 'assignees', label: 'Assignees', visible: false, order: 6, width: 150 },
  { id: 'reviewers', label: 'Reviewers', visible: false, order: 7, width: 150 },
  { id: 'createdAt', label: 'Created', visible: false, order: 8, width: 120, sortable: true },
  { id: 'updatedAt', label: 'Updated', visible: true, order: 9, width: 120, sortable: true },
  { id: 'comments', label: 'Comments', visible: false, order: 10, width: 100 },
  { id: 'changes', label: 'Changes', visible: false, order: 11, width: 120 },
];

const STORAGE_KEY = 'pr-dashboard-column-config';

interface UseColumnConfigResult {
  columns: ColumnConfig[];
  updateColumn: (id: ColumnId, updates: Partial<ColumnConfig>) => void;
  resetColumns: () => void;
  toggleColumnVisibility: (id: ColumnId) => void;
  reorderColumns: (fromIndex: number, toIndex: number) => void;
}

export function useColumnConfig(): UseColumnConfigResult {
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    // Load columns from localStorage on initial mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Failed to parse saved column config:', error);
        }
      }
    }
    return DEFAULT_COLUMNS;
  });

  // Save columns to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
    }
  }, [columns]);

  const updateColumn = (id: ColumnId, updates: Partial<ColumnConfig>) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, ...updates } : col))
    );
  };

  const resetColumns = () => {
    setColumns(DEFAULT_COLUMNS);
  };

  const toggleColumnVisibility = (id: ColumnId) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === id ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const reorderColumns = (fromIndex: number, toIndex: number) => {
    setColumns((prev) => {
      const newColumns = [...prev];
      const [movedColumn] = newColumns.splice(fromIndex, 1);
      newColumns.splice(toIndex, 0, movedColumn);
      
      // Update order property
      return newColumns.map((col, index) => ({ ...col, order: index }));
    });
  };

  return {
    columns,
    updateColumn,
    resetColumns,
    toggleColumnVisibility,
    reorderColumns,
  };
}
