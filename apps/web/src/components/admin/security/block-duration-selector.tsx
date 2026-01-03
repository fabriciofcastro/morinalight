/**
 * Block Duration Selector
 * 
 * Component for selecting block duration with presets and custom input
 */

import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

export interface BlockDuration {
    minutes: number;
    label: string;
}

const PRESET_DURATIONS: BlockDuration[] = [
    { minutes: 15, label: '15 minutes' },
    { minutes: 60, label: '1 hour' },
    { minutes: 360, label: '6 hours' },
    { minutes: 1440, label: '24 hours' },
    { minutes: 10080, label: '7 days' },
    { minutes: 43200, label: '30 days' },
    { minutes: 0, label: 'Permanent' },
    { minutes: -1, label: 'Custom' },
];

interface BlockDurationSelectorProps {
    value: number;
    onChange: (minutes: number) => void;
    className?: string;
}

export function BlockDurationSelector({
    value,
    onChange,
    className,
}: BlockDurationSelectorProps) {
    const [customMinutes, setCustomMinutes] = useState<string>('');
    const [selectedPreset, setSelectedPreset] = useState<string>(
        value === 0 ? '0' : value.toString()
    );

    const handlePresetChange = (presetValue: string) => {
        setSelectedPreset(presetValue);

        if (presetValue === '-1') {
            // Custom selected, don't change value yet
            return;
        }

        onChange(parseInt(presetValue));
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomMinutes(val);

        const minutes = parseInt(val);
        if (!isNaN(minutes) && minutes >= 0) {
            onChange(minutes);
        }
    };

    const getExpirationPreview = (minutes: number): string => {
        if (minutes === 0) {
            return 'Never expires (permanent block)';
        }

        const now = new Date();
        const expiry = new Date(now.getTime() + minutes * 60 * 1000);

        return `Expires: ${expiry.toLocaleString()}`;
    };

    return (
        <div className={className}>
            <Label className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                Block Duration
            </Label>

            <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                    {PRESET_DURATIONS.map((preset) => (
                        <SelectItem
                            key={preset.minutes}
                            value={preset.minutes.toString()}
                        >
                            {preset.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {selectedPreset === '-1' && (
                <div className="mt-2">
                    <Label htmlFor="custom-minutes" className="text-sm">
                        Custom duration (minutes)
                    </Label>
                    <Input
                        id="custom-minutes"
                        type="number"
                        min="0"
                        value={customMinutes}
                        onChange={handleCustomChange}
                        placeholder="Enter minutes"
                        className="mt-1"
                    />
                </div>
            )}

            {value >= 0 && selectedPreset !== '-1' && (
                <p className="text-sm text-muted-foreground mt-2">
                    {getExpirationPreview(value)}
                </p>
            )}
        </div>
    );
}
