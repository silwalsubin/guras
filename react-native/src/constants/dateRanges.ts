/**
 * Date range constants and utilities for emotion statistics filtering
 */

export interface DateRangeOption {
  id: string;
  label: string;
  days: number;
}

export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  {
    id: '7days',
    label: 'Last 7 days',
    days: 7,
  },
  {
    id: '30days',
    label: 'Last 30 days',
    days: 30,
  },
  {
    id: '90days',
    label: 'Last 90 days',
    days: 90,
  },
  {
    id: 'all',
    label: 'All time',
    days: 999999, // Large number to represent all time
  },
];

/**
 * Calculate start and end dates for a given date range option
 */
export const calculateDateRange = (
  option: DateRangeOption
): { startDate: string; endDate: string } => {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999); // End of today

  let startDate = new Date(endDate);

  // For "all time", use a very early date (e.g., 10 years ago)
  if (option.id === 'all') {
    startDate.setFullYear(startDate.getFullYear() - 10);
  } else {
    startDate.setDate(startDate.getDate() - option.days);
  }

  startDate.setHours(0, 0, 0, 0); // Start of that day

  return {
    startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
    endDate: endDate.toISOString().split('T')[0], // YYYY-MM-DD format
  };
};

/**
 * Get the default date range option (last 7 days)
 */
export const getDefaultDateRange = (): DateRangeOption => {
  return DATE_RANGE_OPTIONS[0]; // Last 7 days
};

/**
 * Find a date range option by ID
 */
export const findDateRangeById = (id: string): DateRangeOption | undefined => {
  return DATE_RANGE_OPTIONS.find((option) => option.id === id);
};

