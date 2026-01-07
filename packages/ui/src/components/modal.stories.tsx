import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "./button";
import {
    Modal,
    ModalTrigger,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalDescription,
    ModalBody,
    ModalFooter,
    ModalClose,
} from "./modal";

const meta: Meta<typeof Modal> = {
    title: "Components/Modal",
    component: Modal,
    tags: ["autodocs"],
    argTypes: {
        // modal root props
    },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
    render: () => (
        <Modal>
            <ModalTrigger asChild>
                <Button variant="outline">Open Modal</Button>
            </ModalTrigger>
            <ModalContent>
                <ModalHeader>
                    <ModalTitle>Edit Profile</ModalTitle>
                    <ModalDescription>
                        Make changes to your profile here. Click save when you're done.
                    </ModalDescription>
                </ModalHeader>
                <ModalBody className="py-4">
                    <div className="grid gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right text-sm font-medium">
                                Name
                            </label>
                            <input
                                id="name"
                                defaultValue="Pedro Duarte"
                                className="col-span-3 h-9 px-3 bg-surface border border-border rounded-md"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="username" className="text-right text-sm font-medium">
                                Username
                            </label>
                            <input
                                id="username"
                                defaultValue="@peduarte"
                                className="col-span-3 h-9 px-3 bg-surface border border-border rounded-md"
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <ModalClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </ModalClose>
                    <Button type="submit">Save changes</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    ),
};

export const Sizes: Story = {
    render: () => (
        <div className="flex flex-wrap gap-4">
            {["sm", "md", "lg", "xl", "full"].map((size) => (
                <Modal key={size}>
                    <ModalTrigger asChild>
                        <Button variant="outline">Open {size}</Button>
                    </ModalTrigger>
                    <ModalContent size={size as any}>
                        <ModalHeader>
                            <ModalTitle>Modal Size: {size}</ModalTitle>
                        </ModalHeader>
                        <ModalBody>
                            <p className="text-text-secondary">
                                This modal is using the <code>{size}</code> size variant.
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <ModalClose asChild>
                                <Button>Close</Button>
                            </ModalClose>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            ))}
        </div>
    ),
};

export const Controlled: Story = {
    render: () => {
        const [open, setOpen] = useState(false);
        return (
            <div className="space-y-4">
                <p className="text-sm text-text-secondary">State: {open ? "Open" : "Closed"}</p>
                <Button onClick={() => setOpen(true)}>Open Controlled Modal</Button>

                <Modal open={open} onOpenChange={setOpen}>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Controlled Modal</ModalTitle>
                            <ModalDescription>
                                This modal is controlled by external state.
                            </ModalDescription>
                        </ModalHeader>
                        <ModalFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Close via Prop
                            </Button>
                            <Button onClick={() => setOpen(false)}>
                                Save & Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        );
    },
};
