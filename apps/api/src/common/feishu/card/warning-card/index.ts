import ErrorUnresolvedCard from './error-unresolved-card';
import WarningCard from './warning-card';

export const WarningCardMap = {
  common: WarningCard,
  professional: ErrorUnresolvedCard,
} as const;

export type WarningCardType = keyof typeof WarningCardMap;
