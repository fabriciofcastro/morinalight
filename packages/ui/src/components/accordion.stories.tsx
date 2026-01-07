import type { Meta, StoryObj } from "@storybook/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Accordion component for expandable content sections. Perfect for FAQs, settings, and collapsible content.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Single: Story = {
  render: () => (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>What is the Morina Design System?</AccordionTrigger>
        <AccordionContent>
          Morina is an enterprise-grade design system with 60+ components, 100+ semantic tokens, and
          full theme support (dark/light/high-contrast).
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How fast is it?</AccordionTrigger>
        <AccordionContent>
          With Tailwind CSS v4, builds are 100x faster with incremental builds completing in ~5ms.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes! All components meet WCAG AAA standards with full keyboard navigation and screen
          reader support.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple">
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>Multiple sections can be open at the same time.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>Try opening both sections simultaneously.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
