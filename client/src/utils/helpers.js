/**
 * Returns a Tailwind color class based on crowd level
 */
export const crowdColor = (level) => {
  const map = {
    Low: 'text-green-600 bg-green-100',
    Medium: 'text-orange-600 bg-orange-100',
    High: 'text-red-600 bg-red-100',
    Overcrowded: 'text-red-800 bg-red-200',
  };
  return map[level] || 'text-gray-600 bg-gray-100';
};

/**
 * Returns a Tailwind bar color class based on percentage number
 */
export const crowdBarColor = (percent) => {
  if (percent >= 80) return 'bg-red-500';
  if (percent >= 50) return 'bg-orange-500';
  return 'bg-green-500';
};

/**
 * Formats an ISO date string to a readable local date
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Truncates text to a given character limit
 */
export const truncateText = (text, limit = 120) => {
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

/**
 * Returns a human-readable label for a user role
 */
export const getRoleLabel = (role) => {
  const map = {
    tourist: 'Tourist',
    agency: 'Travel Agency',
    authority: 'City Authority',
    admin: 'Administrator',
  };
  return map[role] || 'User';
};

/**
 * Generates a random avatar placeholder URL
 */
export const avatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=128`;
};

/**
 * Returns status badge classes
 */
export const statusBadge = (status) => {
  const map = {
    Confirmed: 'bg-green-100 text-green-700',
    Pending: 'bg-orange-100 text-orange-700',
    Cancelled: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};
