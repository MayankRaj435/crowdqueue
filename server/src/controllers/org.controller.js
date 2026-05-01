const Joi = require('joi');
const bcrypt = require('bcryptjs');
const Organization = require('../models/Organization.model');
const Queue = require('../models/Queue.model');
const User = require('../models/User.model');
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
    const { lng, lat, radius, type } = req.query;
    if (!lng || !lat) {
      return sendError(res, 'MISSING_LOCATION', 'Longitude and latitude are required', 400);
    }

    const maxDistance = parseInt(radius) || DEFAULTS.NEARBY_RADIUS_METERS;

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

    const allowedFields = ['name', 'description', 'phone', 'email', 'operatingHours', 'address'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.body.longitude && req.body.latitude) {
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

    const { name, phone, password } = req.body;
    
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
    
    const today = new Date();
    const mockData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      return {
        date: dateStr,
        served: Math.floor(Math.random() * 50) + (i === 6 ? queues.reduce((sum, q) => sum + (q.totalServedToday || 0), 0) : 0),
        avgWaitTimeMinutes: Math.floor(Math.random() * 20) + 10,
        dropOffs: Math.floor(Math.random() * 10),
      };
    });

    sendSuccess(res, { 
      overview: {
        totalQueues: queues.length,
        totalServedToday: queues.reduce((sum, q) => sum + (q.totalServedToday || 0), 0),
        avgServiceTimeGlobal: queues.length ? queues.reduce((sum, q) => sum + (q.avgServiceTimeMs || 0), 0) / queues.length : 0,
      },
      chartData: mockData
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerOrg, getNearbyOrgs, getOrgById, updateOrg, createStaff, getStaff, getAnalytics };
