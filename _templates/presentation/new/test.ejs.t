---
to: apps/web/src/presentation/components/<%= name %>/<%= name %>.test.tsx
---
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { <%= name %> } from "./index";

describe("<%= name %> Component", () => {
  it("renders correctly", () => {
    render(<<%= name %> />);
    expect(screen.getByText("<%= name %>")).toBeInTheDocument();
  });
});
