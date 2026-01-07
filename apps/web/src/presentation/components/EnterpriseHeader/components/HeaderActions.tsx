import { NotificationCenter } from "@/components/notifications/notification-center";
import { Can } from "@/lib/auth";
import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { actionButtonStyles } from "../EnterpriseHeader.styles";

export const HeaderActions = memo(function HeaderActions() {
    const router = useRouter();

    return (
        <>
            {/* Help */}
            <div className="group relative">
                <button
                    type="button"
                    onClick={() => router.push("/support")}
                    className={actionButtonStyles()}
                    title="Central de Ajuda (Suporte)"
                    aria-label="Abrir central de ajuda e suporte"
                >
                    <HelpCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
                    {/* Corner accents */}
                    <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/30 group-hover:border-[hsl(var(--primary))] transition-colors" />
                    <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/30 group-hover:border-[hsl(var(--primary))] transition-colors" />
                </button>
            </div>

            {/* Notifications (realtime) */}
            <Can I="read" a="Notification">
                <div className={actionButtonStyles({ variant: "notification" })}>
                    <NotificationCenter maxNotifications={8} />
                    {/* Corner accents */}
                    <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/30 group-hover:border-[hsl(var(--primary))] transition-colors" />
                    <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/30 group-hover:border-[hsl(var(--primary))] transition-colors" />
                </div>
            </Can>
        </>
    );
});
