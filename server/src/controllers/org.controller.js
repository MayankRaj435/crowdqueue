const Joi = require('joi');
const bcrypt = require('bcryptjs');
const Organization = require('../models/Organization.model');
const Queue = require('../models/Queue.model');
const User = require('../models/User.model');
const Token = require('../models/Token.model');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { createGeoPoint } = require('../utils/geoUtils');
const { DEFAULTS } = require('../config/constants');

const registerOrgSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  type: Joi.string().valid('hospital', 'rto', 'bank', 'government', 'other').required(),
  description: Joi.string().max(1000).optional().allow(''),
  address: Joi.object({
    line1: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().pattern(/^\d{6}$/).optional(),
  }).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  phone: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  operatingHours: Joi.array().items(Joi.object({
    day: Joi.number().min(0).max(6),
    open: Joi.string(),
    close: Joi.string(),
  })).optional(),
});
const updateOrgSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200),
  description: Joi.string().max(1000).allow(''),
  phone: Joi.string().max(30).allow(''),
  email: Joi.string().email().allow(''),
  operatingHours: Joi.array().items(Joi.object({
    day: Joi.number().integer().min(0).max(6).required(),
    open: Joi.string().required(),
    close: Joi.string().required(),
  })),
  address: Joi.object({
    line1: Joi.string().required(), city: Joi.string().required(),
    state: Joi.string().required(), pincode: Joi.string().pattern(/^\d{6}$/),
  }),
  longitude: Joi.number().min(-180).max(180),
  latitude: Joi.number().min(-90).max(90),
}).min(1);
const staffSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  password: Joi.string().min(6).max(128).required(),
});
const nearbyQuerySchema = Joi.object({
  lng: Joi.number().min(-180).max(180).required(),
  lat: Joi.number().min(-90).max(90).required(),
  radius: Joi.number().integer().min(1).max(100000).default(DEFAULTS.NEARBY_RADIUS_METERS),
  type: Joi.string().valid('all', 'hospital', 'rto', 'bank', 'government', 'other').default('all'),
});

const registerOrg = async (req, res, next) => {
  try {
    const { error, value } = registerOrgSchema.validate(req.body);
    if (error) {
      return sendError(res, 'VALIDATION_ERROR', error.details[0].message, 400);
    }

    const existing = await Organization.findOne({ adminId: req.user.userId }).lean();
    if (existing) {
      return sendError(res, 'ORG_EXISTS', 'You already have a registered organization', 409);
    }

    const { longitude, latitude, ...orgData } = value;

    const org = await Organization.create({
      ...orgData,
      location: createGeoPoint(longitude, latitude),
      adminId: req.user.userId,
    });

    await User.findByIdAndUpdate(req.user.userId, {
      role: 'org_admin',
      organizationId: org._id,
    });

    sendSuccess(res, { organization: org }, 'Organization registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

const getNearbyOrgs = async (req, res, next) => {
  try {
    const { error, value } = nearbyQuerySchema.validate(req.query);
    if (error) return sendError(res, 'VALIDATION_ERROR', error.details[0].message, 400);
    const { lng, lat, radius, type } = value;
    const maxDistance = radius;

    const filter = {
      location: {
        $near: {
          $geometry: createGeoPoint(lng, lat),
          $maxDistance: maxDistance,
        },
      },
      isActive: true,
    };

    if (type && type !== 'all') {
      filter.type = type;
    }

    const orgs = await Organization.find(filter)
      .select('name type description address location avgRating totalRatings')
      .limit(50)
      .lean();

    const orgsWithQueues = await Promise.all(
      orgs.map(async (org) => {
        const queues = await Queue.find({
          organizationId: org._id,
          status: { $in: ['active', 'paused', 'full'] },
        })
          .select('name status currentToken lastTokenIssued avgServiceTimeMs')
          .lean();

        const activeQueues = queues.map((q) => ({
          ...q,
          waiting: Math.max(0, q.lastTokenIssued - q.currentToken),
        }));

        return { ...org, queues: activeQueues };
      })
    );

    sendSuccess(res, { organizations: orgsWithQueues });
  } catch (err) {
    next(err);
  }
};

const getOrgById = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id)
      .select('-__v')
      .lean();

    if (!org) {
      return sendError(res, 'ORG_NOT_FOUND', 'Organization not found', 404);
    }

    const queues = await Queue.find({
      organizationId: org._id,
      status: { $ne: 'closed' },
    })
      .select('name description status currentToken lastTokenIssued avgServiceTimeMs maxCapacity totalServedToday')
      .lean();

    const enrichedQueues = queues.map((q) => ({
      ...q,
      waiting: Math.max(0, q.lastTokenIssued - q.currentToken),
    }));

    sendSuccess(res, { organization: org, queues: enrichedQueues });
  } catch (err) {
    next(err);
  }
};

