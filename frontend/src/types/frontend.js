/**
 * @typedef {Object} RoomImage
 * @property {string} id
 * @property {string} room_id
 * @property {string} image_url
 * @property {number} order_index
 */

/**
 * @typedef {Object} PricingTier
 * @property {string} id
 * @property {string} room_id
 * @property {number} player_count
 * @property {number} price_per_person
 */

/**
 * @typedef {Object} Room
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {string} tagline
 * @property {string} description
 * @property {number} min_players
 * @property {number} max_players
 * @property {number} duration
 * @property {string} difficulty
 * @property {boolean} is_horror
 * @property {boolean} horror_toggleable
 * @property {boolean} non_horror_available
 * @property {boolean} active
 * @property {RoomImage[]} [room_images]
 * @property {PricingTier[]} [pricing_tiers]
 */

/**
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} room_id
 * @property {string} booking_date
 * @property {string} time_slot
 * @property {number} player_count
 * @property {boolean} horror_mode
 * @property {number} total_price
 * @property {number} price_per_person
 * @property {string} [applied_promo]
 * @property {string} customer_name
 * @property {string} customer_phone
 * @property {string} customer_email
 * @property {string} status
 * @property {string} [utm_source]
 * @property {string} [utm_campaign]
 * @property {string} [event_id]
 */

export const BookingStatus = {
    NEW: 'new',
    CONTACTED: 'contacted',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no-show'
};
