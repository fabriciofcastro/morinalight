import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const testData = {
  email: "fabricio@morina.com.br",
  password: "67318696Il!@#",
};

console.log("🔍 Testando validação do schema...\n");
console.log("Dados de teste:", { email: testData.email, passwordLength: testData.password.length });

try {
  const result = loginSchema.parse(testData);
  console.log("✅ Schema válido!");
  console.log("Resultado:", { email: result.email, passwordLength: result.password.length });
} catch (error) {
  console.error("❌ Erro na validação do schema:");
  if (error instanceof z.ZodError) {
    console.error("Erros:", error.errors);
  } else {
    console.error("Erro:", error);
  }
}













