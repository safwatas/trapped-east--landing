import { supabase } from './supabase'

/**
 * Booking Service
 * Decouples the UI from direct Supabase calls and implements business logic.
 */
export const bookingService = {
    /**
     * Fetches all active rooms with their images.
     */
    async getRooms() {
        const { data, error } = await supabase
            .from('rooms')
            .select('*, room_images(*)')
            .eq('active', true)
            .order('name')
        if (error) throw error
        return data
    },

    /**
     * Fetches a single room by its slug with images and pricing.
     */
    async getRoomBySlug(slug) {
        const { data, error } = await supabase
            .from('rooms')
            .select('*, room_images(*), pricing_tiers(*)')
            .eq('slug', slug)
            .single()
        if (error) throw error
        return data
    },

    /**
     * Fetches all active time slots.
     */
    async getTimeSlots() {
        const { data, error } = await supabase
            .from('time_slots')
            .select('*')
            .eq('is_active', true)
            .order('slot_time')
        if (error) throw error
        return data
    },

    /**
     * Fetches booked slots for a specific room and date.
     */
    async getBookedSlots(roomId, date) {
        const { data, error } = await supabase
            .from('bookings')
            .select('time_slot')
            .eq('room_id', roomId)
            .eq('booking_date', date)
            .not('status', 'eq', 'cancelled')

        if (error) throw error
        return data.map(b => b.time_slot)
    },

    /**
     * Fetches all bookings for a specific date (for calendar view).
     */
    async getBookingsForDate(date) {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, rooms(name, slug)')
            .eq('booking_date', date)
            .order('time_slot')

        if (error) throw error
        return data
    },

    /**
     * Fetches all bookings for a date range (for calendar view).
     */
    async getBookingsForDateRange(startDate, endDate) {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, rooms(name, slug)')
            .gte('booking_date', startDate)
            .lte('booking_date', endDate)
            .order('booking_date')
            .order('time_slot')

        if (error) throw error
        return data
    },

    /**
     * Validates a promo code.
     */
    async validatePromoCode(code, playerCount) {
        const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', code)
            .eq('active', true)
            .single()

        if (error) return null
        if (data.min_players && playerCount < data.min_players) return null
        // Additional expiry logic could be added here
        return data
    },

    /**
     * Creates a new booking entry with pricing snapshot and attribution.
     */
    async createBooking(bookingData) {
        const { data, error } = await supabase
            .from('bookings')
            .insert([bookingData])
            .select()
            .single()

        if (error) {
            // Handle unique constraint violation (double booking)
            if (error.code === '23505') {
                throw new Error('This slot was just taken. Please choose another time.')
            }
            throw error
        }
        return data
    },

    /**
     * Fetch all bookings for admin view.
     */
    async getAllBookings() {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, rooms(name)')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * Update booking status.
     */
    async updateBookingStatus(bookingId, status) {
        const { data, error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', bookingId)
            .select()

        if (error) throw error
        return data
    },

    /**
     * Update internal notes for a booking.
     */
    async updateBookingNotes(bookingId, note) {
        // Update the internal_notes column directly on the booking
        const { data, error } = await supabase
            .from('bookings')
            .update({ internal_notes: note, updated_at: new Date().toISOString() })
            .eq('id', bookingId)
            .select()

        if (error) throw error
        return data
    },

    /**
     * Update room details.
     */
    async updateRoom(roomId, roomData) {
        const { data, error } = await supabase
            .from('rooms')
            .update(roomData)
            .eq('id', roomId)
            .select()

        if (error) throw error
        return data
    },

    /**
     * Delete room (deactive).
     */
    async deleteRoom(roomId) {
        const { error } = await supabase
            .from('rooms')
            .update({ active: false })
            .eq('id', roomId)

        if (error) throw error
        return true
    },

    /**
     * Fetch all promo codes.
     */
    async getAllPromoCodes() {
        const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .order('code')

        if (error) throw error
        return data || []
    },

    /**
     * Create or update a promo code.
     */
    async upsertPromoCode(promoData) {
        const { data, error } = await supabase
            .from('promo_codes')
            .upsert(promoData, { onConflict: 'code' })
            .select()

        if (error) throw error
        return data
    },

    /**
     * Delete a promo code.
     */
    async deletePromoCode(id) {
        const { error } = await supabase
            .from('promo_codes')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }
}
