/**
 * DonateBridge — Shared category and status constants.
 * Centralized here to avoid duplication across page files.
 */

export const DONATION_CATEGORIES = [
  'Food',
  'Books',
  'Clothing',
  'Medical',
  'Electronics',
  'Furniture',
  'School Supplies',
  'Sports Equipment',
  'Blankets',
];

export const ITEM_CONDITIONS = [
  { value: 'New', label: 'Brand New' },
  { value: 'Like New', label: 'Like New / Cleaned' },
  { value: 'Good', label: 'Gently Used' },
  { value: 'Poor', label: 'Worn / Damaged' },
];

export const DONATION_STATUSES = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  MATCHED: 'MATCHED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  REJECTED: 'REJECTED',
};

export const URGENCY_LEVELS = ['High', 'Medium', 'Low'];

export const USER_ROLES = {
  DONOR: 'donor',
  NGO: 'ngo',
  ADMIN: 'admin',
};

export const NGO_VERIFICATION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};
