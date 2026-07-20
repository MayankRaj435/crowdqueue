const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');

const parseAllowedOrigins = (value) => {
  const raw = value || 'http://localhost:3000';
  return [...new Set(raw.split(',').map(normalizeOrigin).filter(Boolean))];
};

const isOriginAllowed = (origin, allowedOrigins) => {
  if (!origin) return true;
  return allowedOrigins.includes(normalizeOrigin(origin));
};

module.exports = { normalizeOrigin, parseAllowedOrigins, isOriginAllowed };
