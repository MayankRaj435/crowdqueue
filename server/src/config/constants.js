const ROLES = {
  CITIZEN: 'citizen',
  STAFF: 'staff',
  ORG_ADMIN: 'org_admin',
  SUPER_ADMIN: 'super_admin',
};

const TOKEN_STATUS = {
  WAITING: 'waiting',
  CALLED: 'called',
  SERVING: 'serving',
  SERVED: 'served',
  SKIPPED: 'skipped',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  NO_SHOW: 'no_show',
};

const QUEUE_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  CLOSED: 'closed',
  FULL: 'full',
};

const ORG_TYPES = ['hospital', 'rto', 'bank', 'government', 'other'];

const DEFAULTS = {
  MAX_QUEUE_CAPACITY: 200,
  NOTIFY_THRESHOLD: 3,
  AVG_SERVICE_TIME_MS: 300000,
  QUEUE_CACHE_TTL: 5,
  ORG_CACHE_TTL: 300,
  NEARBY_RADIUS_METERS: 10000,
  ROLLING_AVG_WINDOW: 20,
  DEV_OTP_CODE: '123456',
};

module.exports = { ROLES, TOKEN_STATUS, QUEUE_STATUS, ORG_TYPES, DEFAULTS };
