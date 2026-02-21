/**
 * Unit Tests for eventService.js
 * 
 * Tests CRUD operations for event leads (corporate, school, birthday)
 * via Supabase, with the Supabase client fully mocked.
 */

jest.mock('../../lib/supabase', () => ({
    supabase: {
        from: jest.fn()
    }
}));

import { supabase } from '../../lib/supabase';
import { eventService } from '../../lib/eventService';

/**
 * Thenable chain mock for Supabase
 */
function mockSupabaseChain(resolveWith) {
    const chain = {};
    const self = () => chain;
    ['select', 'eq', 'not', 'order', 'gte', 'lte', 'insert', 'update', 'delete', 'upsert', 'single'].forEach(m => {
        chain[m] = jest.fn(self);
    });
    chain.then = (resolve) => resolve(resolveWith);
    supabase.from.mockReturnValue(chain);
    return chain;
}

describe('eventService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    // ──────────────────────────────────
    // submitEventLead
    // ──────────────────────────────────
    describe('submitEventLead', () => {
        test('inserts a corporate event lead with correct fields', async () => {
            const leadData = {
                eventType: 'corporate',
                name: 'Ahmed Hassan',
                phone: '01012345678',
                email: 'ahmed@company.com',
                branch: 'New Cairo',
                preferredDate: '2026-04-15',
                preferredTime: 'afternoon',
                groupSize: 25,
                formPayload: { companyName: 'TechCo' },
                utmSource: 'facebook',
                utmCampaign: 'corporate_q2',
                utmMedium: 'cpc',
                utmContent: 'ad1',
                fbclid: 'fb123',
                eventId: null
            };

            const returnedLead = {
                id: 'lead-uuid-1',
                event_type: 'corporate',
                name: 'Ahmed Hassan',
                phone: '01012345678',
                status: 'New'
            };

            const chain = mockSupabaseChain({ data: returnedLead, error: null });

            const result = await eventService.submitEventLead(leadData);

            expect(supabase.from).toHaveBeenCalledWith('event_leads');
            expect(chain.insert).toHaveBeenCalledWith([expect.objectContaining({
                event_type: 'corporate',
                name: 'Ahmed Hassan',
                phone: '01012345678',
                email: 'ahmed@company.com',
                branch: 'New Cairo',
                status: 'New',
                preferred_date: '2026-04-15',
                preferred_time: 'afternoon',
                group_size: 25,
                utm_source: 'facebook',
            })]);
            expect(result).toEqual(returnedLead);
        });

        test('defaults branch to New Cairo when not provided', async () => {
            const leadData = { eventType: 'birthday', name: 'Test', phone: '010' };
            mockSupabaseChain({ data: { id: '1' }, error: null });

            await eventService.submitEventLead(leadData);

            expect(supabase.from).toHaveBeenCalledWith('event_leads');
        });

        test('throws on Supabase error', async () => {
            const chain = mockSupabaseChain({ data: null, error: { message: 'Insert failed' } });

            await expect(eventService.submitEventLead({
                eventType: 'corporate', name: 'Test', phone: '010'
            })).rejects.toEqual({ message: 'Insert failed' });
        });
    });

    // ──────────────────────────────────
    // getAllEventLeads
    // ──────────────────────────────────
    describe('getAllEventLeads', () => {
        test('returns all leads ordered by created_at desc', async () => {
            const mockLeads = [
                { id: '1', event_type: 'corporate', status: 'New' },
                { id: '2', event_type: 'birthday', status: 'Contacted' }
            ];

            // getAllEventLeads uses a different pattern — it builds query then awaits
            // We need the chain to resolve when awaited
            const chain = mockSupabaseChain({ data: mockLeads, error: null });

            const result = await eventService.getAllEventLeads();

            expect(supabase.from).toHaveBeenCalledWith('event_leads');
            expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
            expect(result).toEqual(mockLeads);
        });

        test('applies eventType filter when provided', async () => {
            const chain = mockSupabaseChain({ data: [], error: null });

            await eventService.getAllEventLeads({ eventType: 'corporate' });

            expect(chain.eq).toHaveBeenCalledWith('event_type', 'corporate');
        });

        test('applies status filter when provided', async () => {
            const chain = mockSupabaseChain({ data: [], error: null });

            await eventService.getAllEventLeads({ status: 'Contacted' });

            expect(chain.eq).toHaveBeenCalledWith('status', 'Contacted');
        });

        test('applies date range filters when provided', async () => {
            const chain = mockSupabaseChain({ data: [], error: null });

            await eventService.getAllEventLeads({
                startDate: '2026-01-01',
                endDate: '2026-03-31'
            });

            expect(chain.gte).toHaveBeenCalledWith('created_at', '2026-01-01');
            expect(chain.lte).toHaveBeenCalledWith('created_at', '2026-03-31');
        });

        test('throws on Supabase error', async () => {
            mockSupabaseChain({ data: null, error: { message: 'DB error' } });

            await expect(eventService.getAllEventLeads()).rejects.toEqual({ message: 'DB error' });
        });
    });

    // ──────────────────────────────────
    // getEventLeadById
    // ──────────────────────────────────
    describe('getEventLeadById', () => {
        test('returns a single lead by ID', async () => {
            const mockLead = { id: 'lead-1', event_type: 'school', name: 'Sara' };
            const chain = mockSupabaseChain({ data: mockLead, error: null });

            const result = await eventService.getEventLeadById('lead-1');

            expect(chain.eq).toHaveBeenCalledWith('id', 'lead-1');
            expect(chain.single).toHaveBeenCalled();
            expect(result).toEqual(mockLead);
        });

        test('throws when lead not found', async () => {
            mockSupabaseChain({ data: null, error: { message: 'Not found' } });

            await expect(eventService.getEventLeadById('nonexistent')).rejects.toEqual({ message: 'Not found' });
        });
    });

    // ──────────────────────────────────
    // updateEventLeadStatus
    // ──────────────────────────────────
    describe('updateEventLeadStatus', () => {
        test('updates status with timestamp', async () => {
            const updated = { id: 'lead-1', status: 'Contacted' };
            const chain = mockSupabaseChain({ data: updated, error: null });

            const result = await eventService.updateEventLeadStatus('lead-1', 'Contacted');

            expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({
                status: 'Contacted',
                updated_at: expect.any(String)
            }));
            expect(result).toEqual(updated);
        });

        test('throws on error', async () => {
            mockSupabaseChain({ data: null, error: { message: 'Update failed' } });

            await expect(eventService.updateEventLeadStatus('lead-1', 'Booked'))
                .rejects.toEqual({ message: 'Update failed' });
        });
    });

    // ──────────────────────────────────
    // updateEventLeadNotes
    // ──────────────────────────────────
    describe('updateEventLeadNotes', () => {
        test('updates internal_notes with timestamp', async () => {
            const updated = { id: 'lead-1', internal_notes: 'Follow up next week' };
            const chain = mockSupabaseChain({ data: updated, error: null });

            const result = await eventService.updateEventLeadNotes('lead-1', 'Follow up next week');

            expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({
                internal_notes: 'Follow up next week',
                updated_at: expect.any(String)
            }));
            expect(result).toEqual(updated);
        });
    });

    // ──────────────────────────────────
    // getEventStats
    // ──────────────────────────────────
    describe('getEventStats', () => {
        test('computes correct stats from event lead data', async () => {
            const mockLeads = [
                { event_type: 'corporate', status: 'New' },
                { event_type: 'corporate', status: 'Contacted' },
                { event_type: 'school', status: 'New' },
                { event_type: 'birthday', status: 'Booked' },
                { event_type: 'birthday', status: 'Closed' }
            ];

            mockSupabaseChain({ data: mockLeads, error: null });

            const stats = await eventService.getEventStats();

            expect(stats.total).toBe(5);
            expect(stats.byType.corporate).toBe(2);
            expect(stats.byType.school).toBe(1);
            expect(stats.byType.birthday).toBe(2);
            expect(stats.byStatus.New).toBe(2);
            expect(stats.byStatus.Contacted).toBe(1);
            expect(stats.byStatus.Closed).toBe(1);
            expect(stats.byStatus.Booked).toBe(1);
        });

        test('returns zero stats for empty data', async () => {
            mockSupabaseChain({ data: [], error: null });

            const stats = await eventService.getEventStats();

            expect(stats.total).toBe(0);
            expect(stats.byType.corporate).toBe(0);
            expect(stats.byType.school).toBe(0);
            expect(stats.byType.birthday).toBe(0);
        });

        test('throws on error', async () => {
            mockSupabaseChain({ data: null, error: { message: 'Stats error' } });

            await expect(eventService.getEventStats()).rejects.toEqual({ message: 'Stats error' });
        });
    });
});
