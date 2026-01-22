import React, { useState } from 'react';
import { Search, Phone, MessageCircle, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { mockBookings } from '../../data/mock';

export default function AdminCustomers() {
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique customers from bookings
  const customers = mockBookings.reduce((acc, booking) => {
    const existing = acc.find(c => c.phone === booking.customerPhone);
    if (existing) {
      existing.bookings += 1;
      existing.totalSpent += booking.totalPrice;
    } else {
      acc.push({
        name: booking.customerName,
        phone: booking.customerPhone,
        email: booking.customerEmail,
        bookings: 1,
        totalSpent: booking.totalPrice,
        lastBooking: booking.date
      });
    }
    return acc;
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Customers</h1>
        <p className="text-[color:var(--text-muted)] mt-1">View customer information and booking history</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--text-muted)]" />
        <Input
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-black/30 border-white/10 text-white"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer, index) => (
          <Card key={index} className="bg-[color:var(--bg-surface)] border-white/10">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[color:var(--brand-accent)]/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-[color:var(--brand-accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-white truncate">{customer.name}</h3>
                  <p className="text-sm text-[color:var(--text-muted)] truncate">{customer.phone}</p>
                  {customer.email && (
                    <p className="text-sm text-[color:var(--text-muted)] truncate">{customer.email}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[color:var(--text-muted)]">Bookings</p>
                  <p className="font-display text-lg font-semibold text-white">{customer.bookings}</p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--text-muted)]">Total Spent</p>
                  <p className="font-display text-lg font-semibold text-[color:var(--brand-accent)]">{customer.totalSpent} EGP</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <a href={`tel:${customer.phone}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full border-white/15 text-white hover:border-[color:var(--brand-accent)] hover:text-[color:var(--brand-accent)]">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </a>
                <a href={`https://wa.me/${customer.phone.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full border-white/15 text-white hover:border-green-500 hover:text-green-400">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[color:var(--text-muted)]">No customers found</p>
        </div>
      )}
    </div>
  );
}
