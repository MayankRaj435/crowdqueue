db = db.getSiblingDB('crowdqueue');

db.createCollection('users');
db.createCollection('organizations');
db.createCollection('queues');
db.createCollection('tokens');
db.createCollection('analytics');

db.organizations.createIndex({ location: "2dsphere" });
db.organizations.createIndex({ type: 1, isActive: 1 });

db.queues.createIndex({ organizationId: 1, status: 1 });

db.tokens.createIndex({ queueId: 1, status: 1 });
db.tokens.createIndex({ userId: 1, status: 1 });
db.tokens.createIndex({ queueId: 1, tokenNumber: 1 }, { unique: true });
db.tokens.createIndex({ queueId: 1, servedAt: -1 });
db.tokens.createIndex({ createdAt: -1 });
db.tokens.createIndex({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

db.analytics.createIndex({ queueId: 1, date: -1 });

print('CrowdQueue database initialized with collections and indexes.');
