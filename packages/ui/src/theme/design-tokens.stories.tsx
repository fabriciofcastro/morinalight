import type { Meta, StoryObj } from "@storybook/react";
import { semanticTokens } from "./semantic-tokens";

const meta: Meta = {
    title: "Theme/Design Tokens",
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;

type Story = StoryObj;

const TokenSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold text-text-primary border-b border-border-default pb-2">
            {title}
        </h2>
        {children}
    </div>
);

const ColorSwatch = ({ name, value, description }: { name: string; value: string; description?: string }) => (
    <div className="flex items-center gap-4 bg-background-secondary p-3 rounded-lg border border-border-default">
        <div
            className="w-16 h-16 rounded-md shadow-sm border border-border-subtle shrink-0"
            style={{ backgroundColor: value }}
        />
        <div className="flex flex-col min-w-0">
            <span className="font-mono text-sm font-medium text-text-primary break-all">{name}</span>
            <span className="font-mono text-xs text-text-tertiary">{value}</span>
            {description && <span className="text-xs text-text-secondary mt-1">{description}</span>}
        </div>
    </div>
);

const flattenObject = (obj: any, prefix = ""): Record<string, string> => {
    return Object.keys(obj).reduce((acc: any, k) => {
        const pre = prefix.length ? prefix + "." : "";
        if (typeof obj[k] === "object" && obj[k] !== null && !k.startsWith("rgba")) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
        } else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
};

export const Colors: Story = {
    render: () => {
        const categories = [
            { name: "Background", tokens: semanticTokens.color.background },
            { name: "Text", tokens: semanticTokens.color.text },
            { name: "Action", tokens: semanticTokens.color.action },
            { name: "Feedback", tokens: semanticTokens.color.feedback },
            { name: "Border", tokens: semanticTokens.color.border },
        ];

        return (
            <div className="p-8 space-y-12 bg-background-primary min-h-screen">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-text-primary">Design Tokens: Colors</h1>
                    <p className="text-text-secondary text-lg">
                        Semantic color palette for Morina Design System.
                    </p>
                </div>

                {categories.map((cat) => (
                    <TokenSection key={cat.name} title={cat.name}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(cat.tokens).map(([key, value]) => (
                                <ColorSwatch key={key} name={`${cat.name.toLowerCase()}.${key}`} value={value as string} />
                            ))}
                        </div>
                    </TokenSection>
                ))}
            </div>
        );
    },
};

export const Typography: Story = {
    render: () => (
        <div className="p-8 space-y-12 bg-background-primary min-h-screen">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-text-primary">Design Tokens: Typography</h1>
                <p className="text-text-secondary text-lg">
                    Font families, sizes, weights, and line heights.
                </p>
            </div>

            <TokenSection title="Font Family">
                <div className="space-y-6">
                    {Object.entries(semanticTokens.typography.fontFamily).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                            <div className="text-sm text-text-tertiary font-mono">{key}</div>
                            <div style={{ fontFamily: value }} className="text-3xl text-text-primary truncate">
                                The quick brown fox jumps over the lazy dog
                            </div>
                            <div className="text-xs text-text-tertiary font-mono bg-background-tertiary p-2 rounded w-fit">{value}</div>
                        </div>
                    ))}
                </div>
            </TokenSection>

            <TokenSection title="Font Size">
                <div className="space-y-6">
                    {Object.entries(semanticTokens.typography.fontSize).map(([key, value]) => (
                        <div key={key} className="flex items-baseline gap-8 border-b border-border-subtle pb-4 last:border-0">
                            <div className="w-24 text-sm text-text-tertiary font-mono">{key} ({value})</div>
                            <div style={{ fontSize: value }} className="text-text-primary">
                                Ag
                            </div>
                        </div>
                    ))}
                </div>
            </TokenSection>

            <TokenSection title="Font Weight">
                <div className="space-y-6">
                    {Object.entries(semanticTokens.typography.fontWeight).map(([key, value]) => (
                        <div key={key} className="flex items-baseline gap-8 border-b border-border-subtle pb-4 last:border-0">
                            <div className="w-24 text-sm text-text-tertiary font-mono">{key} ({value})</div>
                            <div style={{ fontWeight: value }} className="text-3xl text-text-primary">
                                The quick brown fox
                            </div>
                        </div>
                    ))}
                </div>
            </TokenSection>
        </div>
    ),
};

export const Spacing: Story = {
    render: () => (
        <div className="p-8 space-y-12 bg-background-primary min-h-screen">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-text-primary">Design Tokens: Spacing</h1>
                <p className="text-text-secondary text-lg">
                    Spacing scale for padding, margin, and gaps.
                </p>
            </div>

            <TokenSection title="Component Spacing">
                <div className="space-y-4">
                    {Object.entries(semanticTokens.spacing.component.padding).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-4">
                            <div className="w-16 text-sm text-text-tertiary font-mono">{key}</div>
                            <div className="h-8 bg-action-primary rounded opacity-80" style={{ width: value }} />
                            <div className="text-xs text-text-tertiary font-mono">{value}</div>
                        </div>
                    ))}
                </div>
            </TokenSection>
        </div>
    )
}

export const Radius: Story = {
    render: () => (
        <div className="p-8 space-y-12 bg-background-primary min-h-screen">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-text-primary">Design Tokens: Radius</h1>
                <p className="text-text-secondary text-lg">
                    Border radius values for component shapes.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                {Object.entries(semanticTokens.radius).map(([key, value]) => (
                    <div key={key} className="flex flex-col items-center gap-4">
                        <div
                            className="w-24 h-24 bg-action-secondary border border-action-secondaryHover"
                            style={{ borderRadius: value }}
                        />
                        <div className="text-center">
                            <div className="font-mono text-text-primary font-bold">{key}</div>
                            <div className="font-mono text-xs text-text-tertiary">{value}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const Shadows: Story = {
    render: () => (
        <div className="p-8 space-y-12 bg-background-primary min-h-screen">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-text-primary">Design Tokens: Shadows</h1>
                <p className="text-text-secondary text-lg">
                    Elevation and shadow depth values.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {Object.entries(semanticTokens.shadow).map(([key, value]) => {
                    if (typeof value === 'object') return null; // Skip nested objects like 'glow' for basic grid
                    return (
                        <div key={key} className="flex flex-col gap-4">
                            <div
                                className="h-32 bg-background-tertiary rounded-lg flex items-center justify-center text-text-primary border border-border-subtle"
                                style={{ boxShadow: value as string }}
                            >
                                Box
                            </div>
                            <div className="text-center">
                                <div className="font-mono text-text-primary font-bold">{key}</div>
                                <div className="font-mono text-xs text-text-tertiary px-2 truncate" title={value as string}>{value as string}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <TokenSection title="Glow Effects">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {Object.entries(semanticTokens.shadow.glow).map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-4">
                            <div
                                className="h-32 bg-background-tertiary rounded-lg flex items-center justify-center text-text-primary border border-border-subtle"
                                style={{ boxShadow: value }}
                            >
                                Glow
                            </div>
                            <div className="text-center">
                                <div className="font-mono text-text-primary font-bold">glow.{key}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </TokenSection>
        </div>
    )
}
