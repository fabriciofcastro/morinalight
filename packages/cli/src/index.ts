#!/usr/bin/env node

import { Command } from "commander";
import { init } from "./commands/init";
import { add } from "./commands/add";

const program = new Command();

program
    .name("morina")
    .description("CLI for Morina UI")
    .version("0.1.0");

program
    .command("init")
    .description("Initialize configuration")
    .action(init);

program
    .command("add")
    .description("Add a component")
    .argument("[component]", "The component to add")
    .action(add);

program.parse();
