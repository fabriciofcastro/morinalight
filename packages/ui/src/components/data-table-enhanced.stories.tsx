import type { Meta, StoryObj } from "@storybook/react";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import * as React from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { DataTable, DataTableDensity } from "./data-table";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";
import { exportToCSV, exportToXLSX } from "../lib/export-utils";

const meta: Meta = {
    title: "Components/DataTable Enhanced",
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component: "Enhanced DataTable with density toggle, column visibility, and export functionality.",
            },
        },
    },
};

export default meta;

// Mock Data
type Payment = {
    id: string;
    amount: number;
    status: "pending" | "processing" | "success" | "failed";
    email: string;
    date: string;
};

const data: Payment[] = [
    { id: "728ed52f", amount: 100, status: "pending", email: "m@example.com", date: "2023-01-01" },
    { id: "489e1d42", amount: 125, status: "processing", email: "example@gmail.com", date: "2023-01-02" },
    { id: "e826b643", amount: 200, status: "success", email: "success@test.com", date: "2023-01-03" },
    { id: "a1b2c3d4", amount: 300, status: "failed", email: "failed@test.com", date: "2023-01-04" },
    { id: "e5f6g7h8", amount: 50, status: "success", email: "customer@domain.com", date: "2023-01-05" },
    { id: "i9j0k1l2", amount: 175, status: "pending", email: "pending@test.com", date: "2023-01-06" },
    { id: "m3n4o5p6", amount: 225, status: "processing", email: "process@test.com", date: "2023-01-07" },
    { id: "q7r8s9t0", amount: 400, status: "success", email: "winner@test.com", date: "2023-01-08" },
];

export const Enhanced: StoryObj = {
    render: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [search, setSearch] = React.useState("");
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [density, setDensity] = React.useState<DataTableDensity>("comfortable");
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [sorting, setSorting] = React.useState([]);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [rowSelection, setRowSelection] = React.useState({});
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [columnVisibility, setColumnVisibility] = React.useState({});

        // Columns definition
        const columns = [
            {
                id: "select",
                header: ({ table }: any) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }: any) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                size: 40,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: any) => {
                    const status = row.getValue("status") as string;
                    const variant =
                        status === "success" ? "success" :
                            status === "failed" ? "danger" :
                                status === "processing" ? "warning" : "default";

                    return <Badge variant={variant}>{status}</Badge>;
                },
            },
            {
                accessorKey: "email",
                header: ({ column }: any) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="p-0 hover:bg-transparent"
                        >
                            Email
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
            },
            {
                accessorKey: "amount",
                header: () => <div className="text-right">Amount</div>,
                cell: ({ row }: any) => {
                    const amount = parseFloat(row.getValue("amount"));
                    const formatted = new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                    }).format(amount);
                    return <div className="text-right font-medium">{formatted}</div>;
                },
            },
            {
                accessorKey: "date",
                header: "Date",
            },
            {
                id: "actions",
                cell: ({ row }: any) => {
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
                                    Copy payment ID
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>View customer</DropdownMenuItem>
                                <DropdownMenuItem>View payment details</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
                size: 50,
                enableHiding: false,
            },
        ];

        const filteredData = data.filter((item) =>
            item.email.toLowerCase().includes(search.toLowerCase())
        );

        const handleExport = (format: "csv" | "xlsx") => {
            const exportColumns = [
                { header: "ID", accessor: "id" },
                { header: "Email", accessor: "email" },
                { header: "Amount", accessor: (row: Payment) => `$${row.amount}` },
                { header: "Status", accessor: "status" },
                { header: "Date", accessor: "date" },
            ];

            if (format === "csv") {
                exportToCSV(filteredData, exportColumns, "payments.csv");
            } else {
                exportToXLSX(filteredData, exportColumns, "payments.xlsx");
            }
        };

        return (
            <div className="space-y-4 w-full p-6 border rounded-xl bg-background-primary">
                <h2 className="text-2xl font-bold tracking-tight">Enhanced DataTable</h2>

                <DataTableToolbar
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search emails..."
                    density={density}
                    onDensityChange={setDensity}
                    table={undefined} // Will be set by DataTable internally in real usage
                    onExport={handleExport}
                />

                <div className="rounded-md border border-border-default">
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        density={density}
                        enableRowSelection={true}
                        state={{
                            sorting,
                            rowSelection,
                        }}
                        onSortingChange={setSorting as any}
                        onRowSelectionChange={setRowSelection as any}
                    />
                </div>

                <div className="text-sm text-white/60">
                    <p>✨ <strong>New Features:</strong></p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li><strong>Density Toggle:</strong> Switch between compact, comfortable, and spacious row spacing</li>
                        <li><strong>Column Visibility:</strong> Show/hide columns via dropdown (pass table prop to toolbar)</li>
                        <li><strong>Export:</strong> Export data to CSV or XLSX format</li>
                    </ul>
                </div>
            </div>
        );
    },
};
