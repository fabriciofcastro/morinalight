import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from 'fs';

const prisma = new PrismaClient();

function log(msg: string) {
    console.log(msg);
    fs.appendFileSync('user-check-result.txt', msg + '\n');
}

async function main() {
    const email = "fabricio@morina.com.br";
    const password = "67318696";
    const displayName = "Fabrício";

    log(`Checking for user: ${email}...`);

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        log(`User ${email} already exists. Updating password...`);
        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.update({ where: { email }, data: { passwordHash } });
        log("Password updated successfully.");
    } else {
        log(`User ${email} not found. Creating...`);
        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                displayName,
                status: "active",
            },
        });
        log(`User created with ID: ${user.id}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
