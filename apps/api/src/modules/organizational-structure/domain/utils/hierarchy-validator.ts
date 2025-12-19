/**
 * Utilitários para validação de hierarquia organizacional
 */

const MAX_HIERARCHY_DEPTH = 10; // Profundidade máxima permitida

/**
 * Verifica se existe loop hierárquico percorrendo a árvore de pais
 * @param currentId - ID do item atual
 * @param parentId - ID do pai que está sendo atribuído
 * @param getParent - Função para obter o pai de um item pelo ID
 * @returns true se há loop, false caso contrário
 */
export async function hasHierarchyLoop<T extends { id: string; parentId?: string | null }>(
  currentId: string,
  parentId: string,
  getParent: (id: string) => Promise<T | null>,
): Promise<boolean> {
  // Se está tentando se tornar pai de si mesmo, há loop
  if (currentId === parentId) {
    return true;
  }

  // Percorrer a árvore de pais para verificar se o currentId está na hierarquia do parentId
  let currentParentId: string | null | undefined = parentId;
  const visited = new Set<string>();
  let depth = 0;

  while (currentParentId && depth < MAX_HIERARCHY_DEPTH) {
    // Detectar loop circular na hierarquia de pais
    if (visited.has(currentParentId)) {
      return true;
    }

    // Se encontrou o currentId na hierarquia de pais, há loop
    if (currentParentId === currentId) {
      return true;
    }

    visited.add(currentParentId);

    const parent = await getParent(currentParentId);
    if (!parent) {
      break;
    }

    currentParentId = parent.parentId;
    depth++;
  }

  // Se a profundidade excedeu o máximo, considerar como possível loop ou estrutura muito profunda
  if (depth >= MAX_HIERARCHY_DEPTH) {
    return true;
  }

  return false;
}

/**
 * Calcula a profundidade da hierarquia de um item
 * @param itemId - ID do item
 * @param getParent - Função para obter o pai de um item pelo ID
 * @returns Profundidade da hierarquia (0 = raiz)
 */
export async function calculateHierarchyDepth<T extends { id: string; parentId?: string | null }>(
  itemId: string,
  getParent: (id: string) => Promise<T | null>,
): Promise<number> {
  const item = await getParent(itemId);
  if (!item || !item.parentId) {
    return 0;
  }

  let depth = 0;
  let currentParentId: string | null | undefined = item.parentId;
  const visited = new Set<string>();

  while (currentParentId && depth < MAX_HIERARCHY_DEPTH) {
    if (visited.has(currentParentId)) {
      throw new Error("Loop hierárquico detectado ao calcular profundidade");
    }

    visited.add(currentParentId);
    depth++;

    const parent = await getParent(currentParentId);
    if (!parent || !parent.parentId) {
      break;
    }

    currentParentId = parent.parentId;
  }

  return depth;
}

/**
 * Valida se a profundidade máxima não será excedida ao adicionar um novo pai
 * @param currentDepth - Profundidade atual do item
 * @param newParentId - ID do novo pai
 * @param getParent - Função para obter o pai de um item pelo ID
 * @returns true se a profundidade máxima será excedida
 */
export async function wouldExceedMaxDepth<T extends { id: string; parentId?: string | null }>(
  currentDepth: number,
  newParentId: string | null | undefined,
  getParent: (id: string) => Promise<T | null>,
): Promise<boolean> {
  if (!newParentId) {
    return false; // Sem pai, não excede
  }

  const parentDepth = await calculateHierarchyDepth(newParentId, getParent);
  const newDepth = parentDepth + 1;

  return newDepth > MAX_HIERARCHY_DEPTH;
}

