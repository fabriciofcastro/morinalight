'use client';

import { Alert } from '@/shared/ui/base/Alert';
import { Button } from '@/shared/ui/base/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/base/dialog';
import { Input } from '@/shared/ui/base/input';
import { Label } from '@/shared/ui/base/label';
import { Check, Copy, Loader2, Shield } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface MFASetupModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export function MFASetupModal({ onClose, onSuccess }: MFASetupModalProps) {
    const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [verificationCode, setVerificationCode] = useState('');
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

    const handleSetup = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/mfa/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to setup MFA');
            }

            const data = await response.json();
            setQrCodeUrl(data.qrCodeDataUrl);
            setSecret(data.secret);
            setBackupCodes(data.backupCodes);
            setStep('verify');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/mfa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: verificationCode }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Invalid verification code');
            }

            setStep('backup');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = () => {
        onClose();
        onSuccess?.();
        // Reset state
        setTimeout(() => {
            setStep('setup');
            setQrCodeUrl(null);
            setSecret(null);
            setBackupCodes([]);
            setVerificationCode('');
            setError(null);
        }, 300);
    };

    const copyToClipboard = (text: string, type: 'secret' | 'backup') => {
        navigator.clipboard.writeText(text);
        if (type === 'secret') {
            setCopiedSecret(true);
            setTimeout(() => setCopiedSecret(false), 2000);
        } else {
            setCopiedBackupCodes(true);
            setTimeout(() => setCopiedBackupCodes(false), 2000);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Enable Two-Factor Authentication
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'setup' && 'Enhance your account security with 2FA'}
                        {step === 'verify' && 'Scan the QR code and enter the verification code'}
                        {step === 'backup' && 'Save your backup codes in a secure location'}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert type="error" message={error} />
                )}

                {step === 'setup' && (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Two-factor authentication adds an extra layer of security to your account. You'll need to enter a code from your authenticator app each time you log in.
                        </p>
                        <Button onClick={handleSetup} disabled={loading} className="w-full">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Get Started
                        </Button>
                    </div>
                )}

                {step === 'verify' && qrCodeUrl && (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative h-64 w-64 border rounded-lg p-4 bg-white">
                                <Image
                                    src={qrCodeUrl}
                                    alt="QR Code for 2FA setup"
                                    fill
                                    className="object-contain"
                                />
                            </div>

                            <div className="w-full space-y-2">
                                <Label htmlFor="secret">Or enter this code manually:</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="secret"
                                        value={secret || ''}
                                        readOnly
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => copyToClipboard(secret || '', 'secret')}
                                    >
                                        {copiedSecret ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">Verification Code</Label>
                            <Input
                                id="code"
                                placeholder="000000"
                                value={verificationCode}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                className="text-center text-2xl tracking-widest font-mono"
                            />
                        </div>

                        <Button onClick={handleVerify} disabled={loading || verificationCode.length !== 6} className="w-full">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify and Enable
                        </Button>
                    </div>
                )}

                {step === 'backup' && (
                    <div className="space-y-4">
                        <Alert
                            title="Important"
                            message="Save these backup codes in a secure location. Each code can only be used once to access your account if you lose your authenticator device."
                        />

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Backup Codes</Label>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup')}
                                >
                                    {copiedBackupCodes ? (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copy All
                                        </>
                                    )}
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
                                {backupCodes.map((code, index) => (
                                    <div key={index} className="text-center">
                                        {code}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleComplete} className="w-full">
                            I've Saved My Backup Codes
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
