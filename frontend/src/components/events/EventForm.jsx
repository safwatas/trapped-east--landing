import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { eventService } from '../../lib/eventService';
import { analytics } from '../../lib/analytics';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get translated options for select/multiselect fields
 * Maps field name to translation key path
 */
const getTranslatedOptions = (field, eventType, t) => {
    if (!field.options || !Array.isArray(field.options)) return [];

    // Map field names to their translation paths
    const optionKeyMap = {
        teamSize: 'eventForms.corporate.teamSizeOptions',
        preferredTime: 'eventForms.corporate.preferredTimeOptions',
        activityType: 'eventForms.corporate.activityTypeOptions',
        budget: 'eventForms.corporate.budgetOptions',
        gradeLevel: 'eventForms.school.gradeLevelOptions',
        studentCount: 'eventForms.school.studentCountOptions',
        guestCount: 'eventForms.birthday.guestCountOptions',
        partyPackage: 'eventForms.birthday.partyPackageOptions',
        additionalServices: 'eventForms.birthday.additionalServicesOptions'
    };

    const translationPath = optionKeyMap[field.name];

    return field.options.map(opt => {
        if (!opt || typeof opt !== 'object') return null;
        const value = String(opt.value || 'unknown');
        // Try to get translated label, fall back to original
        const translatedLabel = translationPath ? t(`${translationPath}.${value}`, opt.label) : opt.label;
        return {
            value,
            label: translatedLabel || opt.label || value
        };
    }).filter(Boolean);
};

/**
 * Get translated field label
 */
const getFieldLabel = (field, eventType, t) => {
    // Common fields
    const commonFields = {
        phone: 'eventForms.common.phone',
        email: 'eventForms.common.email',
        preferredDate: 'eventForms.common.preferredDate',
        alternateDate: 'eventForms.common.alternateDate',
        additionalNotes: 'eventForms.common.additionalNotes'
    };

    // Event-specific fields
    const eventFields = {
        corporate: {
            companyName: 'eventForms.corporate.companyName',
            contactPerson: 'eventForms.corporate.contactPerson',
            teamSize: 'eventForms.corporate.teamSize',
            preferredTime: 'eventForms.corporate.preferredTime',
            activityType: 'eventForms.corporate.activityType',
            budget: 'eventForms.corporate.budget'
        },
        school: {
            schoolName: 'eventForms.school.schoolName',
            coordinatorName: 'eventForms.school.coordinatorName',
            gradeLevel: 'eventForms.school.gradeLevel',
            studentCount: 'eventForms.school.studentCount',
            chaperoneCount: 'eventForms.school.chaperoneCount'
        },
        birthday: {
            parentName: 'eventForms.birthday.parentName',
            childName: 'eventForms.birthday.childName',
            childAge: 'eventForms.birthday.childAge',
            guestCount: 'eventForms.birthday.guestCount',
            partyPackage: 'eventForms.birthday.partyPackage',
            partyDate: 'eventForms.birthday.partyDate',
            additionalServices: 'eventForms.birthday.additionalServices'
        }
    };

    // Check common fields first
    if (commonFields[field.name]) {
        return t(commonFields[field.name], field.label);
    }

    // Then event-specific
    if (eventFields[eventType] && eventFields[eventType][field.name]) {
        return t(eventFields[eventType][field.name], field.label);
    }

    // Fallback to original label
    return field.label || field.name;
};

/**
 * Get translated placeholder
 */
const getFieldPlaceholder = (field, eventType, t) => {
    const placeholderMap = {
        phone: 'eventForms.common.phonePlaceholder',
        email: 'eventForms.common.emailPlaceholder',
        additionalNotes: 'eventForms.common.additionalNotesPlaceholder',
        companyName: 'eventForms.corporate.companyNamePlaceholder',
        contactPerson: 'eventForms.corporate.contactPersonPlaceholder',
        schoolName: 'eventForms.school.schoolNamePlaceholder',
        coordinatorName: 'eventForms.school.coordinatorNamePlaceholder',
        parentName: 'eventForms.birthday.parentNamePlaceholder',
        childName: 'eventForms.birthday.childNamePlaceholder',
        childAge: 'eventForms.birthday.childAgePlaceholder'
    };

    if (placeholderMap[field.name]) {
        return t(placeholderMap[field.name], field.placeholder || '');
    }

    return field.placeholder || '';
};

/**
 * Initialize form data from config fields
 */
const initializeFormData = (fields) => {
    if (!fields || !Array.isArray(fields)) return {};

    const initialData = {};
    fields.forEach(field => {
        if (!field || !field.name) return;

        switch (field.type) {
            case 'multiselect':
                initialData[field.name] = [];
                break;
            case 'select':
            case 'number':
            default:
                initialData[field.name] = '';
        }
    });
    return initialData;
};

