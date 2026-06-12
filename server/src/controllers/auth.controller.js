const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { DEFAULTS } = require('../config/constants');
const logger = require('../utils/logger');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Please enter a valid 10-digit Indian mobile number',
  }),
  email: Joi.string().email().optional().allow(''),
  password: Joi.string().min(6).max(128).required(),
});

const loginSchema = Joi.object({
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  password: Joi.string().required(),
  portalRole: Joi.string().valid('customer', 'staff', 'admin').optional(),
});

const portalRoleMap = {
  customer: ['citizen'],
  staff: ['staff'],
  admin: ['org_admin', 'super_admin'],
};

const isProduction = process.env.NODE_ENV === 'production';
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearRefreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
};

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return sendError(res, 'VALIDATION_ERROR', error.details[0].message, 400);
    }

    const { name, phone, email, password } = value;

    const existing = await User.findOne({ phone }).lean();
    if (existing) {
      return sendError(res, 'PHONE_EXISTS', 'An account with this phone number already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      phone,
      email: email || undefined,
      passwordHash,
      role: 'citizen',
    });

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await User.findByIdAndUpdate(user._id, { refreshTokenHash });

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
    }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return sendError(res, 'VALIDATION_ERROR', error.details[0].message, 400);
    }

    const { phone, password } = value;
    const expectedRoles = value.portalRole ? portalRoleMap[value.portalRole] : null;

    const user = await User.findOne({ phone, isActive: true });
    if (!user) {
      return sendError(res, 'INVALID_CREDENTIALS', 'Invalid phone number or password', 401);
    }

    if (expectedRoles && !expectedRoles.includes(user.role)) {
      return sendError(
        res,
        'ROLE_MISMATCH',
        'This account does not match the selected login portal',
        403
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'INVALID_CREDENTIALS', 'Invalid phone number or password', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await User.findByIdAndUpdate(user._id, {
      refreshTokenHash,
      lastLoginAt: new Date(),
    });

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        organizationId: user.organizationId,
      },
      accessToken,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, { refreshTokenHash: null });
    res.clearCookie('refreshToken', clearRefreshCookieOptions);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

const refreshTokenHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return sendError(res, 'NO_REFRESH_TOKEN', 'Refresh token required', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      res.clearCookie('refreshToken', clearRefreshCookieOptions);
      return sendError(res, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token', 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokenHash || !user.isActive) {
      res.clearCookie('refreshToken', clearRefreshCookieOptions);
      return sendError(res, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token', 401);
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      await User.findByIdAndUpdate(user._id, { refreshTokenHash: null });
      res.clearCookie('refreshToken', clearRefreshCookieOptions);
      return sendError(res, 'TOKEN_REUSE', 'Refresh token has been revoked', 401);
    }

    const tokens = generateTokens(user._id, user.role);
    const newHash = await bcrypt.hash(tokens.refreshToken, 10);
    await User.findByIdAndUpdate(user._id, { refreshTokenHash: newHash });

    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

    sendSuccess(res, {
      accessToken: tokens.accessToken,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        organizationId: user.organizationId,
      },
    }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

const verifyPhone = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (code !== DEFAULTS.DEV_OTP_CODE) {
      return sendError(res, 'INVALID_OTP', 'Invalid verification code', 400);
    }

    await User.findByIdAndUpdate(req.user.userId, { isPhoneVerified: true });
    sendSuccess(res, null, 'Phone verified successfully');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-passwordHash -refreshTokenHash')
      .lean();
    if (!user) {
      return sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
    }
    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, refreshToken: refreshTokenHandler, verifyPhone, getMe };
