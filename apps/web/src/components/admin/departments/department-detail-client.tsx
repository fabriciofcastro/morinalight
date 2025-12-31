"use client";

import { Button } from "@morina/ui";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Users, Building2, Layers, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HierarchyTree, type DepartmentNode } from "@/components/organizational/hierarchy-tree";
import { organizationalStructureApi } from "@/lib/api/organizational-structure";

interface DepartmentDetailClientProps {
  departmentId: string;
}

export function DepartmentDetailClient({ departmentId }: DepartmentDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState<any>(null);
  const [hierarchyData, setHierarchyData] = useState<DepartmentNode[]>([]);

  useEffect(() => {
    loadDepartmentDetails();
  }, [departmentId]);

  const loadDepartmentDetails = async () => {
    try {
      setLoading(true);
      const orgId = process.env.NEXT_PUBLIC_ORG_ID || "1";

      // Buscar detalhes do departamento
      const dept = await organizationalStructureApi.getDepartment(orgId, departmentId).catch(() => ({
        id: departmentId,
        name: "Departamento de Produção",
        code: "PROD-001",
        branchId: "1",
        costCenter: "CC-100",
        managerId: "1",
        manager: { name: "Carlos Silva" },
        active: true,
      }));

      setDepartment(dept);

      // Mock hierarchy data - em produção viria da API
      const mockHierarchy: DepartmentNode[] = [
        {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          level: 0,
          manager: dept.manager,
          users: [
            { id: "1", name: "Carlos Silva" },
            { id: "2", name: "Ana Costa" },
            { id: "3", name: "Pedro Santos" }
          ],
          children: [
            {
              id: "sub1",
              name: "Subdepartamento A",
              code: "PROD-001-A",
              level: 1,
              manager: { name: "Ana Costa" },
              users: [{ id: "2", name: "Ana Costa" }],
              children: [],
              sectors: [
                { id: "s1", name: "Setor Alpha", coordinator: { name: "João Pedro" }, users: 5 },
                { id: "s2", name: "Setor Beta", coordinator: { name: "Maria Clara" }, users: 3 }
              ]
            },
            {
              id: "sub2",
              name: "Subdepartamento B",
              code: "PROD-001-B",
              level: 1,
              manager: { name: "Pedro Santos" },
              users: [{ id: "3", name: "Pedro Santos" }],
              children: [],
              sectors: [
                { id: "s3", name: "Setor Gamma", users: 4 }
              ]
            }
          ],
          sectors: []
        }
      ];

      setHierarchyData(mockHierarchy);
    } catch (error) {
      console.error("Failed to load department:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="h-64 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="p-8 text-center">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-white/30" />
        <p className="text-white/50">Departamento não encontrado</p>
      </div>
    );
  }

  const totalUsers = hierarchyData[0]?.users?.length || 0;
  const totalSubdepts = hierarchyData[0]?.children?.length || 0;
  const totalSectors = hierarchyData[0]?.children?.reduce((sum, child) =>
    sum + (child.sectors?.length || 0), 0) || 0;

  return (
    <div className="p-8 space-y-8 min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/departments/list")}
            className="text-white/60 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-300">
              {department.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{department.code}</Badge>
              <span className="text-white/40">•</span>
              <span className="text-white/40 text-sm">Centro de Custo: {department.costCenter}</span>
            </div>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/admin/departments/${departmentId}/edit`)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-[#090b16]/40 border border-white/10 backdrop-blur-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white/50">Colaboradores</p>
              <p className="text-2xl font-bold text-white">{totalUsers}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-[#090b16]/40 border border-white/10 backdrop-blur-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Building2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white/50">Subdepartamentos</p>
              <p className="text-2xl font-bold text-white">{totalSubdepts}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-[#090b16]/40 border border-white/10 backdrop-blur-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-green-500/20">
              <Layers className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/50">Setores</p>
              <p className="text-2xl font-bold text-white">{totalSectors}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-[#090b16]/40 border border-white/10 backdrop-blur-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-cyan-500/20">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-white/50">Eficiência</p>
              <p className="text-2xl font-bold text-white">92%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hierarchy Tree */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Estrutura Hierárquica</h2>
        <HierarchyTree
          data={hierarchyData}
          onNodeClick={(node) => {
            console.log("Clicked node:", node);
            // Pode navegar para detalhes do subdepartamento/setor
          }}
        />
      </div>
    </div>
  );
}
