import { BranchFormClient } from "../../../branch-form-client";

interface PageProps {
  params: {
    branchId: string;
  };
}

export default function EditBranchPage({ params }: PageProps) {
  return <BranchFormClient branchId={params.branchId} />;
}



