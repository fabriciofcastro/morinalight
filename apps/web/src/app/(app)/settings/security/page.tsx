'use client';

import { MFASetupModal } from '@/components/auth/mfa-setup';
import { Button } from '@/shared/ui/base/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/base/card';
import { Key, Lock, Shield } from 'lucide-react';
import { useState } from 'react';

export default function SecuritySettingsPage() {
    const [showMFASetup, setShowMFASetup] = useState(false);

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Security Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account security and authentication methods
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Two-Factor Authentication */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Two-Factor Authentication
                        </CardTitle>
                        <CardDescription>
                            Add an extra layer of security to your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Protect your account with TOTP-based two-factor authentication using apps like Google Authenticator or Authy.
                        </p>
                        <Button onClick={() => setShowMFASetup(true)}>
                            <Key className="mr-2 h-4 w-4" />
                            Enable Two-Factor Authentication
                        </Button>
                    </CardContent>
                </Card>

                {/* Password */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Password
                        </CardTitle>
                        <CardDescription>
                            Change your account password
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Use a strong, unique password to protect your account.
                        </p>
                        <Button variant="outline">
                            Change Password
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* MFA Setup Modal */}
            {showMFASetup && (
                <MFASetupModal
                    onClose={() => setShowMFASetup(false)}
                    onSuccess={() => {
                        // Refresh user data or show success message
                        console.log('MFA enabled successfully');
                    }}
                />
            )}
        </div>
    );
}
