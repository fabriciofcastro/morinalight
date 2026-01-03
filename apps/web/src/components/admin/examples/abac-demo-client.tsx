"use client";

import { subject } from "@casl/ability";
import { useAbility } from "@/lib/auth/CaslContext";
import { Can } from "@/lib/auth";
import { AllowedGuard } from "@/components/auth/allowed-guard";
import { Button } from "@morina/ui";
import { Lock, Unlock, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getAuthUser } from "@/lib/auth-client";
import { fetchUserPermissions, type PermissionGrant } from "@/hooks/use-permissions";
import { useEffect, useState } from "react";

export function AbacDemoClient() {
    const ability = useAbility();
    const [user, setUser] = useState<any>(null);
    const [context, setContext] = useState<any>(null);

    useEffect(() => {
        const authUser = getAuthUser();
        if (authUser) {
            setUser(authUser);
            fetchUserPermissions(authUser.userId).then(data => {
                setContext(data.context);
            });
        }
    }, []);

    if (!user) return null;

    // Resources relative to REAL user
    const myDocument = { __typename: "Document", id: "doc-1", ownerId: user.userId, departmentId: context?.departmentId || "dept-a", status: "DRAFT" };
    const otherDocument = { __typename: "Document", id: "doc-2", ownerId: "other-user", departmentId: context?.departmentId || "dept-a", status: "PUBLISHED" };
    const otherDeptDocument = { __typename: "Document", id: "doc-3", ownerId: "user-3", departmentId: "other-dept", status: "DRAFT" };

    return (
        <AllowedGuard I="read" a={"ABAC_Demo" as any} redirectTo="/admin">
            <div className="p-8 space-y-8 text-white">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Shield className="text-purple-400" />
                        ABAC Verification Lab
                    </h1>
                    <p className="text-white/60">
                        Current User Context: ID: <code>{user.userId}</code> | Dept: <code>{context?.departmentId || 'N/A'}</code>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Ownership Check */}
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-blue-400" /> Ownership Rule
                        </h3>
                        <p className="text-sm text-white/50 mb-4">Rule: Can 'update' ONLY if owner.</p>

                        <div className="space-y-4">
                            <div className="p-3 bg-black/20 rounded border border-white/5">
                                <div className="text-xs mb-1 text-white/40">My Document (Owner: {myDocument.ownerId})</div>
                                <Can I="update" this={subject('Document', myDocument)} passThrough>
                                    {(allowed) => (
                                        <div className={`flex items-center gap-2 ${allowed ? "text-green-400" : "text-red-400"}`}>
                                            {allowed ? <Unlock size={16} /> : <Lock size={16} />}
                                            {allowed ? "Access Granted" : "Access Denied"}
                                        </div>
                                    )}
                                </Can>
                            </div>

                            <div className="p-3 bg-black/20 rounded border border-white/5">
                                <div className="text-xs mb-1 text-white/40">Other's Document (Owner: {otherDocument.ownerId})</div>
                                <Can I="update" this={subject('Document', otherDocument)} passThrough>
                                    {(allowed) => (
                                        <div className={`flex items-center gap-2 ${allowed ? "text-green-400" : "text-red-400"}`}>
                                            {allowed ? <Unlock size={16} /> : <Lock size={16} />}
                                            {allowed ? "Access Granted (Admin Override?)" : "Access Denied"}
                                        </div>
                                    )}
                                </Can>
                            </div>
                        </div>
                    </div>

                    {/* Department Check */}
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <BuildingIcon className="w-5 h-5 text-orange-400" /> Department Rule
                        </h3>
                        <p className="text-sm text-white/50 mb-4">Rule: Can 'view' ONLY same department.</p>

                        <div className="space-y-4">
                            <div className="p-3 bg-black/20 rounded border border-white/5">
                                <div className="text-xs mb-1 text-white/40">Same Dept ({myDocument.departmentId})</div>
                                {/* @ts-ignore */}
                                <Can I="read" this={myDocument} passThrough>
                                    {(allowed) => (
                                        <div className={`flex items-center gap-2 ${allowed ? "text-green-400" : "text-red-400"}`}>
                                            {allowed ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                                            {allowed ? "Visible" : "Hidden"}
                                        </div>
                                    )}
                                </Can>
                            </div>

                            <div className="p-3 bg-black/20 rounded border border-white/5">
                                <div className="text-xs mb-1 text-white/40">Other Dept ({otherDeptDocument.departmentId})</div>
                                {/* @ts-ignore */}
                                <Can I="read" this={otherDeptDocument} passThrough>
                                    {(allowed) => (
                                        <div className={`flex items-center gap-2 ${allowed ? "text-green-400" : "text-red-400"}`}>
                                            {allowed ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                                            {allowed ? "Visible" : "Hidden"}
                                        </div>
                                    )}
                                </Can>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AllowedGuard>
    );
}

function BuildingIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" />
            <path d="M16 6h.01" />
            <path d="M12 6h.01" />
            <path d="M12 10h.01" />
            <path d="M12 14h.01" />
            <path d="M16 10h.01" />
            <path d="M16 14h.01" />
            <path d="M8 10h.01" />
            <path d="M8 14h.01" />
        </svg>
    );
}
