import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ListPageLayout } from "./list-page-layout";
import { FileText } from "lucide-react";

describe("ListPageLayout", () => {
    const header = {
        title: "Test Page",
        description: "Description",
        icon: FileText,
    };

    it("renders header and children", () => {
        render(
            <ListPageLayout header={header}>
                <div data-testid="list-content">List Content</div>
            </ListPageLayout>
        );

        expect(screen.getByText("Test Page")).toBeInTheDocument();
        expect(screen.getByTestId("list-content")).toBeInTheDocument();
    });

    it("renders controls when provided", () => {
        render(
            <ListPageLayout
                header={header}
                controls={{ searchValue: "test", onSearchChange: () => { } }}
            >
                <div>Content</div>
            </ListPageLayout>
        );

        expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
    });

    it("renders pagination when provided", () => {
        render(
            <ListPageLayout
                header={header}
                pagination={{ total: 100, page: 1, pageSize: 10, onPageChange: () => { } }}
            >
                <div>Content</div>
            </ListPageLayout>
        );

        expect(screen.getByText(/results/i)).toBeInTheDocument();
    });
});
