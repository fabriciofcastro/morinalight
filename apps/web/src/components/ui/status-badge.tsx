export function StatusBadge({
    status,
    label,
}: {
    status: "active" | "inactive" | "pending" | "warning";
    label?: string;
}) {
    const variants = {
        active: {
            bg: "bg-emerald-500/10",
            text: "text-emerald-400",
            dot: "bg-emerald-400",
            label: label || "Ativo",
        },
        inactive: {
            bg: "bg-red-500/10",
            text: "text-red-400",
            dot: "bg-red-400",
            label: label || "Inativo",
        },
        pending: {
            bg: "bg-blue-500/10",
            text: "text-blue-400",
            dot: "bg-blue-400",
            label: label || "Pendente",
        },
        warning: {
            bg: "bg-yellow-500/10",
            text: "text-yellow-400",
            dot: "bg-yellow-400",
            label: label || "Atenção",
        },
    };

    const variant = variants[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${variant.bg} ${variant.text}`}
            role="status"
            aria-label={variant.label}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${variant.dot}`} aria-hidden="true" />
            {variant.label}
        </span>
    );
}
