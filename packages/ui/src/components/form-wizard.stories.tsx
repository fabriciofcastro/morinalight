import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Button } from "./button";
import { FormWizard } from "./form-wizard";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof FormWizard> = {
    title: "Organisms/FormWizard",
    component: FormWizard,
    parameters: {
        layout: "centered",
    },
};

export default meta;

type Story = StoryObj<typeof FormWizard>;

const steps = [
    { id: "personal", label: "Dados Pessoais", description: "Identificação básica" },
    { id: "contact", label: "Contato", description: "Email e telefone" },
    { id: "review", label: "Revisão", description: "Confirme os dados" },
];

export const Default: Story = {
    render: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [currentStep, setCurrentStep] = React.useState(0);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [formData, setFormData] = React.useState({ name: "", email: "" });

        const handleNext = () => {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        };

        const handlePrevious = () => {
            setCurrentStep((prev) => Math.max(prev - 1, 0));
        };

        return (
            <FormWizard
                title="Cadastro de Cliente"
                description="Preencha os dados abaixo para cadastrar um novo cliente."
                steps={steps}
                currentStep={currentStep}
                onStepChange={setCurrentStep}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onFinish={() => alert("Formulário enviado! " + JSON.stringify(formData))}
                headerAction={<Button variant="outline" size="sm">Cancelar</Button>}
            >
                {(stepIndex) => {
                    switch (stepIndex) {
                        case 0:
                            return (
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nome Completo</Label>
                                        <Input
                                            id="name"
                                            placeholder="Digite o nome"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                            );
                        case 1:
                            return (
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Digite o email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            );
                        case 2:
                            return (
                                <div className="space-y-4 py-4">
                                    <h3 className="text-lg font-medium text-text-primary">Resumo</h3>
                                    <div className="bg-background-tertiary p-4 rounded-lg space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-text-secondary">Nome:</span>
                                            <span className="text-text-primary font-medium">{formData.name || "-"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-secondary">Email:</span>
                                            <span className="text-text-primary font-medium">{formData.email || "-"}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        default:
                            return null;
                    }
                }}
            </FormWizard>
        );
    },
};