export default function EventForm({ eventType, config, onSuccess }) {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();

    // Initialize form data with proper defaults
    const initialFormData = useMemo(() =>
        initializeFormData(config?.fields),
        [config?.fields]
    );

    const [formData, setFormData] = useState(initialFormData);
    const [multiSelectValues, setMultiSelectValues] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [submittedRefId, setSubmittedRefId] = useState(null);
    const [errors, setErrors] = useState({});

    // Defensive check - ensure config exists
    if (!config || !config.fields || !Array.isArray(config.fields)) {
        return (
            <div className="text-center py-12 px-6">
                <div className="flex items-center justify-center gap-2 text-red-400 mb-4">
                    <AlertCircle className="w-5 h-5" />
                    <span>{t('eventForms.errors.configMissing')}</span>
                </div>
                <p className="text-[color:var(--text-muted)]">{t('eventForms.errors.contactSupport')}</p>
            </div>
        );
    }

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleMultiSelectChange = (fieldName, optionValue, checked) => {
        setMultiSelectValues(prev => {
            const current = prev[fieldName] || [];
            if (checked) {
                return { ...prev, [fieldName]: [...current, optionValue] };
            } else {
                return { ...prev, [fieldName]: current.filter(v => v !== optionValue) };
            }
        });
    };

    const validateForm = () => {
        const newErrors = {};

        config.fields.forEach(field => {
            if (!field || !field.name) return;

            if (field.required) {
                const value = formData[field.name];
                if (!value || (typeof value === 'string' && !value.trim())) {
                    const label = getFieldLabel(field, eventType, t);
                    newErrors[field.name] = t('eventForms.errors.required', { field: label });
                }
            }

            // Email validation
            if (field.type === 'email' && formData[field.name]) {
                const emailValue = String(formData[field.name] || '').trim();
                if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
                    newErrors[field.name] = t('eventForms.errors.invalidEmail');
                }
            }

            // Phone validation
            if (field.type === 'tel' && formData[field.name]) {
                const phoneValue = String(formData[field.name] || '').replace(/\s/g, '');
                if (phoneValue && !/^\+?[0-9]{10,15}$/.test(phoneValue)) {
                    newErrors[field.name] = t('eventForms.errors.invalidPhone');
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const eventId = uuidv4();

            // Build form payload
            const fullFormData = {
                ...Object.fromEntries(
                    Object.entries(formData).map(([k, v]) => [k, v !== undefined && v !== null ? v : ''])
                ),
                ...Object.fromEntries(
                    Object.entries(multiSelectValues).map(([k, v]) => [k, Array.isArray(v) ? v : []])
                )
            };

            // Extract name and phone from form data
            const nameField = config?.fields?.find(f =>
                f.name === 'contactPerson' ||
                f.name === 'coordinatorName' ||
                f.name === 'parentName'
            );
            const name = (nameField?.name && formData[nameField.name]) || formData.name || '';
            const phone = formData.phone || '';

            if (!phone) {
                throw new Error('Phone number is required');
            }

            // Extract structured fields
            const preferredDate = formData.preferredDate || formData.partyDate || formData.alternateDate || null;
            const preferredTime = formData.preferredTime || null;
            const groupSize = formData.teamSize || formData.studentCount || formData.guestCount || null;

            // Remove extracted fields from payload
            const excludeFields = ['phone', 'email', 'preferredDate', 'partyDate', 'alternateDate', 'preferredTime', 'teamSize', 'studentCount', 'guestCount'];
            const formPayload = Object.fromEntries(
                Object.entries(fullFormData).filter(([key]) => !excludeFields.includes(key))
            );
            if (nameField?.name) {
                delete formPayload[nameField.name];
            }

            const result = await eventService.submitEventLead({
                eventType: eventType || 'unknown',
                name: name || 'Not provided',
                phone: phone,
                email: formData.email || null,
                branch: 'New Cairo',
                preferredDate,
                preferredTime,
                groupSize,
                formPayload: formPayload || {},
                language: i18n.language, // Add language to lead data
                utmSource: searchParams.get('utm_source') || null,
                utmCampaign: searchParams.get('utm_campaign') || null,
                utmMedium: searchParams.get('utm_medium') || null,
                utmContent: searchParams.get('utm_content') || null,
                fbclid: searchParams.get('fbclid') || null,
                eventId
            });

            if (result?.id) {
                console.log('[EventForm] ✅ Lead submitted successfully:', {
                    rowId: result.id,
                    eventId,
                    eventType,
                    phone,
                    language: i18n.language
                });
                setSubmittedRefId(result.id);
            }

            // Track submission with language
            if (analytics && analytics.track) {
                analytics.track('SubmitEventLead', {
                    event_type: eventType || 'unknown',
                    branch: 'New Cairo',
                    group_size: groupSize,
                    event_id: eventId,
                    language: i18n.language
                });
            }

            setSubmitStatus('success');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Event lead submission error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitStatus === 'success') {
        return (
            <div className="text-center py-12 px-6">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">
                    {t('eventForms.success.title')}
                </h3>
                <p className="text-[color:var(--text-muted)] max-w-md mx-auto">
                    {t('eventForms.success.message')}
                </p>
                {submittedRefId && process.env.NODE_ENV === 'development' && (
                    <p className="text-xs text-[color:var(--text-muted)] mt-4 font-mono">
                        Ref: {submittedRefId}
                    </p>
                )}
            </div>
        );
    }

    const renderField = (field) => {
        if (!field || !field.name || !field.type) {
            return (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 inline mr-2 rtl:mr-0 rtl:ml-2" />
                    {t('eventForms.errors.configMissing')}
                </div>
            );
        }

        const placeholder = getFieldPlaceholder(field, eventType, t);

        switch (field.type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'number':
                return (
                    <Input
                        type={field.type}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={placeholder}
                        min={field.min}
                        max={field.max}
                        className={`h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/35 ${errors[field.name] ? 'border-red-500' : ''}`}
                    />
                );

            case 'date':
                return (
                    <Input
                        type="date"
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`h-12 rounded-xl bg-black/30 border-white/10 text-white ${errors[field.name] ? 'border-red-500' : ''}`}
                        style={{ colorScheme: 'dark' }}
                    />
                );

            case 'select': {
                const safeOptions = getTranslatedOptions(field, eventType, t);

                if (safeOptions.length === 0) {
                    return (
                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
                            No options configured for this field
                        </div>
                    );
                }

                return (
                    <Select
                        value={formData[field.name] || ''}
                        onValueChange={(value) => handleChange(field.name, value)}
                    >
                        <SelectTrigger className={`h-12 rounded-xl bg-black/30 border-white/10 text-white ${errors[field.name] ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder={t('eventForms.common.selectOption')} />
                        </SelectTrigger>
                        <SelectContent className="bg-[color:var(--bg-elevated)] border-white/10">
                            {safeOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="text-white"
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            }

            case 'multiselect': {
                const safeOptions = getTranslatedOptions(field, eventType, t);

                if (safeOptions.length === 0) {
                    return (
                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
                            No options configured for this field
                        </div>
                    );
                }

                return (
                    <div className="space-y-2">
                        {safeOptions.map((option) => (
                            <div key={option.value} className="flex items-center gap-3">
                                <Checkbox
                                    id={`${field.name}-${option.value}`}
                                    checked={(multiSelectValues[field.name] || []).includes(option.value)}
                                    onCheckedChange={(checked) =>
                                        handleMultiSelectChange(field.name, option.value, checked)
                                    }
                                    className="border-white/30 data-[state=checked]:bg-[color:var(--brand-accent)] data-[state=checked]:border-[color:var(--brand-accent)]"
                                />
                                <label
                                    htmlFor={`${field.name}-${option.value}`}
                                    className="text-sm text-[color:var(--text-secondary)] cursor-pointer"
                                >
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                );
            }

            case 'textarea':
                return (
                    <Textarea
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={placeholder}
                        rows={4}
                        className={`rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/35 resize-none ${errors[field.name] ? 'border-red-500' : ''}`}
                    />
                );

            default:
                return (
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
                        <AlertCircle className="w-4 h-4 inline mr-2 rtl:mr-0 rtl:ml-2" />
                        Unknown field type: {field.type}
                    </div>
                );
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {config.fields.map((field, index) => {
                if (!field || !field.name) return null;
                const label = getFieldLabel(field, eventType, t);

                return (
                    <div key={field.name || index} className="space-y-2">
                        <Label className="text-white flex items-center gap-1">
                            {label}
                            {field.required && <span className="text-red-400">*</span>}
                        </Label>
                        {renderField(field)}
                        {errors[field.name] && (
                            <p className="text-sm text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors[field.name]}
                            </p>
                        )}
                    </div>
                );
            })}

            {submitStatus === 'error' && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {t('eventForms.errors.submitFailed')}
                </div>
            )}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-14 rounded-xl text-lg mt-6 ltr-flex"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2 rtl:mr-0 rtl:ml-2" />
                        {t('eventForms.common.submitting')}
                    </>
                ) : (
                    t('eventForms.common.submit')
                )}
            </Button>
        </form>
    );
}
