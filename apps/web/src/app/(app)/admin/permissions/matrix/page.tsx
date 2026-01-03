"use client";

import { PageBackground } from "@/components/layout/PageBackground";
import { PermissionMatrixClient } from "@/components/admin/permissions/permission-matrix-client";

export default function PermissionsMatrixPage() {
  return (
    <PageBackground variant="vault">
      <PermissionMatrixClient />
    </PageBackground>
  );
}
