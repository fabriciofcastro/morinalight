import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Button } from "../components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card";
import { Label } from "../components/label";
import { Input } from "../components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import { Toaster, toast } from "sonner";

const meta: Meta = {
    title: "Theme/Theme Builder",
    parameters: {
        layout: "centered",
    },
};

export default meta;

const ThemeBuilder = () => {
    const [colors, setColors] = React.useState({
        "--primary": "222.2 47.4% 11.2%",
        "--primary-foreground": "210 40% 98%",
        "--secondary": "210 40% 96.1%",
        "--secondary-foreground": "222.2 47.4% 11.2%",
        "--muted": "210 40% 96.1%",
        "--muted-foreground": "215.4 16.3% 46.9%",
        "--accent": "210 40% 96.1%",
        "--accent-foreground": "222.2 47.4% 11.2%",
        "--destructive": "0 84.2% 60.2%",
        "--destructive-foreground": "210 40% 98%",
        "--border": "214.3 31.8% 91.4%",
        "--input": "214.3 31.8% 91.4%",
        "--ring": "222.2 84% 4.9%",
        "--radius": "0.5rem",
    });

    const updateColor = (key: string, value: string) => {
        setColors((prev) => ({ ...prev, [key]: value }));
    };

    const copyConfig = () => {
        const css = `:root {\n${Object.entries(colors)
            .map(([key, value]) => `  ${key}: ${value};`)
            .join("\n")}\n}`;
        navigator.clipboard.writeText(css);
        toast.success("Theme CSS copied to keyboard!");
    };

    return (
        <div className="flex w-[800px] gap-8 p-4">
            <div className="flex-1 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Theme Customizer</CardTitle>
                        <CardDescription>Customize your theme colors and variables.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(colors).map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                    <Label htmlFor={key}>{key}</Label>
                                    <Input
                                        id={key}
                                        value={value}
                                        onChange={(e) => updateColor(key, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={copyConfig} className="w-full">Copy CSS</Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="flex-1">
                <style dangerouslySetInnerHTML={{
                    __html: `.theme-preview {
            ${Object.entries(colors).map(([key, value]) => `${key}: ${value};`).join("\n")}
          }`
                }} />
                <div className="theme-preview space-y-4 rounded-lg border p-6 shadow-lg">
                    <h3 className="text-lg font-semibold">Preview</h3>
                    <div className="flex flex-col gap-4">
                        <Button>Primary Button</Button>
                        <Button variant="secondary">Secondary Button</Button>
                        <Button variant="outline">Outline Button</Button>
                        <Button variant="ghost">Ghost Button</Button>
                        <Button variant="destructive">Destructive Button</Button>
                        <div className="rounded-md border bg-card p-4 text-card-foreground shadow-sm">
                            Card Content
                        </div>
                        <Input placeholder="Input field" />
                    </div>
                </div>
            </div>
            <Toaster />
        </div>
    );
};

export const Builder: StoryObj = {
    render: () => <ThemeBuilder />,
};
