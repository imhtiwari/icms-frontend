export const complaintCategories = [
  { key: 'ELECTRICAL', label: 'Electrical', slug: 'electrical' },
  { key: 'PLUMBING', label: 'Plumbing', slug: 'plumbing' },
  { key: 'CARPENTRY', label: 'Carpentry', slug: 'carpentry' },
  { key: 'HVAC', label: 'HVAC', slug: 'hvac' },
  { key: 'PAINTING', label: 'Painting', slug: 'painting' },
  { key: 'CLEANING', label: 'Cleaning', slug: 'cleaning' },
  { key: 'SECURITY', label: 'Security', slug: 'security' },
  { key: 'OTHER', label: 'Other', slug: 'other' }
];

export const getCategoryLabel = (categoryKey) => {
  if (!categoryKey) return 'Other';
  return complaintCategories.find(cat => cat.key === categoryKey)?.label || categoryKey.replace(/_/g, ' ');
};

export const getCategoryKeyFromSlug = (slug) => {
  if (!slug) return '';
  const normalized = slug.toLowerCase();
  return complaintCategories.find(cat => cat.slug === normalized)?.key || slug.toUpperCase();
};
