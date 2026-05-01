const logger = require('../utils/logger');

// SMS is optional — only active when TWILIO_PHONE is configured
const isSmsEnabled = !!(
  process.env.TWILIO_SID &&
  process.env.TWILIO_TOKEN &&
  process.env.TWILIO_PHONE &&
  !process.env.TWILIO_PHONE.startsWith('+1xxxxxxxxxx')
);

let twilioClient = null;

if (isSmsEnabled) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    logger.info('Twilio SMS service initialized');
  } catch (err) {
    logger.warn('Twilio package not installed — SMS disabled. Run: npm install twilio');
  }
} else {
  logger.info('SMS disabled (TWILIO_PHONE not configured)');
}

/**
 * Send an SMS message.
 * Silently skips if SMS is not enabled.
 * @param {string} to   - E.164 phone number e.g. "+919876543210"
 * @param {string} body - Message text
 */
const sendSms = async (to, body) => {
  if (!twilioClient || !isSmsEnabled) {
    logger.debug(`[SMS skipped] To: ${to} | Msg: ${body}`);
    return null;
  }

  try {
    const message = await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE,
      to,
      body,
    });
    logger.info(`SMS sent to ${to} — SID: ${message.sid}`);
    return message;
  } catch (err) {
    // Never crash the app over a failed SMS
    logger.error(`SMS failed to ${to}: ${err.message}`);
    return null;
  }
};

/**
 * Notify a user that their token is being called.
 * @param {string} phone       - User's phone number (stored in DB)
 * @param {number} tokenNumber - Token number being called
 * @param {string} queueName   - Name of the queue
 * @param {string} orgName     - Name of the organization
 */
const notifyTokenCalled = (phone, tokenNumber, queueName, orgName) => {
  const body =
    `🔔 CrowdQueue Alert: Token #${tokenNumber} is now being called at ` +
    `${queueName} — ${orgName}. Please proceed to the counter. Reply STOP to opt out.`;
  return sendSms(phone, body);
};

/**
 * Notify a user that their token is coming up soon (e.g. 2 ahead).
 */
const notifyTokenSoon = (phone, tokenNumber, queueName, tokensAhead) => {
  const body =
    `⏳ CrowdQueue: You're ${tokensAhead} token(s) away! ` +
    `Token #${tokenNumber} at ${queueName}. Get ready!`;
  return sendSms(phone, body);
};

module.exports = { sendSms, notifyTokenCalled, notifyTokenSoon, isSmsEnabled };
