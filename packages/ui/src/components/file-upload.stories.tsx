import type { Meta, StoryObj } from "@storybook/react";
import { FileUpload } from "./file-upload";

/**
 * **FileUpload** is a drag-and-drop capability zone compatible with `react-dropzone`.
 * It handles validation, file type restriction, and visual feedback.
 */
const meta: Meta<typeof FileUpload> = {
    title: "UI/Future/FileUpload",
    component: FileUpload,
    parameters: {
        layout: "centered",
        backgrounds: {
            default: "dark",
        },
    },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Default: Story = {
    args: {
        onChange: (file) => console.log("File changed:", file),
    },
};

export const WithValue: Story = {
    args: {
        value: new File(["dummy content"], "report-2024.pdf", { type: "application/pdf" }),
        onChange: () => { },
    },
};

export const RestrictedTypes: Story = {
    args: {
        label: "Upload Image",
        description: "Accepts only PNG and JPG under 2MB",
        accept: {
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
        },
        maxSize: 2 * 1024 * 1024,
        onChange: () => { },
    },
};

export const ErrorState: Story = {
    render: (args) => {
        // Simulating error state by passing a huge file manually would be complex
        // so we describe how usage works. 
        // In a real app, the component handles rejection internal state.
        return <FileUpload {...args} />;
    },
    args: {
        maxSize: 10, // Very small size to force error on almost any file
        description: "Try uploading any file > 10 bytes to see error",
        onChange: () => { },
    }
};

export const Disabled: Story = {
    args: {
        disabled: true,
        onChange: () => { },
    },
};