const updateOrg = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) {
      return sendError(res, 'ORG_NOT_FOUND', 'Organization not found', 404);
    }

    if (String(org.adminId) !== req.user.userId) {
      return sendError(res, 'FORBIDDEN', 'You are not the admin of this organization', 403);
    }

    const { error, value } = updateOrgSchema.validate(req.body, { stripUnknown: true });
    if (error) return sendError(res, 'VALIDATION_ERROR', error.details[0].message, 400);
    const updates = { ...value };

    if ((req.body.longitude === undefined) !== (req.body.latitude === undefined)) {
      return sendError(res, 'VALIDATION_ERROR', 'Longitude and latitude must be provided together', 400);
    }
    if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
      updates.location = createGeoPoint(req.body.longitude, req.body.latitude);
    }

    const updated = await Organization.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select('-__v')
      .lean();

    sendSuccess(res, { organization: updated }, 'Organization updated');
  } catch (err) {
    next(err);
  }
};

const createStaff = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return sendError(res, 'ORG_NOT_FOUND', 'Organization not found', 404);
    if (String(org.adminId) !== req.user.userId) return sendError(res, 'FORBIDDEN', 'Only admin can add staff', 403);

    const { error, value } = staffSchema.validate(req.body);
    if (error) return sendError(res, 'VALIDATION_ERROR', error.details[0].message, 400);
    const { name, phone, password } = value;
    
    let user = await User.findOne({ phone });
    if (user) {
      return sendError(res, 'USER_EXISTS', 'User with this phone already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    user = await User.create({
      name,
      phone,
      passwordHash,
      role: 'staff',
      organizationId: org._id,
      isPhoneVerified: true,
      isActive: true,
    });

    sendSuccess(res, { staff: { id: user._id, name: user.name, phone: user.phone, role: user.role } }, 'Staff created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const getStaff = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return sendError(res, 'ORG_NOT_FOUND', 'Organization not found', 404);
    if (String(org.adminId) !== req.user.userId) return sendError(res, 'FORBIDDEN', 'Only admin can view staff', 403);

    const staff = await User.find({ organizationId: org._id, role: { $in: ['staff', 'org_admin'] } })
      .select('name phone role isActive lastLoginAt createdAt')
      .lean();

    sendSuccess(res, { staff });
  } catch (err) {
    next(err);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return sendError(res, 'ORG_NOT_FOUND', 'Organization not found', 404);
    if (String(org.adminId) !== req.user.userId) return sendError(res, 'FORBIDDEN', 'Only admin can view analytics', 403);

    const queues = await Queue.find({ organizationId: org._id }).lean();
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - 6);

    const dailyStats = await Token.aggregate([
      {
        $match: {
          organizationId: org._id,
          createdAt: { $gte: start },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
          issued: { $sum: 1 },
          served: { $sum: { $cond: [{ $eq: ['$status', 'served'] }, 1, 0] } },
          dropOffs: {
            $sum: {
              $cond: [{ $in: ['$status', ['cancelled', 'no_show', 'skipped']] }, 1, 0],
            },
          },
          avgWaitTimeMs: { $avg: '$actualWaitMs' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const statsByDate = new Map(dailyStats.map((stat) => [stat._id, stat]));
    const today = new Date();
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(today);
      date.setUTCHours(0, 0, 0, 0);
      date.setUTCDate(date.getUTCDate() - (6 - i));
      const key = date.toISOString().slice(0, 10);
      const stat = statsByDate.get(key);

      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
        served: stat?.served || 0,
        avgWaitTimeMinutes: Math.round((stat?.avgWaitTimeMs || 0) / 60000),
        dropOffs: stat?.dropOffs || 0,
      };
    });

    const todayKey = today.toISOString().slice(0, 10);
    const todayStats = statsByDate.get(todayKey);
    const totalIssued = dailyStats.reduce((sum, stat) => sum + stat.issued, 0);
    const totalServedToday = todayStats?.served || 0;
    const avgServiceTimeGlobal = queues.length
      ? queues.reduce((sum, q) => sum + (q.avgServiceTimeMs || 0), 0) / queues.length
      : 0;

    sendSuccess(res, { 
      overview: {
        totalQueues: queues.length,
        totalServedToday,
        avgServiceTimeGlobal,
        completionRate: totalIssued ? (dailyStats.reduce((sum, stat) => sum + stat.served, 0) / totalIssued) * 100 : 0,
      },
      chartData,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerOrg, getNearbyOrgs, getOrgById, updateOrg, createStaff, getStaff, getAnalytics,
  updateOrgSchema, staffSchema, nearbyQuerySchema,
};
