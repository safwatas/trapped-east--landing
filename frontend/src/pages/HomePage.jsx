import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, Clock, Users, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import RoomCard from '../components/rooms/RoomCard';
import { rooms, faqs } from '../data/mock';

const HowItWorksCard = ({ icon: Icon, title, description, step }) => (
  <div className="relative group">
    <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[color:var(--brand-accent)] text-black font-display font-bold flex items-center justify-center text-lg">
      {step}
    </div>
    <div className="p-6 md:p-8 rounded-2xl bg-[color:var(--bg-surface)] border border-white/10 h-full transition-all duration-300 group-hover:border-[color:var(--brand-accent)]/30">
      <div className="w-12 h-12 rounded-xl bg-[color:var(--brand-accent)]/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[color:var(--brand-accent)]" />
      </div>
      <h3 className="font-display text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-[color:var(--text-muted)] text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function HomePage() {
  const featuredRooms = rooms.slice(0, 3);

  return (
    <div className="min-h-screen bg-[color:var(--bg-base)]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[color:var(--bg-base)]" />
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'url(https://trappedegypt.com/wp-content/uploads/2022/11/TRAPPED-NEW-CAIRO-ROOMS.jpg.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'grayscale(30%)'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 text-center py-20">
          <div className="animate-slideUp">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--brand-accent)] mb-6 font-medium">
              Egypt's #1 Escape Room Experience
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] text-white mb-6">
              Escape Or<br />
              <span className="text-[color:var(--brand-accent)]">Get Caught!</span>
            </h1>
            <p className="text-lg md:text-xl text-[color:var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
              Can you solve the puzzles and escape before time runs out? 
              Test your wits in our immersive themed rooms.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/rooms">
                <Button className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-14 px-8 rounded-xl text-lg animate-pulse-glow">
                  View Our Rooms
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" className="bg-transparent text-white border-white/20 hover:border-white/40 h-14 px-8 rounded-xl text-lg">
                  How It Works
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 rounded-full bg-white/50" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-accent)] mb-3">The Experience</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-6 stagger-children">
            <HowItWorksCard
              icon={Lock}
              title="You Are Locked In"
              description="When locked in the room, you and your partners will find clues. The trick is to figure out the sequence – it's the only way to escape."
              step={1}
            />
            <HowItWorksCard
              icon={Clock}
              title="The Clock Is Ticking"
              description="You have to collect items, identify clues, solve mysteries, and break puzzles within 60 minutes. Sounds long? Don't beg us for more."
              step={2}
            />
            <HowItWorksCard
              icon={Zap}
              title="Escape Quickly"
              description="Don't panic and keep calm. Focus on the sequence... oh, I forgot – someone might come after you, so escape quickly!"
              step={3}
            />
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-20 md:py-28 px-4 md:px-8 bg-[color:var(--bg-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-accent)] mb-3">Choose Your Challenge</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Featured Rooms</h2>
            </div>
            <Link to="/rooms">
              <Button variant="outline" className="bg-transparent text-white border-white/20 hover:border-[color:var(--brand-accent)] hover:text-[color:var(--brand-accent)] rounded-xl">
                View All Rooms
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 md:px-8 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-display text-4xl md:text-5xl font-bold text-[color:var(--brand-accent)]">9</p>
              <p className="text-sm text-[color:var(--text-muted)] mt-2">Unique Rooms</p>
            </div>
            <div>
              <p className="font-display text-4xl md:text-5xl font-bold text-[color:var(--brand-accent)]">72%</p>
              <p className="text-sm text-[color:var(--text-muted)] mt-2">Success Rate</p>
            </div>
            <div>
              <p className="font-display text-4xl md:text-5xl font-bold text-[color:var(--brand-accent)]">10K+</p>
              <p className="text-sm text-[color:var(--text-muted)] mt-2">Happy Escapers</p>
            </div>
            <div>
              <p className="font-display text-4xl md:text-5xl font-bold text-[color:var(--brand-accent)]">5.0</p>
              <p className="text-sm text-[color:var(--text-muted)] mt-2">Star Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-accent)] mb-3">Questions?</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Frequently Asked</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="rounded-2xl bg-[color:var(--bg-surface)] border border-white/10 px-6 data-[state=open]:border-[color:var(--brand-accent)]/30"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-white hover:text-[color:var(--brand-accent)] hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[color:var(--text-muted)] pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 px-4 md:px-8 bg-[color:var(--bg-surface)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Test Your Limits?
          </h2>
          <p className="text-lg text-[color:var(--text-secondary)] mb-10 max-w-2xl mx-auto">
            Don't worry, all our rooms are family friendly... we think. 
            Book your escape room adventure today!
          </p>
          <Link to="/rooms">
            <Button className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-14 px-10 rounded-xl text-lg">
              Book Your Escape
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
