/**
 * Site Configuration - Single Source of Truth
 * All contact info, social links, and brand assets are defined here.
 * Import this file wherever you need these values.
 */

export const siteConfig = {
    // Brand
    name: 'Trapped Egypt',
    branch: 'New Cairo',
    tagline: 'Escape Or Get Caught!',
    description: "Egypt's #1 Escape Room Experience. Can you escape before time runs out?",

    // Logo
    logo: '/logo.svg',
    logoAlt: 'Trapped Egypt Logo',

    // Contact
    phone: '+201028885599',
    phoneDisplay: '+20 102 888 5599',
    whatsapp: '+201028885599',
    email: 'info@trappedegypt.com',

    // Address
    address: 'Fifth Settlement, New Cairo, Egypt',
    addressShort: 'New Cairo - Fifth Settlement',

    // Social Links
    facebook: 'https://www.facebook.com/TrappedNewCairo',
    instagram: 'https://www.instagram.com/trapped_newcairo',

    // Maps
    googleMapsUrl: 'https://maps.app.goo.gl/trapped-new-cairo',
    googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3454.2724865726847!2d31.4!3d30.03!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAxJzQ4LjAiTiAzMcKwMjQnMDAuMCJF!5e0!3m2!1sen!2seg!4v1234567890',

    // Opening Hours
    openingHours: {
        everyday: '3:00 PM - 3:00 AM',
        lastSlot: '1:30 AM'
    }
};

// Helper to get WhatsApp link
export const getWhatsAppLink = (message = '') => {
    const phone = siteConfig.whatsapp.replace('+', '');
    return message
        ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        : `https://wa.me/${phone}`;
};

// Helper to get phone link
export const getPhoneLink = () => `tel:${siteConfig.phone}`;

// Helper to get email link
export const getEmailLink = () => `mailto:${siteConfig.email}`;

export default siteConfig;
