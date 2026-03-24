const Holiday = require('../models/Holiday');

/**
 * Standard Indian Holidays for 2026
 */
const indianHolidays = [
  { name: 'Republic Day', date: '2026-01-26', type: 'Public', isPaid: true, isCustom: false },
  { name: 'Independence Day', date: '2026-08-15', type: 'Public', isPaid: true, isCustom: false },
  { name: 'Gandhi Jayanti', date: '2026-10-02', type: 'Public', isPaid: true, isCustom: false },
  { name: 'Christmas', date: '2026-12-25', type: 'Public', isPaid: true, isCustom: false },
  { name: 'Holi', date: '2026-03-03', type: 'Public', isPaid: true, isCustom: false },
  { name: 'Diwali', date: '2026-11-08', type: 'Public', isPaid: true, isCustom: false },
  { name: 'Eid al-Fitr', date: '2026-03-20', type: 'Public', isPaid: true, isCustom: false },
  { name: 'Good Friday', date: '2026-04-03', type: 'Public', isPaid: true, isCustom: false }
];

/**
 * Seeder utility to populate Indian holidays for a specific tenant.
 * Uses upsert logic to safely handle existing records without throwing errors.
 */
const seedIndiaHolidays = async (tenantId) => {
  let createdCount = 0;
  
  for (const holiday of indianHolidays) {
    const holidayDate = new Date(holiday.date);
    
    // Use findOneAndUpdate with upsert to avoid duplicate key errors entirely
    const existing = await Holiday.findOneAndUpdate(
      { tenantId, date: holidayDate },
      { $set: { ...holiday, tenantId, date: holidayDate } },
      { upsert: true, new: true, rawResult: true }
    );

    // Mongoose rawResult gives us access to lastErrorObject.updatedExisting
    if (existing.lastErrorObject && !existing.lastErrorObject.updatedExisting) {
        createdCount++;
    }
  }

  return { 
    message: createdCount > 0 ? `Successfully added ${createdCount} new holidays.` : "All standard holidays are already present.",
    insertedCount: createdCount 
  };
};

module.exports = seedIndiaHolidays;
