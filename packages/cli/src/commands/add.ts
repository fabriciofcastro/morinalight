import chalk from "chalk";
import ora from "ora";
import fs from "fs/promises";
import path from "path";
import prompts from "prompts";

export async function add(component?: string) {
    let componentName = component;

    if (!componentName) {
        const response = await prompts({
            type: "text",
            name: "component",
            message: "What is the name of the component you want to create?",
        });
        componentName = response.component;
    }

    if (!componentName) {
        console.log(chalk.red("Operation cancelled."));
        return;
    }

    const spinner = ora(`Creating component: ${componentName}...`).start();

    // Assuming we are running from root or we can find packages/ui
    // For now, let's assume we run this in the root of the monorepo
    const uiPackagePath = path.join(process.cwd(), "packages/ui/src/components");

    try {
        // Check if packages/ui exists
        await fs.access(uiPackagePath);
    } catch {
        spinner.fail(chalk.red("Could not find packages/ui/src/components. Are you in the monorepo root?"));
        return;
    }

    const componentPath = path.join(uiPackagePath, `${componentName}.tsx`);
    const componentContent = `import * as React from "react"
import { cn } from "../../lib/cn"
import { cva, type VariantProps } from "class-variance-authority"

const ${componentName}Variants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ${componentName}Variants> {
  asChild?: boolean
}

const ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} = React.forwardRef<HTMLDivElement, ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <div
        className={cn(${componentName}Variants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
${componentName.charAt(0).toUpperCase() + componentName.slice(1)}.displayName = "${componentName.charAt(0).toUpperCase() + componentName.slice(1)}"

export { ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}, ${componentName}Variants }
`;

    try {
        await fs.writeFile(componentPath, componentContent);
        spinner.succeed(chalk.green(`Component ${componentName} created at ${componentPath}`));
    } catch (error) {
        spinner.fail(chalk.red(`Failed to create component ${componentName}`));
        console.error(error);
    }
}
