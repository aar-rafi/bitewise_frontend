import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';

interface DateTimePickerProps {
    value: string; // ISO string
    onChange: (isoString: string) => void;
    placeholder?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, placeholder = "Select date and time" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [hours, setHours] = useState('12');
    const [minutes, setMinutes] = useState('00');
    const [ampm, setAmpm] = useState<'AM' | 'PM'>('PM');

    // Initialize values from the prop
    useEffect(() => {
        if (value && value.trim() !== '') {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                setSelectedDate(date);
                
                // Extract time components
                let hour = date.getHours();
                const minute = date.getMinutes();
                const isAM = hour < 12;
                
                // Convert to 12-hour format
                if (hour === 0) hour = 12;
                else if (hour > 12) hour = hour - 12;
                
                setHours(hour.toString().padStart(2, '0'));
                setMinutes(minute.toString().padStart(2, '0'));
                setAmpm(isAM ? 'AM' : 'PM');
            }
        } else {
            setSelectedDate(undefined);
            setHours('12');
            setMinutes('00');
            setAmpm('PM');
        }
    }, [value]);

    const formatDisplayDate = (date: Date) => {
        return date.toLocaleDateString() + ' ' + 
               hours + ':' + minutes + ' ' + ampm;
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
            updateDateTime(date, hours, minutes, ampm);
        }
    };

    const handleTimeChange = (newHours?: string, newMinutes?: string, newAmpm?: 'AM' | 'PM') => {
        const finalHours = newHours || hours;
        const finalMinutes = newMinutes || minutes;
        const finalAmpm = newAmpm || ampm;
        
        setHours(finalHours);
        setMinutes(finalMinutes);
        setAmpm(finalAmpm);
        
        if (selectedDate) {
            updateDateTime(selectedDate, finalHours, finalMinutes, finalAmpm);
        }
    };

    const updateDateTime = (date: Date, h: string, m: string, period: 'AM' | 'PM') => {
        const newDate = new Date(date);
        
        // Convert 12-hour to 24-hour format
        let hour24 = parseInt(h);
        if (period === 'AM' && hour24 === 12) {
            hour24 = 0;
        } else if (period === 'PM' && hour24 !== 12) {
            hour24 += 12;
        }
        
        newDate.setHours(hour24);
        newDate.setMinutes(parseInt(m));
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        
        onChange(newDate.toISOString());
    };

    const handleApply = () => {
        if (selectedDate) {
            updateDateTime(selectedDate, hours, minutes, ampm);
            setIsOpen(false);
        }
    };

    const handleNow = () => {
        const now = new Date();
        setSelectedDate(now);
        
        let hour = now.getHours();
        const minute = now.getMinutes();
        const isAM = hour < 12;
        
        if (hour === 0) hour = 12;
        else if (hour > 12) hour = hour - 12;
        
        const newHours = hour.toString().padStart(2, '0');
        const newMinutes = minute.toString().padStart(2, '0');
        const newAmpm = isAM ? 'AM' : 'PM';
        
        setHours(newHours);
        setMinutes(newMinutes);
        setAmpm(newAmpm);
        
        onChange(now.toISOString());
        setIsOpen(false);
    };

    const handleClear = () => {
        setSelectedDate(undefined);
        setHours('12');
        setMinutes('00');
        setAmpm('PM');
        onChange('');
        setIsOpen(false);
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        style={{
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            fontWeight: 'normal',
                            width: '100%'
                        }}
                    >
                        <CalendarIcon style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />
                        {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
                    </Button>
                </PopoverTrigger>
                <PopoverContent style={{ width: '320px', padding: '1rem' }}>
                    <VStack spacing={1} alignItems="stretch">
                        {/* Calendar */}
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            initialFocus
                        />
                        
                        {/* Time Selection */}
                        <Box style={{ marginTop: '1rem' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Time:</p>
                            <HStack spacing={0.5} style={{ alignItems: 'center' }}>
                                {/* Hours */}
                                <Input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={hours}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
                                            handleTimeChange(val.padStart(2, '0'), undefined, undefined);
                                        }
                                    }}
                                    style={{ width: '60px', textAlign: 'center' }}
                                    placeholder="HH"
                                />
                                
                                <span style={{ fontWeight: 'bold' }}>:</span>
                                
                                {/* Minutes */}
                                <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={minutes}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
                                            handleTimeChange(undefined, val.padStart(2, '0'), undefined);
                                        }
                                    }}
                                    style={{ width: '60px', textAlign: 'center' }}
                                    placeholder="MM"
                                />
                                
                                {/* AM/PM */}
                                <select
                                    value={ampm}
                                    onChange={(e) => handleTimeChange(undefined, undefined, e.target.value as 'AM' | 'PM')}
                                    style={{
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        backgroundColor: 'white',
                                        width: '70px'
                                    }}
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </HStack>
                        </Box>
                        
                        {/* Action Buttons */}
                        <HStack spacing={0.5} style={{ marginTop: '1rem' }}>
                            <Button size="sm" onClick={handleNow} style={{ flex: 1 }}>
                                Now
                            </Button>
                            <Button size="sm" onClick={handleApply} style={{ flex: 1 }}>
                                Apply
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleClear} style={{ flex: 1 }}>
                                Clear
                            </Button>
                        </HStack>
                    </VStack>
                </PopoverContent>
            </Popover>
            
            {/* Clear button when value is selected */}
            {selectedDate && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: '0.25rem',
                        height: 'auto',
                        width: 'auto'
                    }}
                >
                    <X style={{ height: '1rem', width: '1rem' }} />
                </Button>
            )}
        </div>
    );
};

export default DateTimePicker; 