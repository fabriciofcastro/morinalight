#!/usr/bin/env node
/**
 * Script de demonstração do catálogo.
 * Cria um produto, aprova e imprime feeds REST.
 */
const baseUrl = process.env.API_URL ?? "http://localhost:3333";
const orgId = process.env.ORG_ID ?? "demo-org";
const actorId = process.env.ACTOR_ID ?? "cli-actor";

async function main() {
  console.log(`➡️  Usando API ${baseUrl} (org=${orgId}, actor=${actorId})`);

  const slug = Math.random().toString(36).slice(2, 8);
  const produtoNome = `Produto CLI ${slug}`;

  const criado = await request("/catalogo/produtos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-org-id": orgId,
      "x-actor-id": actorId,
    },
    body: JSON.stringify({
      nome: produtoNome,
      descricao: "Criado via scripts/catalogo-demo.mjs",
    }),
  });

  console.log(`✅ Produto criado: ${criado.produtoId} (${criado.nome})`);

  const aprovado = await request(`/catalogo/produtos/${criado.produtoId}/aprovar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-org-id": orgId,
      "x-actor-id": actorId,
    },
  });

  console.log(`✅ Produto aprovado: status ${aprovado.status}`);

  const lista = await request("/catalogo/produtos?status=ativo", {
    method: "GET",
    headers: { "x-org-id": orgId },
  });

  console.log(`📦 Produtos ativos: ${lista.itens.length}`);

  const feed = await request("/notifications/feed", {
    method: "GET",
    headers: { "x-org-id": orgId },
  });

  console.log("🔔 Últimas notificações:");
  feed.itens.slice(0, 3).forEach((item) => {
    console.log(`  • [${item.tipo}] ${item.produto?.nome ?? "sem produto"} @ ${item.criadoEm}`);
  });
}

async function request(path, init) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha em ${init.method ?? "GET"} ${url}: ${response.status} ${text}`);
  }
  return response.json();
}

main().catch((error) => {
  console.error("❌ Erro ao executar demo:", error);
  process.exitCode = 1;
});
