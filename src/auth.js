'use strict';

const { listUsers } = require('./sheets');

/**
 * Basic authentication/role identification based on phone number.
 */
async function authenticate(phone) {
    if (!phone) return null;

    const cleanPhone = phone.replace(/\D/g, '');
    const users = await listUsers();
    
    // Check if user exists in the Users sheet
    const user = users.find(u => u.phone.replace(/\D/g, '') === cleanPhone);
    
    if (user) {
        return user;
    }

    // Default Fallbacks for Admins from .env if not in sheet
    const admins = {
        PRIMARY: (process.env.PRIMARY_ADMIN || '').replace(/\D/g, ''),
        PH_1: (process.env.PH_ADMIN_1 || '').replace(/\D/g, ''),
        PH_2: (process.env.PH_ADMIN_2 || '').replace(/\D/g, ''),
        ABUJA_1: (process.env.ABUJA_ADMIN_1 || '').replace(/\D/g, ''),
        ABUJA_2: (process.env.ABUJA_ADMIN_2 || '').replace(/\D/g, ''),
    };

    if (cleanPhone === admins.PRIMARY) return { phone: cleanPhone, name: 'Primary Admin', role: 'CEO', department: 'Executive' };
    if (Object.values(admins).includes(cleanPhone)) return { phone: cleanPhone, name: 'Admin', role: 'Admin', department: 'Management' };

    return null;
}

module.exports = { authenticate };
