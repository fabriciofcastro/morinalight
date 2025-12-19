"use client";

import { useEffect, useState } from "react";
import { PermissionsManagerClient } from "./permissions-manager-client";
import { organizationalStructureApi } from "@/lib/api/organizational-structure";
import { permissionsApi } from "@/lib/api/permissions";

type EntityType = "department" | "sector" | "position" | "role";

interface PermissionsManagerClientWrapperProps {
  entityType: EntityType;
  entityId: string;
}

export function PermissionsManagerClientWrapper({
  entityType,
  entityId,
}: PermissionsManagerClientWrapperProps) {
  const [entityName, setEntityName] = useState<string>("");

  useEffect(() => {
    const loadEntityName = async () => {
      try {
        let name = "";
        switch (entityType) {
          case "department":
            const department = await organizationalStructureApi.getDepartment(entityId);
            name = department.name;
            break;
          case "sector":
            const sector = await organizationalStructureApi.getSector(entityId);
            name = sector.name;
            break;
          case "position":
            const position = await organizationalStructureApi.getPosition(entityId);
            name = position.name;
            break;
          case "role":
            const role = await permissionsApi.getRole(entityId);
            name = role.name;
            break;
        }
        setEntityName(name);
      } catch (error) {
        console.error("Erro ao carregar nome da entidade:", error);
        // Fallback para nome genérico
        const fallbackNames = {
          department: "Departamento",
          sector: "Setor",
          position: "Cargo",
          role: "Perfil",
        };
        setEntityName(fallbackNames[entityType]);
      }
    };

    void loadEntityName();
  }, [entityType, entityId]);

  if (!entityName) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionsManagerClient
      entityType={entityType}
      entityId={entityId}
      entityName={entityName}
    />
  );
}

