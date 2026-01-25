/**
 * Adapter Layer
 * Maps Supabase database objects to the format expected by the frontend components.
 */

export const roomAdapter = (dbRoom) => {
    if (!dbRoom) return null;

    // Sort images by order_index
    const sortedImages = dbRoom.room_images
        ? [...dbRoom.room_images].sort((a, b) => a.order_index - b.order_index)
        : [];

    return {
        id: dbRoom.id,
        slug: dbRoom.slug,
        name: dbRoom.name,
        tagline: dbRoom.tagline,
        description: dbRoom.description,
        minPlayers: dbRoom.min_players,
        maxPlayers: dbRoom.max_players,
        duration: dbRoom.duration,
        difficulty: dbRoom.difficulty,
        isHorror: dbRoom.is_horror,
        horrorToggleable: dbRoom.horror_toggleable,
        nonHorrorAvailable: dbRoom.non_horror_available,
        // Use first image as main image
        image: sortedImages[0]?.image_url || 'https://trappedegypt.com/wp-content/uploads/2022/11/TRAPPED-NEW-CAIRO-ROOMS.jpg.webp',
        images: sortedImages.map(img => img.image_url),
        // Map pricing tiers to object
        pricing: dbRoom.pricing_tiers?.reduce((acc, tier) => {
            acc[tier.player_count] = tier.price_per_person;
            return acc;
        }, {}) || {}
    };
};

export const bookingAdapter = (dbBooking) => {
    if (!dbBooking) return null;
    return {
        id: dbBooking.id,
        customerName: dbBooking.customer_name,
        customerPhone: dbBooking.customer_phone,
        roomName: dbBooking.rooms?.name || 'Unknown Room',
        date: dbBooking.booking_date,
        timeSlot: dbBooking.time_slot,
        players: dbBooking.player_count,
        totalPrice: dbBooking.total_price,
        status: dbBooking.status,
        notes: dbBooking.booking_notes?.[0]?.note || ''
    };
};
