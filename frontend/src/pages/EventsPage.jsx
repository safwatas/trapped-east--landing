import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, GraduationCap, Cake, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { eventTypes } from '../data/eventConfig';
import { analytics } from '../lib/analytics';

const iconMap = {
    'building': Building2,
    'graduation-cap': GraduationCap,
    'cake': Cake
};

// Event cover images - curated stock photos
const eventImages = {
    corporate: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80&auto=format&fit=crop',
    school: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80&auto=format&fit=crop',
    birthday: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80&auto=format&fit=crop'
};

const EventCard = ({ event }) => {
    const Icon = iconMap[event.icon] || Building2;
    const coverImage = eventImages[event.id] || event.image;

    return (
        <div className="group relative rounded-3xl overflow-hidden border border-white/10 transition-all duration-300 hover:border-[color:var(--brand-accent)]/30 hover:-translate-y-1">
            {/* Cover Image */}
            {coverImage && (
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={coverImage}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--bg-base)] via-[color:var(--bg-base)]/50 to-transparent" />

                    {/* Icon Badge */}
                    <div className="absolute bottom-4 left-6 w-12 h-12 rounded-xl bg-[color:var(--brand-accent)] flex items-center justify-center shadow-lg">
                        <Icon className="w-6 h-6 text-black" />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className={`relative p-6 md:p-8 space-y-4 bg-gradient-to-br ${event.color}`}>
                {/* Title & Description */}
                <div>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-2">
                        {event.title}
                    </h3>
                    <p className="text-[color:var(--text-muted)] leading-relaxed text-sm md:text-base">
                        {event.shortDescription}
                    </p>
                </div>

                {/* Bullets - Show first 3 */}
                <ul className="space-y-2">
                    {event.bullets.slice(0, 3).map((bullet, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-[color:var(--text-secondary)]">
                            <CheckCircle className="w-4 h-4 text-[color:var(--brand-accent)] flex-shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <Link to={`/events/${event.id === 'school' ? 'school-trips' : event.id}`} className="block pt-2">
                    <Button className="w-full bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-12 rounded-xl group-hover:shadow-[0_0_30px_rgba(var(--brand-accent-rgb),0.3)] transition-all">
                        Learn More
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default function EventsPage() {
    useEffect(() => {
        analytics.track('ViewEventPage', {
            event_type: 'overview',
            page: '/events'
        });
    }, []);

    return (
        <div className="min-h-screen bg-[color:var(--bg-base)]">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--brand-accent)]/5 to-transparent" />

                <div className="relative max-w-6xl mx-auto text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--brand-accent)] mb-4 font-medium">
                        Special Events
                    </p>
                    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Unforgettable Group<br />
                        <span className="text-[color:var(--brand-accent)]">Experiences</span>
                    </h1>
                    <p className="text-lg text-[color:var(--text-secondary)] max-w-2xl mx-auto">
                        From corporate team building to school trips and birthday celebrations,
                        we create custom escape room experiences for groups of all sizes.
                    </p>
                </div>
            </section>

            {/* Event Cards */}
            <section className="py-12 md:py-20 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {eventTypes.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 md:py-24 px-4 md:px-8 bg-[color:var(--bg-surface)]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
                        Why Host Your Event at Trapped?
                    </h2>
                    <p className="text-[color:var(--text-secondary)] mb-12 max-w-2xl mx-auto">
                        We've hosted hundreds of successful group events. Here's what makes us different:
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-[color:var(--brand-accent)]/10 flex items-center justify-center">
                                <span className="font-display text-xl font-bold text-[color:var(--brand-accent)]">1</span>
                            </div>
                            <h3 className="font-display font-semibold text-white">Custom Packages</h3>
                            <p className="text-sm text-[color:var(--text-muted)]">
                                We tailor every event to your specific needs, group size, and budget.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-[color:var(--brand-accent)]/10 flex items-center justify-center">
                                <span className="font-display text-xl font-bold text-[color:var(--brand-accent)]">2</span>
                            </div>
                            <h3 className="font-display font-semibold text-white">Expert Coordination</h3>
                            <p className="text-sm text-[color:var(--text-muted)]">
                                Our dedicated events team handles all the logistics so you can focus on the fun.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-[color:var(--brand-accent)]/10 flex items-center justify-center">
                                <span className="font-display text-xl font-bold text-[color:var(--brand-accent)]">3</span>
                            </div>
                            <h3 className="font-display font-semibold text-white">Premium Facilities</h3>
                            <p className="text-sm text-[color:var(--text-muted)]">
                                State-of-the-art rooms, private party areas, and all the amenities you need.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 md:py-20 px-4 md:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                        Ready to Plan Your Event?
                    </h2>
                    <p className="text-[color:var(--text-muted)] mb-8">
                        Choose an event type above to get started, or contact us directly for custom inquiries.
                    </p>
                    <Link to="/contact">
                        <Button variant="outline" className="bg-transparent text-white border-white/20 hover:border-[color:var(--brand-accent)] hover:text-[color:var(--brand-accent)] h-12 px-8 rounded-xl">
                            Contact Us Directly
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
