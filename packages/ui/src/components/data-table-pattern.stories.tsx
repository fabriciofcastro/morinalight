import type { Meta, StoryObj } from "@storybook/react";
import { ArrowUpDown, Download, Filter, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import * as React from "react";
import { ActionButton } from "./action-button";
import { ActionToolbar } from "./action-toolbar";
import { Badge } from "./badge";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { DataTable } from "./data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";
import { FilterInput } from "./filter-input";
import { NativeSelect } from "./native-select";

const meta: Meta = {
    title: "Patterns/DataTable Pattern",
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component: "A standard pattern for building rich data tables with filtering, sorting, and actions. Composes ActionToolbar, FilterInput, and DataTable.",
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
];

export const Default: StoryObj = {
    render: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [filter, setFilter] = React.useState("");
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [status, setStatus] = React.useState("all");

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
            },
        ];

        return (
            <div className="space-y-4 w-full p-6 border rounded-xl bg-background-primary">
                <h2 className="text-2xl font-bold tracking-tight">Payments</h2>

                {/* Pattern Usage: ActionToolbar + FilterInput */}
                <ActionToolbar
                    prefix={
                        <>
                            <div className="w-full sm:w-[250px]">
                                <FilterInput
                                    value={filter}
                                    onChange={setFilter}
                                    placeholder="Filter emails..."
                                />
                            </div>
                            <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="w-[140px]">
                                <option value="all">All Status</option>
                                <option value="success">Success</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </NativeSelect>
                        </>
                    }
                    suffix={
                        <>
                            <ActionButton icon={<Filter className="h-4 w-4" />} tooltip="More Filters" variant="outline" />
                            <div className="h-6 w-px bg-border-default mx-2" />
                            <Button variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Payment
                            </Button>
                        </>
                    }
                />

                <div className="rounded-md border border-border-default">
                    <DataTable
                        columns={columns}
                        data={data}
                        enableRowSelection={true}
                    />
                </div>
            </div>
        );
    },
};
