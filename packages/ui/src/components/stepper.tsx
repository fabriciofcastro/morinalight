"use client";

import { Check, ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";
import { motion, AnimatePresence } from "framer-motion";

export interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  className?: string;
  allowNavigation?: boolean;
}

export function Stepper({
  steps,
  currentStep,
  onStepChange,
  className,
  allowNavigation = true,
}: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isClickable = allowNavigation && (isCompleted || isActive);

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => {
                    if (isClickable && onStepChange) {
                      onStepChange(index);
                    }
                  }}
                  disabled={!isClickable}
                  className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                    isCompleted
                      ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                      : isActive
                        ? "border-[var(--primary)] bg-[color-mix(in oklab,var(--primary)_10%,transparent)] text-[var(--primary)]"
                        : "border-[color-mix(in oklab,var(--muted-soft)_30%,var(--fg)_70%)] bg-transparent text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]",
                    isClickable && "cursor-pointer hover:scale-110",
                    !isClickable && "cursor-not-allowed"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </button>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isActive
                        ? "text-[var(--primary)]"
                        : isCompleted
                          ? "text-[var(--fg)]"
                          : "text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-colors",
                    index < currentStep
                      ? "bg-[var(--primary)]"
                      : "bg-[color-mix(in oklab,var(--muted-soft)_20%,transparent)]"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface WizardProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onFinish?: () => void;
  children: (stepIndex: number) => React.ReactNode;
  className?: string;
  showNavigation?: boolean;
  allowStepNavigation?: boolean;
  validateStep?: (stepIndex: number) => boolean;
}

export function Wizard({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  onFinish,
  children,
  className,
  showNavigation = true,
  allowStepNavigation = true,
  validateStep,
}: WizardProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canGoNext = validateStep ? validateStep(currentStep) : true;

  const handleNext = () => {
    if (canGoNext && !isLastStep) {
      if (onNext) {
        onNext();
      } else {
        onStepChange(currentStep + 1);
      }
    } else if (isLastStep && onFinish) {
      onFinish();
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      if (onPrevious) {
        onPrevious();
      } else {
        onStepChange(currentStep - 1);
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepChange={allowStepNavigation ? onStepChange : undefined}
        allowNavigation={allowStepNavigation}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {children(currentStep)}
        </motion.div>
      </AnimatePresence>

      {showNavigation && (
        <div className="flex items-center justify-between pt-4 border-t border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)]">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className={cn(
              "px-4 py-2 rounded-lg transition-colors",
              isFirstStep
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[color-mix(in oklab,var(--muted-soft)_10%,transparent)]"
            )}
          >
            Anterior
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
              Etapa {currentStep + 1} de {steps.length}
            </span>
          </div>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext}
            className={cn(
              "px-4 py-2 rounded-lg bg-[var(--primary)] text-white transition-colors flex items-center gap-2",
              !canGoNext ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
            )}
          >
            {isLastStep ? "Finalizar" : "Próximo"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

