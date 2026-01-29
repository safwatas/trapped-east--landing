import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
    Search,
    Filter,
    Eye,
    Phone,
    Mail,
    Building2,
    GraduationCap,
    Cake,
    Loader2,
    Calendar,
    Users,
    MessageSquare,
    ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { eventService } from '../../lib/eventService';
import { toast } from 'sonner';

const eventTypeIcons = {
    corporate: Building2,
    school: GraduationCap,
    birthday: Cake
};

const eventTypeLabels = {
    corporate: 'Corporate',
    school: 'School Trip',
    birthday: 'Birthday'
};

const statusColors = {
    'New': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Contacted': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Closed': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'Booked': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function AdminEvents() {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedLead, setSelectedLead] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    const loadLeads = useCallback(async () => {
        setIsLoading(true);
        try {
            const filters = {};
            if (typeFilter !== 'all') filters.eventType = typeFilter;
            if (statusFilter !== 'all') filters.status = statusFilter;

            const data = await eventService.getAllEventLeads(filters);
            setLeads(data);
        } catch (error) {
            console.error('Error loading event leads:', error);
            toast.error('Failed to load event leads');
        } finally {
            setIsLoading(false);
        }
    }, [typeFilter, statusFilter]);

    useEffect(() => {
        loadLeads();
    }, [loadLeads]);

    const handleStatusChange = async (leadId, newStatus) => {
        try {
            await eventService.updateEventLeadStatus(leadId, newStatus);
            setLeads(leads.map(l =>
                l.id === leadId ? { ...l, status: newStatus } : l
            ));
            if (selectedLead?.id === leadId) {
                setSelectedLead({ ...selectedLead, status: newStatus });
            }
            toast.success('Status updated');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedLead) return;

        setIsSavingNotes(true);
        try {
            await eventService.updateEventLeadNotes(selectedLead.id, notes);
            setLeads(leads.map(l =>
                l.id === selectedLead.id ? { ...l, internal_notes: notes } : l
            ));
            setSelectedLead({ ...selectedLead, internal_notes: notes });
            toast.success('Notes saved');
        } catch (error) {
            console.error('Error saving notes:', error);
            toast.error('Failed to save notes');
        } finally {
            setIsSavingNotes(false);
        }
    };

    const openLeadDetail = (lead) => {
        setSelectedLead(lead);
        setNotes(lead.internal_notes || '');
        setIsDetailOpen(true);
    };

    const filteredLeads = leads.filter(lead => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            lead.name?.toLowerCase().includes(query) ||
            lead.phone?.toLowerCase().includes(query) ||
            lead.email?.toLowerCase().includes(query) ||
            lead.form_payload?.companyName?.toLowerCase().includes(query) ||
            lead.form_payload?.schoolName?.toLowerCase().includes(query)
        );
    });

    const renderFormPayload = (payload) => {
        if (!payload) return null;

        return (
            <div className="space-y-3">
                {Object.entries(payload).map(([key, value]) => {
                    if (!value || key === 'phone' || key === 'email') return null;

                    const label = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase());

                    return (
                        <div key={key} className="flex justify-between text-sm">
                            <span className="text-[color:var(--text-muted)]">{label}</span>
                            <span className="text-white text-right max-w-[60%]">
                                {Array.isArray(value) ? value.join(', ') : String(value)}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold text-white">Event Leads</h1>
                    <p className="text-sm text-[color:var(--text-muted)]">
                        Manage corporate, school, and birthday event inquiries
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--text-muted)]" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, phone, email..."
                        className="pl-10 h-10 bg-black/30 border-white/10 text-white"
                    />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px] h-10 bg-black/30 border-white/10 text-white">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[color:var(--bg-elevated)] border-white/10">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="school">School Trip</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px] h-10 bg-black/30 border-white/10 text-white">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[color:var(--bg-elevated)] border-white/10">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Booked">Booked</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Leads Table */}
            <div className="rounded-xl bg-[color:var(--bg-surface)] border border-white/10 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[color:var(--brand-accent)] animate-spin" />
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="text-center py-20 text-[color:var(--text-muted)]">
                        No event leads found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left px-4 py-3 text-sm font-medium text-[color:var(--text-muted)]">Type</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-[color:var(--text-muted)]">Name</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-[color:var(--text-muted)]">Contact</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-[color:var(--text-muted)]">Date</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-[color:var(--text-muted)]">Status</th>
                                    <th className="text-right px-4 py-3 text-sm font-medium text-[color:var(--text-muted)]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map((lead) => {
                                    const Icon = eventTypeIcons[lead.event_type] || Building2;
                                    return (
                                        <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4 text-[color:var(--brand-accent)]" />
                                                    <span className="text-sm text-white">
                                                        {eventTypeLabels[lead.event_type]}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-white font-medium">{lead.name}</p>
                                                {lead.form_payload?.companyName && (
                                                    <p className="text-xs text-[color:var(--text-muted)]">
                                                        {lead.form_payload.companyName}
                                                    </p>
                                                )}
                                                {lead.form_payload?.schoolName && (
                                                    <p className="text-xs text-[color:var(--text-muted)]">
                                                        {lead.form_payload.schoolName}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="space-y-1">
                                                    <a
                                                        href={`tel:${lead.phone}`}
                                                        className="flex items-center gap-1 text-sm text-white hover:text-[color:var(--brand-accent)]"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        {lead.phone}
                                                    </a>
                                                    {lead.email && (
                                                        <a
                                                            href={`mailto:${lead.email}`}
                                                            className="flex items-center gap-1 text-xs text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)]"
                                                        >
                                                            <Mail className="w-3 h-3" />
                                                            {lead.email}
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-[color:var(--text-muted)]">
                                                    {format(new Date(lead.created_at), 'MMM d, yyyy')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="p-0 h-auto">
                                                            <Badge className={statusColors[lead.status]}>
                                                                {lead.status}
                                                                <ChevronDown className="w-3 h-3 ml-1" />
                                                            </Badge>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="bg-[color:var(--bg-elevated)] border-white/10">
                                                        {['New', 'Contacted', 'Booked', 'Closed', 'Cancelled'].map(status => (
                                                            <DropdownMenuItem
                                                                key={status}
                                                                onClick={() => handleStatusChange(lead.id, status)}
                                                                className="text-white hover:text-white hover:bg-white/10"
                                                            >
                                                                {status}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openLeadDetail(lead)}
                                                    className="text-[color:var(--text-muted)] hover:text-white"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Lead Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="bg-[color:var(--bg-elevated)] border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-display text-xl text-white flex items-center gap-2">
                            {selectedLead && (
                                <>
                                    {React.createElement(eventTypeIcons[selectedLead.event_type] || Building2, {
                                        className: "w-5 h-5 text-[color:var(--brand-accent)]"
                                    })}
                                    {eventTypeLabels[selectedLead.event_type]} Lead
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedLead && (
                        <div className="space-y-6 mt-4">
                            {/* Contact Info */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Contact Information
                                </h4>
                                <div className="p-4 rounded-xl bg-black/30 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[color:var(--text-muted)]">Name</span>
                                        <span className="text-sm text-white">{selectedLead.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[color:var(--text-muted)]">Phone</span>
                                        <a href={`tel:${selectedLead.phone}`} className="text-sm text-[color:var(--brand-accent)]">
                                            {selectedLead.phone}
                                        </a>
                                    </div>
                                    {selectedLead.email && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-[color:var(--text-muted)]">Email</span>
                                            <a href={`mailto:${selectedLead.email}`} className="text-sm text-[color:var(--brand-accent)]">
                                                {selectedLead.email}
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[color:var(--text-muted)]">Submitted</span>
                                        <span className="text-sm text-white">
                                            {format(new Date(selectedLead.created_at), 'MMM d, yyyy h:mm a')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Form Details */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Event Details
                                </h4>
                                <div className="p-4 rounded-xl bg-black/30">
                                    {renderFormPayload(selectedLead.form_payload)}
                                </div>
                            </div>

                            {/* Attribution */}
                            {(selectedLead.utm_source || selectedLead.utm_campaign) && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-white">Attribution</h4>
                                    <div className="p-4 rounded-xl bg-black/30 text-xs space-y-1">
                                        {selectedLead.utm_source && (
                                            <p className="text-[color:var(--text-muted)]">Source: {selectedLead.utm_source}</p>
                                        )}
                                        {selectedLead.utm_campaign && (
                                            <p className="text-[color:var(--text-muted)]">Campaign: {selectedLead.utm_campaign}</p>
                                        )}
                                        {selectedLead.utm_medium && (
                                            <p className="text-[color:var(--text-muted)]">Medium: {selectedLead.utm_medium}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Internal Notes
                                </h4>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add internal notes..."
                                    rows={4}
                                    className="bg-black/30 border-white/10 text-white placeholder:text-white/35"
                                />
                                <Button
                                    onClick={handleSaveNotes}
                                    disabled={isSavingNotes}
                                    className="w-full bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)]"
                                >
                                    {isSavingNotes ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Notes'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
