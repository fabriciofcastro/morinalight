import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta<typeof Tabs> = {
    title: "Components/Tabs",
    component: Tabs,
    tags: ["autodocs"],
    argTypes: {
        defaultValue: {
            control: "text",
        },
    },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
    render: (args) => (
        <Tabs defaultValue="account" className="w-[400px]" {...args}>
            <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
                <p className="p-4 text-sm text-text-secondary bg-surface border border-border mt-2">
                    Make changes to your account here.
                </p>
            </TabsContent>
            <TabsContent value="password">
                <p className="p-4 text-sm text-text-secondary bg-surface border border-border mt-2">
                    Change your password here.
                </p>
            </TabsContent>
        </Tabs>
    ),
};

export const Pills: Story = {
    render: (args) => (
        <Tabs defaultValue="music" className="w-[400px]" {...args}>
            <TabsList variant="pills">
                <TabsTrigger value="music">Music</TabsTrigger>
                <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
                <TabsTrigger value="live">Live</TabsTrigger>
            </TabsList>
            <TabsContent value="music">
                <div className="p-4 mt-2 bg-surface border border-border rounded-md">
                    <h3 className="font-semibold mb-2">Music Library</h3>
                    <p className="text-sm text-text-secondary">Browse your favorite tracks.</p>
                </div>
            </TabsContent>
            <TabsContent value="podcasts">
                <div className="p-4 mt-2 bg-surface border border-border rounded-md">
                    <h3 className="font-semibold mb-2">Podcasts</h3>
                    <p className="text-sm text-text-secondary">Listen to latest episodes.</p>
                </div>
            </TabsContent>
        </Tabs>
    ),
};

export const Enclosed: Story = {
    render: (args) => (
        <Tabs defaultValue="edit" className="w-[400px]" {...args}>
            <TabsList variant="enclosed" className="w-full justify-start">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" variant="enclosed">
                <div className="h-32 flex items-center justify-center text-text-secondary">
                    Editor Content
                </div>
            </TabsContent>
            <TabsContent value="preview" variant="enclosed">
                <div className="h-32 flex items-center justify-center text-text-secondary">
                    Preview Content
                </div>
            </TabsContent>
            <TabsContent value="history" variant="enclosed">
                <div className="h-32 flex items-center justify-center text-text-secondary">
                    History Content
                </div>
            </TabsContent>
        </Tabs>
    ),
};

export const Vertical: Story = {
    render: (args) => (
        <Tabs defaultValue="general" orientation="vertical" className="flex w-[600px] h-[300px]" {...args}>
            <TabsList variant="vertical" className="w-48">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
            <div className="flex-1 p-6 bg-surface border-y border-r border-border">
                <TabsContent value="general" className="mt-0">
                    <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                    <p className="text-text-secondary">Manage your general account settings.</p>
                </TabsContent>
                <TabsContent value="security" className="mt-0">
                    <h3 className="text-lg font-semibold mb-4">Security</h3>
                    <p className="text-text-secondary">Configure your security preferences.</p>
                </TabsContent>
            </div>
        </Tabs>
    ),
};
