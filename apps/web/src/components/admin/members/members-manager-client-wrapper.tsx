"use client";

import { useEffect, useState } from "react";
import { MembersManagerClient } from "./members-manager-client";
import { organizationalStructureApi } from "@/lib/api/organizational-structure";

type EntityType = "branch" | "department" | "sector" | "position";

interface MembersManagerClientWrapperProps {
  entityType: EntityType;
  entityId: string;
}

export function MembersManagerClientWrapper({
  entityType,
  entityId,
}: MembersManagerClientWrapperProps) {
  const [entityName, setEntityName] = useState<string>("");

  useEffect(() => {
    const loadEntityName = async () => {
      try {
        let name = "";
        switch (entityType) {
          case "branch":
            const branch = await organizationalStructureApi.getBranch(entityId);
            name = branch.name;
            break;
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
        }
        setEntityName(name);
      } catch (error) {
        console.error("Erro ao carregar nome da entidade:", error);
        // Fallback para nome genérico
        const fallbackNames = {
          branch: "Filial",
          department: "Departamento",
          sector: "Setor",
          position: "Cargo",
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
    <MembersManagerClient
      entityType={entityType}
      entityId={entityId}
      entityName={entityName}
    />
  );
}





