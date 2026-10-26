const StatusHistory = require('../models/StatusHistory');

/**
 * Log a donation status transition to the audit trail
 * @param {string|ObjectId} donationId
 * @param {string} previousStatus
 * @param {string} newStatus
 * @param {string|ObjectId} actorId
 * @param {string} note
 */
const logStatusChange = async (donationId, previousStatus, newStatus, actorId, note = '') => {
  try {
    const record = await StatusHistory.create({
      donation: donationId,
      previousStatus,
      newStatus,
      actor: actorId,
      note,
      timestamp: new Date(),
    });
    return record;
  } catch (err) {
    console.error('Error logging status history:', err.message);
  }
};

module.exports = {
  logStatusChange,
};
