import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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

export default function EventForm({ eventType, config, onSuccess }) {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({});
    const [multiSelectValues, setMultiSelectValues] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
    const [errors, setErrors] = useState({});

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
            if (field.required) {
                const value = formData[field.name];
                if (!value || (typeof value === 'string' && !value.trim())) {
                    newErrors[field.name] = `${field.label} is required`;
                }
            }

            // Email validation
            if (field.type === 'email' && formData[field.name]) {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field.name])) {
                    newErrors[field.name] = 'Please enter a valid email';
                }
            }

            // Phone validation
            if (field.type === 'tel' && formData[field.name]) {
                if (!/^\+?[0-9\s]{10,15}$/.test(formData[field.name].replace(/\s/g, ''))) {
                    newErrors[field.name] = 'Please enter a valid phone number';
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

            // Build form payload with all answers
            const formPayload = {
                ...formData,
                ...Object.fromEntries(
                    Object.entries(multiSelectValues).map(([k, v]) => [k, v])
                )
            };

            // Extract name and phone from form data
            const nameField = config.fields.find(f =>
                f.name === 'contactPerson' ||
                f.name === 'coordinatorName' ||
                f.name === 'parentName'
            );
            const name = formData[nameField?.name] || formData.name || '';

            await eventService.submitEventLead({
                eventType,
                name,
                phone: formData.phone,
                email: formData.email,
                branch: 'New Cairo',
                formPayload,
                utmSource: searchParams.get('utm_source'),
                utmCampaign: searchParams.get('utm_campaign'),
                utmMedium: searchParams.get('utm_medium'),
                utmContent: searchParams.get('utm_content'),
                fbclid: searchParams.get('fbclid'),
                eventId
            });

            // Track submission
            analytics.track('SubmitEventLead', {
                event_type: eventType,
                branch: 'New Cairo',
                group_size: formData.teamSize || formData.studentCount || formData.guestCount,
                event_id: eventId
            });

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
                    Thank You!
                </h3>
                <p className="text-[color:var(--text-muted)] max-w-md mx-auto">
                    Our team will contact you shortly by phone or WhatsApp to discuss your event details.
                </p>
            </div>
        );
    }

    const renderField = (field) => {
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
                        placeholder={field.placeholder}
                        min={field.min}
                        max={field.max}
                        className={`h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/35 ${errors[field.name] ? 'border-red-500' : ''
                            }`}
                    />
                );

            case 'date':
                return (
                    <Input
                        type="date"
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`h-12 rounded-xl bg-black/30 border-white/10 text-white ${errors[field.name] ? 'border-red-500' : ''
                            }`}
                    />
                );

            case 'select':
                return (
                    <Select
                        value={formData[field.name] || ''}
                        onValueChange={(value) => handleChange(field.name, value)}
                    >
                        <SelectTrigger className={`h-12 rounded-xl bg-black/30 border-white/10 text-white ${errors[field.name] ? 'border-red-500' : ''
                            }`}>
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-[color:var(--bg-elevated)] border-white/10">
                            {field.options.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="text-white">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'multiselect':
                return (
                    <div className="space-y-2">
                        {field.options.map((option) => (
                            <div key={option.value} className="flex items-center space-x-3">
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

            case 'textarea':
                return (
                    <Textarea
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className={`rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/35 resize-none ${errors[field.name] ? 'border-red-500' : ''
                            }`}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {config.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                    <Label className="text-white flex items-center gap-1">
                        {field.label}
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
            ))}

            {submitStatus === 'error' && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    Something went wrong. Please try again or contact us directly.
                </div>
            )}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-14 rounded-xl text-lg mt-6"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Submitting...
                    </>
                ) : (
                    'Submit Request'
                )}
            </Button>
        </form>
    );
}
