import type { Meta, StoryObj } from "@storybook/react";
import { RichTextEditor } from "./index";
import { useState } from "react";

const meta: Meta<typeof RichTextEditor> = {
    title: "Components/RichTextEditor",
    component: RichTextEditor,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component: "A rich text editor powered by Tiptap with formatting toolbar, image upload, and link support.",
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof RichTextEditor>;

export const Default: Story = {
    render: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [content, setContent] = useState("");

        return (
            <div className="space-y-4">
                <RichTextEditor
                    content={content}
                    onChange={(html) => setContent(html)}
                    placeholder="Start writing your content..."
                />
                <div className="text-sm text-white/60">
                    <p className="font-semibold mb-2">Features:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Text formatting (Bold, Italic, Code)</li>
                        <li>Headings (H1, H2)</li>
                        <li>Lists (Ordered, Unordered)</li>
                        <li>Blockquotes</li>
                        <li>Image upload (click image icon)</li>
                        <li>Links (click link icon)</li>
                        <li>Undo/Redo</li>
                    </ul>
                </div>
            </div>
        );
    },
};

export const WithInitialContent: Story = {
    render: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [content, setContent] = useState(`
      <h1>Welcome to the Rich Text Editor</h1>
      <p>This is a <strong>powerful</strong> and <em>flexible</em> editor built with Tiptap.</p>
      <h2>Features</h2>
      <ul>
        <li>Text formatting</li>
        <li>Headings and lists</li>
        <li>Images and links</li>
      </ul>
      <blockquote>
        "The best way to predict the future is to invent it." - Alan Kay
      </blockquote>
      <p>Try editing this content!</p>
    `);

        return (
            <RichTextEditor
                content={content}
                onChange={(html) => setContent(html)}
            />
        );
    },
};

export const ReadOnly: Story = {
    args: {
        content: `
      <h1>Read-Only Content</h1>
      <p>This editor is in <strong>read-only</strong> mode.</p>
      <p>You cannot edit this content.</p>
    `,
        editable: false,
    },
};

export const CustomHeight: Story = {
    args: {
        placeholder: "This editor has a custom minimum height of 400px",
        minHeight: "400px",
    },
};

export const WithOnChange: Story = {
    render: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [html, setHtml] = useState("");
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [json, setJson] = useState<any>(null);

        return (
            <div className="space-y-4">
                <RichTextEditor
                    onChange={(htmlContent: string, jsonContent: any) => {
                        setHtml(htmlContent);
                        setJson(jsonContent);
                    }}
                    placeholder="Type something to see the output..."
                />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-sm font-semibold text-white/90 mb-2">HTML Output:</h3>
                        <pre className="bg-black/40 border border-white/10 rounded-none p-4 text-xs text-white/70 overflow-auto max-h-40">
                            {html || "No content yet"}
                        </pre>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white/90 mb-2">JSON Output:</h3>
                        <pre className="bg-black/40 border border-white/10 rounded-none p-4 text-xs text-white/70 overflow-auto max-h-40">
                            {json ? JSON.stringify(json, null, 2) : "No content yet"}
                        </pre>
                    </div>
                </div>
            </div>
        );
    },
};
