import chalk from "chalk";
import ora from "ora";
import fs from "fs/promises";
import path from "path";

export async function init() {
    const spinner = ora("Initializing configuration...").start();

    const configPath = path.join(process.cwd(), "morina.json");

    try {
        await fs.writeFile(configPath, JSON.stringify({
            style: "default",
            rsc: true,
            tsx: true,
            tailwind: {
                config: "tailwind.config.ts",
                css: "src/app/globals.css",
                baseColor: "slate",
                cssVariables: true
            },
            aliases: {
                components: "@/components",
                utils: "@/lib/utils"
            }
        }, null, 2));

        spinner.succeed(chalk.green("Configuration initialized: morina.json created"));
    } catch (error) {
        spinner.fail(chalk.red("Failed to initialize configuration"));
        console.error(error);
    }
}
