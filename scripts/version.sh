#!/bin/bash
set -e

# Sistema de Controle de Versão
# Gerencia versionamento semântico do sistema

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

VERSION_FILE="VERSION"
CHANGELOG_FILE="CHANGELOG.md"
GIT_TAG_PREFIX="v"

# Função para ler versão atual
get_current_version() {
    if [ -f "$VERSION_FILE" ]; then
        cat "$VERSION_FILE"
    else
        echo "0.0.0"
    fi
}

# Função para incrementar versão
increment_version() {
    local version=$1
    local part=$2  # major, minor, patch
    
    IFS='.' read -r -a parts <<< "$version"
    local major=${parts[0]}
    local minor=${parts[1]}
    local patch=${parts[2]}
    
    case $part in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch)
            patch=$((patch + 1))
            ;;
    esac
    
    echo "$major.$minor.$patch"
}

# Função para criar tag git
create_git_tag() {
    local version=$1
    local tag="${GIT_TAG_PREFIX}${version}"
    
    if git rev-parse "$tag" >/dev/null 2>&1; then
        echo -e "${YELLOW}Tag $tag já existe${NC}"
        return 1
    fi
    
    git tag -a "$tag" -m "Release $version"
    echo -e "${GREEN}Tag $tag criada${NC}"
}

# Função para atualizar changelog
update_changelog() {
    local version=$1
    local date=$(date +%Y-%m-%d)
    
    if [ ! -f "$CHANGELOG_FILE" ]; then
        cat > "$CHANGELOG_FILE" << EOF
# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

EOF
    fi
    
    # Adicionar nova versão no topo do changelog
    sed -i "1a\\
\\
## [$version] - $date\\
\\
### Adicionado\\
- \\
\\
### Modificado\\
- \\
\\
### Corrigido\\
- \\
\\
" "$CHANGELOG_FILE"
    
    echo -e "${GREEN}Changelog atualizado${NC}"
}

# Função para mostrar versão atual
show_version() {
    local version=$(get_current_version)
    local git_version=$(git describe --tags --abbrev=0 2>/dev/null || echo "N/A")
    local git_commit=$(git rev-parse --short HEAD 2>/dev/null || echo "N/A")
    
    echo -e "${BLUE}=== Versão do Sistema ===${NC}"
    echo -e "Versão atual: ${GREEN}$version${NC}"
    echo -e "Última tag Git: ${GREEN}$git_version${NC}"
    echo -e "Commit atual: ${GREEN}$git_commit${NC}"
    
    if [ -f "$CHANGELOG_FILE" ]; then
        echo -e "\n${BLUE}Últimas mudanças:${NC}"
        head -20 "$CHANGELOG_FILE"
    fi
}

# Função para fazer release
do_release() {
    local part=$1  # major, minor, patch
    local current_version=$(get_current_version)
    local new_version=$(increment_version "$current_version" "$part")
    
    echo -e "${BLUE}=== Criando Release ===${NC}"
    echo -e "Versão atual: ${YELLOW}$current_version${NC}"
    echo -e "Nova versão: ${GREEN}$new_version${NC}\n"
    
    # Atualizar arquivo de versão
    echo "$new_version" > "$VERSION_FILE"
    echo -e "${GREEN}✓ Versão atualizada em $VERSION_FILE${NC}"
    
    # Atualizar changelog
    update_changelog "$new_version"
    
    # Criar tag git
    read -p "Criar tag Git? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_git_tag "$new_version"
        
        read -p "Fazer push da tag? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push origin "${GIT_TAG_PREFIX}${new_version}"
            echo -e "${GREEN}✓ Tag enviada para o repositório${NC}"
        fi
    fi
    
    echo -e "\n${GREEN}✓ Release $new_version criado com sucesso!${NC}"
}

# Menu principal
case "${1:-}" in
    show|"")
        show_version
        ;;
    patch)
        do_release "patch"
        ;;
    minor)
        do_release "minor"
        ;;
    major)
        do_release "major"
        ;;
    *)
        echo "Uso: $0 [show|patch|minor|major]"
        echo ""
        echo "Comandos:"
        echo "  show   - Mostra versão atual (padrão)"
        echo "  patch  - Incrementa versão patch (0.0.1)"
        echo "  minor  - Incrementa versão minor (0.1.0)"
        echo "  major  - Incrementa versão major (1.0.0)"
        exit 1
        ;;
esac

