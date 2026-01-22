import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DoorOpen, Users, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { mockBookings, rooms } from '../../data/mock';

const StatCard = ({ title, value, icon: Icon, color, change }) => (
  <Card className="bg-[color:var(--bg-surface)] border-white/10">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[color:var(--text-muted)]">{title}</p>
          <p className="font-display text-3xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-2 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change > 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const pendingBookings = mockBookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = mockBookings.filter(b => b.status === 'confirmed').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-[color:var(--text-muted)] mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Bookings" 
          value={mockBookings.length}
          icon={Calendar}
          color="bg-[color:var(--brand-accent)]/10 text-[color:var(--brand-accent)]"
          change={12}
        />
        <StatCard 
          title="Pending" 
          value={pendingBookings}
          icon={Clock}
          color="bg-orange-500/10 text-orange-400"
        />
        <StatCard 
          title="Confirmed" 
          value={confirmedBookings}
          icon={CheckCircle}
          color="bg-green-500/10 text-green-400"
        />
        <StatCard 
          title="Active Rooms" 
          value={rooms.length}
          icon={DoorOpen}
          color="bg-blue-500/10 text-blue-400"
        />
      </div>

      {/* Recent Bookings */}
      <Card className="bg-[color:var(--bg-surface)] border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Recent Bookings</CardTitle>
          <Link to="/admin/bookings" className="text-sm text-[color:var(--brand-accent)] hover:underline">
            View All
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockBookings.slice(0, 5).map((booking) => (
              <div 
                key={booking.id}
                className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    booking.status === 'confirmed' ? 'bg-green-500/10' :
                    booking.status === 'pending' ? 'bg-orange-500/10' : 'bg-red-500/10'
                  }`}>
                    {booking.status === 'confirmed' ? <CheckCircle className="w-5 h-5 text-green-400" /> :
                     booking.status === 'pending' ? <Clock className="w-5 h-5 text-orange-400" /> :
                     <XCircle className="w-5 h-5 text-red-400" />}
                  </div>
                  <div>
                    <p className="font-medium text-white">{booking.customerName}</p>
                    <p className="text-sm text-[color:var(--text-muted)]">
                      {booking.roomName} • {booking.date} at {booking.timeSlot}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-semibold text-white">{booking.totalPrice} EGP</p>
                  <p className="text-xs text-[color:var(--text-muted)]">{booking.players} players</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-[color:var(--bg-surface)] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link 
              to="/admin/bookings"
              className="flex items-center gap-3 p-3 rounded-xl bg-black/20 hover:bg-black/30 transition-colors"
            >
              <Calendar className="w-5 h-5 text-[color:var(--brand-accent)]" />
              <span className="text-white">Manage Bookings</span>
            </Link>
            <Link 
              to="/admin/rooms"
              className="flex items-center gap-3 p-3 rounded-xl bg-black/20 hover:bg-black/30 transition-colors"
            >
              <DoorOpen className="w-5 h-5 text-[color:var(--brand-accent)]" />
              <span className="text-white">Edit Rooms</span>
            </Link>
            <Link 
              to="/admin/pricing"
              className="flex items-center gap-3 p-3 rounded-xl bg-black/20 hover:bg-black/30 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-[color:var(--brand-accent)]" />
              <span className="text-white">Update Pricing</span>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-[color:var(--bg-surface)] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Room Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rooms.slice(0, 4).map((room) => (
              <div key={room.id} className="flex items-center justify-between">
                <span className="text-[color:var(--text-secondary)]">{room.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-[color:var(--brand-accent)] rounded-full" 
                      style={{ width: `${Math.random() * 60 + 40}%` }}
                    />
                  </div>
                  <span className="text-xs text-[color:var(--text-muted)] w-8">
                    {Math.floor(Math.random() * 30 + 10)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
