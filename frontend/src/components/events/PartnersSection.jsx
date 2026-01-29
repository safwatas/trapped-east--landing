import React from 'react';

/**
 * Partners/Trusted By Section
 * Displays corporate partner logos and optional testimonials
 */

// Partner data - using placeholder/representative company logos
const partners = [
    {
        name: 'Vodafone',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Vodafone_icon.svg/120px-Vodafone_icon.svg.png'
    },
    {
        name: 'Orange',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/120px-Orange_logo.svg.png'
    },
    {
        name: 'Microsoft',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/120px-Microsoft_logo_%282012%29.svg.png'
    },
    {
        name: 'Pepsi',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pepsi_logo_2014.svg/120px-Pepsi_logo_2014.svg.png'
    },
    {
        name: 'Samsung',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/120px-Samsung_Logo.svg.png'
    },
    {
        name: 'Dell',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dell_logo_2016.svg/120px-Dell_logo_2016.svg.png'
    }
];

export function PartnersSection({
    title = "Trusted By Leading Organizations",
    subtitle = "Join hundreds of companies that have experienced our team-building programs",
    variant = "default"
}) {
    return (
        <section className={`py-16 md:py-20 px-4 md:px-8 ${variant === 'surface' ? 'bg-[color:var(--bg-surface)]' : ''}`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--brand-accent)] mb-3 font-medium">
                        Our Partners
                    </p>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                        {title}
                    </h2>
                    <p className="text-[color:var(--text-muted)] max-w-xl mx-auto">
                        {subtitle}
                    </p>
                </div>

                {/* Logos Grid */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-8 items-center">
                    {partners.map((partner) => (
                        <div
                            key={partner.name}
                            className="flex items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[color:var(--brand-accent)]/30 transition-all duration-300 grayscale hover:grayscale-0 opacity-70 hover:opacity-100"
                        >
                            <img
                                src={partner.logo}
                                alt={partner.name}
                                className="h-8 md:h-10 w-auto object-contain"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="p-4">
                        <div className="font-display text-3xl md:text-4xl font-bold text-[color:var(--brand-accent)] mb-1">
                            200+
                        </div>
                        <p className="text-sm text-[color:var(--text-muted)]">Corporate Events</p>
                    </div>
                    <div className="p-4">
                        <div className="font-display text-3xl md:text-4xl font-bold text-[color:var(--brand-accent)] mb-1">
                            50+
                        </div>
                        <p className="text-sm text-[color:var(--text-muted)]">Partner Companies</p>
                    </div>
                    <div className="p-4">
                        <div className="font-display text-3xl md:text-4xl font-bold text-[color:var(--brand-accent)] mb-1">
                            9000+
                        </div>
                        <p className="text-sm text-[color:var(--text-muted)]">Happy Participants</p>
                    </div>
                    <div className="p-4">
                        <div className="font-display text-3xl md:text-4xl font-bold text-[color:var(--brand-accent)] mb-1">
                            4.5★
                        </div>
                        <p className="text-sm text-[color:var(--text-muted)]">Average Rating</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function TestimonialsSection({ testimonials }) {
    const defaultTestimonials = [
        {
            quote: "The escape room team building was the highlight of our corporate retreat. Everyone is still talking about it!",
            author: "Ahmed M.",
            role: "HR Director",
            company: "Tech Solutions Egypt"
        },
        {
            quote: "Perfect for our sales team. It really helped them understand the importance of communication and teamwork.",
            author: "Sara K.",
            role: "Sales Manager",
            company: "Digital Marketing Agency"
        },
        {
            quote: "Our students had an amazing educational field trip. The puzzles were challenging but age-appropriate.",
            author: "Mohamed H.",
            role: "School Principal",
            company: "International School Cairo"
        }
    ];

    const items = testimonials || defaultTestimonials;

    return (
        <section className="py-16 md:py-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--brand-accent)] mb-3 font-medium">
                        Testimonials
                    </p>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                        What Our Clients Say
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {items.map((testimonial, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-2xl bg-[color:var(--bg-surface)] border border-white/10 hover:border-[color:var(--brand-accent)]/30 transition-colors"
                        >
                            {/* Quote Icon */}
                            <div className="text-4xl text-[color:var(--brand-accent)]/30 mb-4">"</div>

                            {/* Quote Text */}
                            <p className="text-[color:var(--text-secondary)] mb-6 leading-relaxed">
                                {testimonial.quote}
                            </p>

                            {/* Author */}
                            <div>
                                <p className="font-semibold text-white">{testimonial.author}</p>
                                <p className="text-sm text-[color:var(--text-muted)]">
                                    {testimonial.role}, {testimonial.company}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default PartnersSection;
