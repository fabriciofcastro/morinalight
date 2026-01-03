/**
 * Unblock Confirmation Dialog
 * 
 * Reusable confirmation dialog for unblocking users and IPs
 */

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UnblockConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    type: 'user' | 'ip';
    identifier: string;
    isLoading?: boolean;
}

export function UnblockConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    type,
    identifier,
    isLoading = false,
}: UnblockConfirmationDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Confirm Unblock {type === 'user' ? 'User' : 'IP Address'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to unblock{' '}
                        <span className="font-semibold text-foreground">
                            {identifier}
                        </span>
                        ?
                        <br />
                        <br />
                        This will immediately restore access for this {type}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isLoading}
                        className="bg-primary"
                    >
                        {isLoading ? 'Unblocking...' : 'Unblock'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
