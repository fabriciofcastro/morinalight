"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Code,
    Quote,
    Undo,
    Redo,
    ImageIcon,
    Link as LinkIcon,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button";
import { useCallback } from "react";

export interface RichTextEditorProps {
    content?: string;
    onChange?: (html: string, json: any) => void;
    placeholder?: string;
    editable?: boolean;
    className?: string;
    minHeight?: string;
}

/**
 * Rich Text Editor powered by Tiptap
 * 
 * Features:
 * - Text formatting (Bold, Italic, Code)
 * - Headings (H1, H2)
 * - Lists (Ordered, Unordered)
 * - Blockquotes
 * - Image upload
 * - Links
 * - Undo/Redo
 * 
 * @example
 * ```tsx
 * <RichTextEditor
 *   content="<p>Initial content</p>"
 *   onChange={(html, json) => console.log(html)}
 *   placeholder="Start writing..."
 * />
 * ```
 */
export function RichTextEditor({
    content = "",
    onChange,
    placeholder = "Start writing...",
    editable = true,
    className,
    minHeight = "200px",
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-none max-w-full h-auto",
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-[hsl(var(--primary))] underline cursor-pointer",
                },
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML(), editor.getJSON());
        },
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-invert max-w-none focus:outline-none",
                    "text-white/90 p-4",
                    "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4",
                    "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3",
                    "[&_p]:mb-3 [&_p]:leading-relaxed",
                    "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3",
                    "[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3",
                    "[&_blockquote]:border-l-4 [&_blockquote]:border-[hsl(var(--primary))] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-white/70",
                    "[&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-none [&_code]:text-sm [&_code]:font-mono",
                    "[&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:rounded-none [&_pre]:overflow-x-auto [&_pre]:mb-3",
                    "[&_a]:text-[hsl(var(--primary))] [&_a]:underline"
                ),
            },
        },
    });

    const addImage = useCallback(() => {
        const url = window.prompt("Enter image URL:");
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const setLink = useCallback(() => {
        const previousUrl = editor?.getAttributes("link").href;
        const url = window.prompt("Enter URL:", previousUrl);

        if (url === null) {
            return;
        }

        if (url === "") {
            editor?.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className={cn("border border-white/10 rounded-none bg-black/20 backdrop-blur-sm", className)}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-white/5">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn(
                        "h-8 w-8 p-0",
                        editor.isActive("bold") && "bg-[hsl(var(--primary))] text-white"
                    )}
                    disabled={!editable}
                >
                    <Bold className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn(
                        "h-8 w-8 p-0",
                        editor.isActive("italic") && "bg-[hsl(var(--primary))] text-white"
                    )}
                    disabled={!editable}
                >
                    <Italic className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={cn(
                        "h-8 w-8 p-0",
                        editor.isActive("code") && "bg-[hsl(var(--primary))] text-white"
                    )}
                    disabled={!editable}
                >
                    <Code className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn(
                        "h-8 w-8 p-0",
                        editor.isActive("heading", { level: 1 }) && "bg-[hsl(var(--primary))] text-white"
                    )}
                    disabled={!editable}
                >
                    <Heading1 className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn(
                        "h-8 w-8 p-0",
                        editor.isActive("heading", { level: 2 }) && "bg-[hsl(var(--primary))] text-white"
                    )}
                    disabled={!editable}
                >
                    <Heading2 className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn(
                        "h-8 w-8 p-0",
                        editor.isActive("bulletList") && "bg-[hsl(var(--primary))] text-white"
                    )}
                    disabled={!editable}
                >
                    <List className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn(
                        "h-8 w-8 p-0",
                        editor.isActive("orderedList") && "bg-[hsl(var(--primary))] text-white"
                    )}
                    disabled={!editable}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={cn(
                        "h-8 w-8 p-0",
                        editor.isActive("blockquote") && "bg-[hsl(var(--primary))] text-white"
                    )}
                    disabled={!editable}
                >
                    <Quote className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={addImage}
                    className="h-8 w-8 p-0"
                    disabled={!editable}
                >
                    <ImageIcon className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={setLink}
                    className={cn(
                        "h-8 w-8 p-0",
                        editor.isActive("link") && "bg-[hsl(var(--primary))] text-white"
                    )}
                    disabled={!editable}
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    className="h-8 w-8 p-0"
                    disabled={!editable || !editor.can().undo()}
                >
                    <Undo className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    className="h-8 w-8 p-0"
                    disabled={!editable || !editor.can().redo()}
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>

            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className={cn("overflow-y-auto", minHeight && `min-h-[${minHeight}]`)}
                style={{ minHeight }}
            />
        </div>
    );
}
