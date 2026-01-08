import { ProductResponseDTO } from "@/application/dto";
import { ProductStatus } from "@/domain/entities";
import { Badge, Button, cn, GlassCard } from "@morina/ui";
import { CheckCircle2, Clock, Edit, Trash2, XCircle } from "lucide-react";
import { memo } from "react";
import { STATUS_LABELS } from "../Products.types";

interface ProductCardProps {
  product: ProductResponseDTO;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (product: ProductResponseDTO) => void;
  onDelete: (id: string) => void;
}

export const ProductCard = memo(function ProductCard({
  product,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
    <GlassCard
      className={cn(
        "p-6 group relative overflow-hidden transition-all duration-300 hover:border-primary/30 cursor-pointer",
        isSelected && "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
      )}
      onClick={() => onToggleSelect(product.id)}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl -z-10 transition-all duration-500 group-hover:bg-primary/10" />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-white/50 line-clamp-2 min-h-[40px]">
              {product.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Badge
          variant={
            product.status === ProductStatus.ACTIVE
              ? "success"
              : product.status === ProductStatus.INACTIVE
              ? "danger"
              : "secondary"
          }
          icon={
            product.status === ProductStatus.ACTIVE ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : product.status === ProductStatus.INACTIVE ? (
              <XCircle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )
          }
          size="sm"
        >
          {STATUS_LABELS[product.status as ProductStatus] || product.status}
        </Badge>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product.id);
            }}
            className="h-8 w-8 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}, (prev, next) => {
  return prev.product.id === next.product.id && 
         prev.product.status === next.product.status &&
         prev.product.name === next.product.name &&
         prev.product.description === next.product.description &&
         prev.isSelected === next.isSelected;
});
