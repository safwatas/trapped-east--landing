import { supabase } from './supabase';

/**
 * Event Service
 * Handles all operations related to special event leads:
 * - Corporate Team Building
 * - School Trips
 * - Birthdays
 */

export const eventService = {
    /**
     * Submit a new event lead
     */
    async submitEventLead(leadData) {
        const { data, error } = await supabase
            .from('event_leads')
            .insert([{
                event_type: leadData.eventType,
                name: leadData.name,
                phone: leadData.phone,
                email: leadData.email || null,
                branch: leadData.branch || 'New Cairo',
                status: 'New',
                form_payload: leadData.formPayload || {},
                utm_source: leadData.utmSource,
                utm_campaign: leadData.utmCampaign,
                utm_medium: leadData.utmMedium,
                utm_content: leadData.utmContent,
                fbclid: leadData.fbclid,
                event_id: leadData.eventId
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get all event leads (admin only)
     */
    async getAllEventLeads(filters = {}) {
        let query = supabase
            .from('event_leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters.eventType) {
            query = query.eq('event_type', filters.eventType);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.branch) {
            query = query.eq('branch', filters.branch);
        }
        if (filters.startDate) {
            query = query.gte('created_at', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('created_at', filters.endDate);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    /**
     * Get a single event lead by ID
     */
    async getEventLeadById(id) {
        const { data, error } = await supabase
            .from('event_leads')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update event lead status
     */
    async updateEventLeadStatus(id, status) {
        const { data, error } = await supabase
            .from('event_leads')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update event lead notes
     */
    async updateEventLeadNotes(id, notes) {
        const { data, error } = await supabase
            .from('event_leads')
            .update({
                internal_notes: notes,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get event lead statistics
     */
    async getEventStats() {
        const { data, error } = await supabase
            .from('event_leads')
            .select('event_type, status');

        if (error) throw error;

        const stats = {
            total: data.length,
            byType: {
                corporate: data.filter(l => l.event_type === 'corporate').length,
                school: data.filter(l => l.event_type === 'school').length,
                birthday: data.filter(l => l.event_type === 'birthday').length
            },
            byStatus: {
                New: data.filter(l => l.status === 'New').length,
                Contacted: data.filter(l => l.status === 'Contacted').length,
                Closed: data.filter(l => l.status === 'Closed').length,
                Booked: data.filter(l => l.status === 'Booked').length
            }
        };

        return stats;
    }
};
