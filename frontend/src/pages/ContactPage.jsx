import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { branchInfo } from '../data/mock';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-base)]">
      <Navbar />

      {/* Header */}
      <section className="pt-8 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-accent)] mb-3">Get in Touch</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-[color:var(--text-secondary)] max-w-2xl">
            Have questions or need assistance? We're here to help!
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Options */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-semibold text-white">Direct Contact</h2>
              
              {/* Phone */}
              <a 
                href={`tel:${branchInfo.phone}`}
                className="flex items-center gap-4 p-6 rounded-2xl bg-[color:var(--bg-surface)] border border-white/10 hover:border-[color:var(--brand-accent)]/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-[color:var(--brand-accent)]/10 flex items-center justify-center group-hover:bg-[color:var(--brand-accent)]/20 transition-colors">
                  <Phone className="w-6 h-6 text-[color:var(--brand-accent)]" />
                </div>
                <div>
                  <p className="text-sm text-[color:var(--text-muted)] mb-1">Call Us</p>
                  <p className="font-display text-lg font-semibold text-white">{branchInfo.phone}</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a 
                href={`https://wa.me/${branchInfo.whatsapp.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 rounded-2xl bg-[color:var(--bg-surface)] border border-white/10 hover:border-green-500/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <MessageCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-[color:var(--text-muted)] mb-1">WhatsApp</p>
                  <p className="font-display text-lg font-semibold text-white">Message Us</p>
                </div>
              </a>

              {/* Email */}
              <a 
                href={`mailto:${branchInfo.email}`}
                className="flex items-center gap-4 p-6 rounded-2xl bg-[color:var(--bg-surface)] border border-white/10 hover:border-blue-500/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-[color:var(--text-muted)] mb-1">Email</p>
                  <p className="font-display text-lg font-semibold text-white">{branchInfo.email}</p>
                </div>
              </a>

              {/* Response Time */}
              <div className="p-4 rounded-xl bg-[color:var(--brand-accent)]/10 border border-[color:var(--brand-accent)]/30">
                <p className="text-sm text-[color:var(--brand-accent)]">
                  ⚡ We typically respond within 30 minutes during opening hours
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="font-display text-2xl font-semibold text-white mb-6">Send a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-white">Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    required
                    className="h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/35"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                    className="h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/35"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Phone (Optional)</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+20 1XX XXX XXXX"
                    className="h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/35"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Message *</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you?"
                    required
                    rows={5}
                    className="rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/35 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-12 rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      Send Message
                      <Send className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
