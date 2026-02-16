import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search,
    Download,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    User,
    Copy,
    Check,
    Eye,
    ArrowUpDown,
    FileSpreadsheet,
    Target,
    RefreshCw,
    Info,
    Calendar,
    X,
    Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../../components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../../components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '../../components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '../../components/ui/tooltip';
import { toast } from 'sonner';
import {
    fetchCustomers,
    fetchAllCustomers,
    maskPhoneNumber,
    generateCustomerCSV,
    downloadCSV,
    getCustomerName,
    getCustomerPhone,
    getCustomerDisplayValue
} from '../../lib/externalCustomerService';
import {
    recordDailySnapshot,
    getIdRangeForDates,
    getAvailableDateRange,
    getMaxIdFromCustomers,
    filterCustomersByIdRange
} from '../../lib/customerIdTracker';

// Privacy disclaimer component
const PrivacyDisclaimer = () => (
    <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200/80 text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
            <strong className="text-amber-200">Privacy Notice:</strong> Customer data is for internal use only and must comply with data privacy laws. Do not share or distribute without proper authorization.
        </div>
    </div>
);

// Export dialog component
const ExportDialog = ({ open, onOpenChange, onExport, isExporting, exportProgress, activeFilters }) => {
    const [exportType, setExportType] = useState('filtered');
    const [metaFormat, setMetaFormat] = useState(false);

    const hasActiveFilters = activeFilters?.searchQuery || activeFilters?.dateFilterEnabled;

    const handleExport = () => {
        onExport({ exportAll: exportType === 'all', metaFormat });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[color:var(--bg-surface)] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl">Export Customer Data</DialogTitle>
                    <DialogDescription className="text-[color:var(--text-muted)]">
                        Choose export options for customer data
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Active filters indicator */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 p-3 bg-[color:var(--brand-accent)]/5 border border-[color:var(--brand-accent)]/20 rounded-xl">
                            <Filter className="w-4 h-4 text-[color:var(--brand-accent)]" />
                            <span className="text-sm text-[color:var(--text-muted)]">Active Filters:</span>
                            {activeFilters.searchQuery && (
                                <Badge className="bg-[color:var(--brand-accent)]/20 text-[color:var(--brand-accent)]">
                                    Search: "{activeFilters.searchQuery}"
                                </Badge>
                            )}
                            {activeFilters.dateFilterEnabled && activeFilters.fromDate && activeFilters.toDate && (
                                <Badge className="bg-blue-500/20 text-blue-300">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {activeFilters.fromDate} → {activeFilters.toDate}
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Export scope */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[color:var(--text-muted)]">Export Scope</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setExportType('filtered')}
                                className={`p-4 rounded-xl border transition-all text-left ${exportType === 'filtered'
                                    ? 'border-[color:var(--brand-accent)] bg-[color:var(--brand-accent)]/10'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <FileSpreadsheet className="w-5 h-5 mb-2 text-[color:var(--brand-accent)]" />
                                <p className="font-medium text-white">{hasActiveFilters ? 'Filtered Results' : 'Current Page'}</p>
                                <p className="text-xs text-[color:var(--text-muted)]">
                                    {hasActiveFilters ? 'Export results matching your filters' : 'Export visible results'}
                                </p>
                            </button>
                            <button
                                onClick={() => setExportType('all')}
                                className={`p-4 rounded-xl border transition-all text-left ${exportType === 'all'
                                    ? 'border-[color:var(--brand-accent)] bg-[color:var(--brand-accent)]/10'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <Download className="w-5 h-5 mb-2 text-[color:var(--brand-accent)]" />
                                <p className="font-medium text-white">All Results</p>
                                <p className="text-xs text-[color:var(--text-muted)]">
                                    {hasActiveFilters ? 'Fetch all matching filtered data' : 'Fetch all customer data'}
                                </p>
                            </button>
                        </div>
                    </div>

                    {/* Meta format option */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[color:var(--text-muted)]">Format</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setMetaFormat(false)}
                                className={`p-4 rounded-xl border transition-all text-left ${!metaFormat
                                    ? 'border-[color:var(--brand-accent)] bg-[color:var(--brand-accent)]/10'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <FileSpreadsheet className="w-5 h-5 mb-2 text-[color:var(--brand-accent)]" />
                                <p className="font-medium text-white">Standard CSV</p>
                                <p className="text-xs text-[color:var(--text-muted)]">All available fields</p>
                            </button>
                            <button
                                onClick={() => setMetaFormat(true)}
                                className={`p-4 rounded-xl border transition-all text-left ${metaFormat
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <Target className="w-5 h-5 mb-2 text-blue-400" />
                                <p className="font-medium text-white">Meta Ready</p>
                                <p className="text-xs text-[color:var(--text-muted)]">Custom Audiences format</p>
                            </button>
                        </div>
                    </div>

                    {/* Meta format info */}
                    {metaFormat && (
                        <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-200/80 text-sm">
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                                <strong>Meta Ads Custom Audiences:</strong> This format includes normalized phone numbers (E.164) and formatted fields. Upload this file manually to Meta Ads Manager → Custom Audiences.
                            </div>
                        </div>
                    )}

                    {/* Export progress */}
                    {isExporting && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[color:var(--text-muted)]">Fetching data...</span>
                                <span className="text-white">{exportProgress} records</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[color:var(--brand-accent)] animate-pulse" style={{ width: '100%' }} />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isExporting}
                        className="border-white/15 text-white hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-[color:var(--brand-accent)] text-black hover:opacity-90"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Customer row component with expand/collapse for phone reveal
const CustomerRow = ({ customer, discoveredFields }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const name = getCustomerName(customer);
    const phone = getCustomerPhone(customer);
    const displayPhone = isExpanded ? phone : maskPhoneNumber(phone);
    const customerId = customer.id || customer._id || '---';
    const countryCode = customer.countryCode || customer.country_code || '---';
    const dateOfBirth = customer.dateOfBirth || customer.date_of_birth || customer.dob || null;

    // Format date of birth if present
    const formattedDOB = dateOfBirth
        ? new Date(dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '---';

    const handleCopyPhone = async () => {
        if (phone) {
            await navigator.clipboard.writeText(phone);
            setCopied(true);
            toast.success('Phone number copied!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
            {/* ID Column */}
            <TableCell>
                <span className="font-mono text-xs text-[color:var(--text-muted)]">{customerId}</span>
            </TableCell>
            {/* Name Column */}
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[color:var(--brand-accent)]/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-[color:var(--brand-accent)]" />
                    </div>
                    <span className="font-medium text-white">{name || '---'}</span>
                </div>
            </TableCell>
            {/* Phone Column */}
            <TableCell>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-[color:var(--text-muted)]">{displayPhone}</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                    <Eye className="w-4 h-4 text-[color:var(--text-muted)]" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{isExpanded ? 'Hide phone' : 'Show full phone'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {isExpanded && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={handleCopyPhone}
                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-[color:var(--text-muted)]" />
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Copy phone number</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </TableCell>
            {/* Country Code Column */}
            <TableCell>
                <span className="text-[color:var(--text-muted)]">{countryCode}</span>
            </TableCell>
            {/* Date of Birth Column */}
            <TableCell>
                <span className="text-[color:var(--text-muted)]">{formattedDOB}</span>
            </TableCell>
        </TableRow>
    );
};

export default function AdminExternalCustomers() {
    // State
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState('id_desc');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [discoveredFields, setDiscoveredFields] = useState([]);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    // Date filter state
    const [dateFilterEnabled, setDateFilterEnabled] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [availableDateRange, setAvailableDateRange] = useState({ earliestDate: null, latestDate: null, totalSnapshots: 0 });
    const [dateFilterLoading, setDateFilterLoading] = useState(false);
    const [idRange, setIdRange] = useState({ minId: null, maxId: null });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPageNumber(1); // Reset to first page on new search
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load available date range on mount
    useEffect(() => {
        const loadDateRange = async () => {
            try {
                const result = await getAvailableDateRange();
                if (result.success) {
                    setAvailableDateRange(result);
                }
            } catch (err) {
                console.error('Failed to load date range:', err);
            }
        };
        loadDateRange();
    }, []);

    // Apply date filter when dates change
    useEffect(() => {
        const applyDateFilter = async () => {
            if (!dateFilterEnabled || !fromDate || !toDate) {
                setIdRange({ minId: null, maxId: null });
                setFilteredCustomers(customers);
                return;
            }

            setDateFilterLoading(true);
            try {
                const result = await getIdRangeForDates(fromDate, toDate);
                if (result.success) {
                    setIdRange({ minId: result.minId, maxId: result.maxId });
                    const filtered = filterCustomersByIdRange(customers, result.minId, result.maxId);
                    setFilteredCustomers(filtered);
                } else {
                    setFilteredCustomers(customers);
                }
            } catch (err) {
                console.error('Date filter error:', err);
                setFilteredCustomers(customers);
            } finally {
                setDateFilterLoading(false);
            }
        };
        applyDateFilter();
    }, [dateFilterEnabled, fromDate, toDate, customers]);

    // Check if search term is a numeric ID search
    const isIdSearch = useMemo(() => {
        const trimmed = debouncedSearch.trim();
        return trimmed.length > 0 && /^\d+$/.test(trimmed);
    }, [debouncedSearch]);

    // Check if we're using client-side ID sorting
    const isIdSort = sortBy === 'id_desc' || sortBy === 'id_asc';

    // Fetch customers
    const loadCustomers = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // When searching by ID, don't pass it as searchTerm to the API
            // (the external API doesn't support ID search) — we'll filter client-side
            const apiSearchTerm = isIdSearch ? '' : debouncedSearch;

            const result = await fetchCustomers({
                searchTerm: apiSearchTerm,
                pageSize: (dateFilterEnabled || isIdSearch || isIdSort) ? 100 : pageSize,
                pageNumber,
                sortBy
            });

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch customers');
            }

            // Handle the actual API response structure:
            // Our proxy returns: { success: true, data: { data: [...customers], totalRecords: X, ... } }
            let customerData = Array.isArray(result.data)
                ? result.data
                : (result.data?.data || result.data?.customers || result.data?.items || result.data?.records || []);

            // Apply client-side ID search if search term is numeric
            if (isIdSearch) {
                const searchId = parseInt(debouncedSearch.trim(), 10);
                customerData = customerData.filter(c => {
                    const cId = c.id || c._id;
                    if (typeof cId !== 'number') return false;
                    // Exact match or starts-with match (e.g. searching "518" matches 518, 5180, 51801)
                    return String(cId).includes(debouncedSearch.trim());
                });
            }

            // Apply client-side ID sorting
            if (isIdSort) {
                customerData = [...customerData].sort((a, b) => {
                    const idA = a.id || a._id || 0;
                    const idB = b.id || b._id || 0;
                    return sortBy === 'id_desc' ? idB - idA : idA - idB;
                });
            }

            setCustomers(customerData);
            setFilteredCustomers(customerData);
            setTotalCount(result.data?.totalRecords || result.data?.totalCount || result.data?.total || customerData.length);

            // Record today's snapshot with max ID
            if (customerData.length > 0) {
                const maxId = getMaxIdFromCustomers(customerData);
                // Also get the actual max from totalRecords if available
                const totalRecords = result.data?.totalRecords || result.data?.totalCount;
                if (maxId || totalRecords) {
                    recordDailySnapshot(maxId || totalRecords).catch(err => {
                        console.warn('Failed to record snapshot:', err);
                    });
                }
            }

            // Discover fields from response
            if (customerData.length > 0) {
                const fields = new Set();
                customerData.slice(0, 5).forEach(customer => {
                    Object.keys(customer || {}).forEach(key => fields.add(key));
                });

                // Filter out primary fields and id-like fields
                // Note: API uses firstName, lastName, phoneNumber (camelCase)
                const excludeFields = ['firstName', 'lastName', 'phoneNumber', 'firstname', 'lastname', 'phonenumber', 'phone', 'id', '_id', 'createdAt', 'updatedAt'];
                const additionalFields = Array.from(fields).filter(f => !excludeFields.includes(f));
                setDiscoveredFields(additionalFields);
            }
        } catch (err) {
            console.error('Error loading customers:', err);
            setError(err.message || 'Failed to load customers. Please try again.');
            setCustomers([]);
            setFilteredCustomers([]);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, pageSize, pageNumber, sortBy, dateFilterEnabled, isIdSearch, isIdSort]);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    // Clear date filter
    const clearDateFilter = () => {
        setDateFilterEnabled(false);
        setFromDate('');
        setToDate('');
        setIdRange({ minId: null, maxId: null });
    };

    // Export handler — always respects active filters
    const handleExport = async ({ exportAll, metaFormat }) => {
        setIsExporting(true);
        setExportProgress(0);

        try {
            let dataToExport;

            if (exportAll) {
                // Fetch ALL data from the API, respecting the current search query
                let allData = await fetchAllCustomers({
                    searchTerm: debouncedSearch,
                    sortBy,
                    onProgress: (current) => setExportProgress(current)
                });

                // Apply date filter to exported data if active
                if (dateFilterEnabled && idRange.minId !== null && idRange.maxId !== null) {
                    allData = filterCustomersByIdRange(allData, idRange.minId, idRange.maxId);
                }
                dataToExport = allData;
            } else {
                // "Filtered Results" / "Current Page" — export exactly what's displayed
                // displayCustomers is already filtered by date range + search
                dataToExport = displayCustomers;
            }

            if (dataToExport.length === 0) {
                toast.error('No data to export matching your current filters');
                return;
            }

            const csvContent = generateCustomerCSV(dataToExport, { metaFormat });
            const dateStr = new Date().toISOString().split('T')[0];
            const suffix = metaFormat ? '_meta' : '';
            const searchSuffix = debouncedSearch ? `_search-${debouncedSearch.replace(/\s+/g, '_').substring(0, 20)}` : '';
            const dateRangeSuffix = dateFilterEnabled && fromDate && toDate ? `_${fromDate}_to_${toDate}` : '';
            downloadCSV(csvContent, `customers${suffix}${searchSuffix}${dateRangeSuffix}_${dateStr}`);

            toast.success(`Exported ${dataToExport.length} customers${debouncedSearch ? ` matching "${debouncedSearch}"` : ''}${dateFilterEnabled ? ` (${fromDate} → ${toDate})` : ''}`);
            setIsExportOpen(false);
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
            setExportProgress(0);
        }
    };

    // Pagination
    const totalPages = Math.ceil(totalCount / pageSize);
    const canGoBack = pageNumber > 1;
    const canGoForward = pageNumber < totalPages;

    // Determine which customers to display
    const displayCustomers = dateFilterEnabled ? filteredCustomers : customers;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-white">Customer Explorer</h1>
                    <p className="text-[color:var(--text-muted)] mt-1">
                        Browse and export customer data from the external system
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={loadCustomers}
                        disabled={isLoading}
                        className="border-white/15 text-white hover:bg-white/5"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => setIsExportOpen(true)}
                        disabled={displayCustomers.length === 0}
                        className="bg-[color:var(--brand-accent)] text-black hover:opacity-90"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Privacy Disclaimer */}
            <PrivacyDisclaimer />

            {/* Filters */}
            <Card className="bg-[color:var(--bg-surface)] border-white/10">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--text-muted)]" />
                            <Input
                                placeholder="Search by name, phone, or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11 rounded-xl bg-black/30 border-white/10 text-white"
                            />
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-[color:var(--text-muted)]" />
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[160px] h-11 rounded-xl bg-black/30 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[color:var(--bg-surface)] border-white/10">
                                    <SelectItem value="id_desc">ID (Newest)</SelectItem>
                                    <SelectItem value="id_asc">ID (Oldest)</SelectItem>
                                    <SelectItem value="newest">Name (Z→A)</SelectItem>
                                    <SelectItem value="oldest">Name (A→Z)</SelectItem>
                                    <SelectItem value="name">By Name</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setDateFilterEnabled(!dateFilterEnabled)}
                                    className={`p-2 rounded-lg transition-all ${dateFilterEnabled
                                        ? 'bg-[color:var(--brand-accent)] text-black'
                                        : 'bg-white/5 text-[color:var(--text-muted)] hover:bg-white/10'
                                        }`}
                                >
                                    <Calendar className="w-5 h-5" />
                                </button>
                                <span className="text-sm text-[color:var(--text-muted)]">
                                    Date Filter {dateFilterEnabled ? 'On' : 'Off'}
                                </span>
                            </div>

                            {dateFilterEnabled && (
                                <>
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="space-y-1">
                                            <label className="text-xs text-[color:var(--text-muted)]">From Date</label>
                                            <Input
                                                type="date"
                                                value={fromDate}
                                                onChange={(e) => setFromDate(e.target.value)}
                                                max={toDate || undefined}
                                                className="h-10 rounded-lg bg-black/30 border-white/10 text-white"
                                            />
                                        </div>
                                        <span className="text-[color:var(--text-muted)] mt-5">→</span>
                                        <div className="space-y-1">
                                            <label className="text-xs text-[color:var(--text-muted)]">To Date</label>
                                            <Input
                                                type="date"
                                                value={toDate}
                                                onChange={(e) => setToDate(e.target.value)}
                                                min={fromDate || undefined}
                                                max={new Date().toISOString().split('T')[0]}
                                                className="h-10 rounded-lg bg-black/30 border-white/10 text-white"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearDateFilter}
                                        className="text-[color:var(--text-muted)] hover:text-white"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Clear
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Date filter info */}
                        {dateFilterEnabled && (
                            <div className="mt-3 flex items-start gap-2 text-xs text-[color:var(--text-muted)]">
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <div>
                                    {availableDateRange.totalSnapshots > 0 ? (
                                        <span>
                                            Data available from <strong className="text-white">{availableDateRange.earliestDate}</strong> to <strong className="text-white">{availableDateRange.latestDate}</strong> ({availableDateRange.totalSnapshots} days recorded)
                                        </span>
                                    ) : (
                                        <span>
                                            No date snapshots recorded yet. Keep using Customer Explorer daily to build date tracking.
                                            Today's data will be recorded automatically.
                                        </span>
                                    )}
                                    {dateFilterLoading && <Loader2 className="inline w-3 h-3 ml-2 animate-spin" />}
                                </div>
                            </div>
                        )}

                        {/* Active date filter indicator */}
                        {dateFilterEnabled && fromDate && toDate && idRange.maxId !== null && (
                            <div className="mt-2 flex items-center gap-2">
                                <Badge className="bg-blue-500/20 text-blue-300">
                                    <Filter className="w-3 h-3 mr-1" />
                                    Filtering: {fromDate} → {toDate}
                                </Badge>
                                <Badge variant="outline" className="text-[color:var(--text-muted)] border-white/10">
                                    ID Range: {idRange.minId || 0} - {idRange.maxId}
                                </Badge>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Results summary */}
            {!isLoading && !error && (
                <div className="flex items-center gap-2 text-sm text-[color:var(--text-muted)]">
                    <span>Showing</span>
                    <Badge variant="outline" className="text-white border-white/20">
                        {displayCustomers.length}
                    </Badge>
                    {totalCount > 0 && (
                        <>
                            <span>of</span>
                            <Badge variant="outline" className="text-white border-white/20">
                                {totalCount}
                            </Badge>
                        </>
                    )}
                    <span>customers</span>
                    {debouncedSearch && (
                        <>
                            <span>matching</span>
                            <Badge className="bg-[color:var(--brand-accent)]/20 text-[color:var(--brand-accent)]">
                                "{debouncedSearch}"
                            </Badge>
                        </>
                    )}
                </div>
            )}

            {/* Customer Table */}
            <Card className="bg-[color:var(--bg-surface)] border-white/10 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 text-[color:var(--brand-accent)] animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                        <h3 className="font-display text-lg font-semibold text-white mb-2">Unable to Load Customers</h3>
                        <p className="text-[color:var(--text-muted)] mb-4">{error}</p>
                        <Button
                            variant="outline"
                            onClick={loadCustomers}
                            className="border-white/15 text-white hover:bg-white/5"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </div>
                ) : displayCustomers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <User className="w-12 h-12 text-[color:var(--text-muted)] mb-4" />
                        <h3 className="font-display text-lg font-semibold text-white mb-2">No Customers Found</h3>
                        <p className="text-[color:var(--text-muted)]">
                            {debouncedSearch
                                ? 'Try adjusting your search terms'
                                : 'No customer data available'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-[color:var(--text-muted)] w-20">ID</TableHead>
                                    <TableHead className="text-[color:var(--text-muted)]">Name</TableHead>
                                    <TableHead className="text-[color:var(--text-muted)]">Phone</TableHead>
                                    <TableHead className="text-[color:var(--text-muted)]">Country Code</TableHead>
                                    <TableHead className="text-[color:var(--text-muted)]">Date of Birth</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayCustomers.map((customer, index) => (
                                    <CustomerRow
                                        key={customer.id || customer._id || index}
                                        customer={customer}
                                        discoveredFields={discoveredFields}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && !error && displayCustomers.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                        <p className="text-sm text-[color:var(--text-muted)]">
                            Page {pageNumber} of {Math.max(1, totalPages)}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                                disabled={!canGoBack}
                                className="border-white/15 text-white hover:bg-white/5 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPageNumber(p => p + 1)}
                                disabled={!canGoForward}
                                className="border-white/15 text-white hover:bg-white/5 disabled:opacity-50"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Discovered Fields Info */}
            {discoveredFields.length > 0 && (
                <Card className="bg-[color:var(--bg-surface)] border-white/10">
                    <CardHeader>
                        <CardTitle className="font-display text-lg text-white flex items-center gap-2">
                            <Info className="w-5 h-5 text-[color:var(--brand-accent)]" />
                            Discovered Customer Fields
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            <Badge className="bg-white/10 text-white">firstname</Badge>
                            <Badge className="bg-white/10 text-white">lastname</Badge>
                            <Badge className="bg-white/10 text-white">phonenumber</Badge>
                            {discoveredFields.map(field => (
                                <Badge key={field} className="bg-white/10 text-white">{field}</Badge>
                            ))}
                        </div>
                        <p className="text-xs text-[color:var(--text-muted)] mt-3">
                            These fields were discovered from the API response. All fields are included in the standard CSV export.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Export Dialog */}
            <ExportDialog
                open={isExportOpen}
                onOpenChange={setIsExportOpen}
                onExport={handleExport}
                isExporting={isExporting}
                exportProgress={exportProgress}
                activeFilters={{
                    searchQuery: debouncedSearch,
                    dateFilterEnabled,
                    fromDate,
                    toDate,
                    sortBy
                }}
            />
        </div>
    );
}
