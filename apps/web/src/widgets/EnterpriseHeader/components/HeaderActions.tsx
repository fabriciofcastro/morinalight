import { Button } from "@/shared/ui/base/button";
import { NotificationCenter } from "@/shared/ui/notification-center";
import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo } from "react";

export const HeaderActions = memo(function HeaderActions() {
    const router = useRouter();

    return (
        <div className="flex items-center gap-3">
            {/* Help */}
            <div className="relative group p-0.5">
                {/* 90deg Corners */}
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#2957ff]/0 group-hover:border-[#2957ff]/70 transition-colors" />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#2957ff]/0 group-hover:border-[#2957ff]/70 transition-colors" />
                
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/support")}
                    title="Ajuda e Suporte"
                    className="h-9 w-9 text-white/50 hover:bg-[#2957ff]/10 hover:text-white transition-colors cursor-pointer rounded-lg relative z-10"
                >
                    <HelpCircle className="h-5 w-5" />
                </Button>
            </div>

            {/* Notifications (realtime) */}
            <div className="relative group p-0.5">
                {/* 90deg Corners */}
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#2957ff]/0 group-hover:border-[#2957ff]/70 transition-colors" />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#2957ff]/0 group-hover:border-[#2957ff]/70 transition-colors" />
                
                <NotificationCenter maxNotifications={8} />
            </div>
        </div>
    );
});
