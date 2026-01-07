import type { Meta, StoryObj } from "@storybook/react";
import { CodeValidator } from "./code-validator";
import { useState } from "react";

const meta: Meta<typeof CodeValidator> = {
    title: "Components/CodeValidator",
    component: CodeValidator,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        entity: {
            control: "select",
            options: ["branch", "product", "department"],
        },
    },
};

export default meta;
type Story = StoryObj<typeof CodeValidator>;

// Wrapper to handle state
const CodeValidatorWrapper = (props: any) => {
    const [val, setVal] = useState(props.value || "");
    return <CodeValidator {...props} value={val} onChange={setVal} />;
};

export const Default: Story = {
    render: (args) => <CodeValidatorWrapper {...args} />,
    args: {
        entity: "product",
        value: "",
        placeholder: "Digite PROD-123...",
    },
};

export const WithError: Story = {
    render: (args) => <CodeValidatorWrapper {...args} />,
    args: {
        entity: "product",
        value: "PROD-001", // Mocked as existing in component
        label: "Código do Produto (Duplicado)",
    },
};

export const ValidState: Story = {
    render: (args) => <CodeValidatorWrapper {...args} />,
    args: {
        entity: "product",
        value: "UNIQUE-CODE-999",
        label: "Código Novo",
    },
};
