'use strict';

const { createClient } = require('@supabase/supabase-js');

/**
 * Persist sessions in Supabase to survive Vercel/Serverless restarts.
 * Table: sessions
 * Columns: phone (pk), step, persona, purpose, amount, requestId, lastActivity
 */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
try {
    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
        supabase = createClient(supabaseUrl, supabaseKey);
    }
} catch (err) {
    console.error('[Sessions] Supabase Init Error:', err.message);
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get session for a phone number from Supabase.
 */
async function getSession(phone) {
    if (!supabase) {
        console.warn('[Sessions] Supabase not configured. Falling back to temporary mock.');
        return createLocalSession(phone);
    }

    try {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('phone', phone)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
            console.error('[Supabase] Get Error:', error.message);
            return createLocalSession(phone);
        }

        if (data) {
            // Check expiry
            if (Date.now() - Number(data.lastActivity) > SESSION_TTL_MS) {
                await clearSession(phone);
                return createLocalSession(phone);
            }
            return data;
        }

        // New session
        const newSession = createLocalSession(phone);
        await saveToSupabase(phone, newSession);
        return newSession;
    } catch (err) {
        console.error('[Sessions] Fetch Error:', err.message);
        return createLocalSession(phone);
    }
}

/**
 * Update Supabase record.
 */
async function updateSession(phone, updates) {
    const session = await getSession(phone);
    const updated = { ...session, ...updates, lastActivity: Date.now() };

    if (!supabase) return;

    try {
        await saveToSupabase(phone, updated);
    } catch (err) {
        console.error('[Sessions] Update Error:', err.message);
    }
}

/**
 * Remove record.
 */
async function clearSession(phone) {
    if (!supabase) return;
    try {
        await supabase.from('sessions').delete().eq('phone', phone);
    } catch (err) {
        console.error('[Sessions] Clear Error:', err.message);
    }
}

// Helpers
function createLocalSession(phone) {
    return {
        phone,
        step: 'GREETING',
        persona: '',
        purpose: '',
        amount: '',
        requestId: '',
        lastActivity: Date.now()
    };
}

async function saveToSupabase(phone, data) {
    const { error } = await supabase
        .from('sessions')
        .upsert({ ...data, phone });
    if (error) throw error;
}

module.exports = { getSession, updateSession, clearSession };
