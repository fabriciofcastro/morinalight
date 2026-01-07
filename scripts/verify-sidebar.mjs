import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const WEB_APP_DIR = 'apps/web/src/app';
const SIDEBAR_FILE = 'apps/web/src/components/layout/EnterpriseSidebar.tsx';

// 1. Get all pages
function getAllPages() {
    const output = execSync(`find ${WEB_APP_DIR} -name "page.tsx"`).toString();
    return output.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
            let route = line
                .replace(WEB_APP_DIR, '')
                .replace('/page.tsx', '')
                .replace(/\/\(app\)/, '')
                .replace(/\/\(auth\)/, '')
                .replace(/\/\(dashboard\)/, '')
                .replace(/\/\(legal\)/, '')
                .replace(/\/\(dashboard\)/, '');

            if (route === '') route = '/';
            return { path: line, route };
        });
}

// 2. Filter eligible pages
function isEligible(route) {
    // Ignore auth/legal/dynamic routes
    if (route.includes('[id]') || route.includes('[token]') || route.includes('[subdepartmentId]')) return false;
    if (route.startsWith('/auth') || route.startsWith('/forgot-password') || route.startsWith('/login') || route.startsWith('/register') || route.startsWith('/reset-password') || route.startsWith('/select-organization')) return false;

    // Potential ignore list (legal/system)
    const ignored = [
        '/antifraude', '/cookies', '/lei-representante', '/lgpd', '/privacidade', '/retencao-logs', '/termos', '/vinculo-empregaticio',
        '/organizations', '/organizations/new'
    ];
    if (ignored.includes(route)) return false;

    return true;
}

// 3. Get sidebar paths
function getSidebarPaths() {
    const content = fs.readFileSync(SIDEBAR_FILE, 'utf8');
    // Find both path: "..." and href="..."
    const pathMatches = content.match(/path:\s*"([^"]+)"/g) || [];
    const hrefMatches = content.match(/href=\{?"([^"]+)"\}?/g) || [];

    const paths = [
        ...pathMatches.map(m => m.match(/"([^"]+)"/)[1]),
        ...hrefMatches.map(m => m.match(/"([^"]+)"/)[1])
    ];

    return [...new Set(paths)];
}

const allPages = getAllPages();
const eligiblePages = allPages.filter(p => isEligible(p.route));
const sidebarPaths = getSidebarPaths();

console.log(`Total pages found in ${WEB_APP_DIR}: ${allPages.length}`);
console.log(`Eligible pages for sidebar: ${eligiblePages.length}`);
console.log(`Unique paths/hrefs found in sidebar: ${sidebarPaths.length}`);

const missing = eligiblePages.filter(p => !sidebarPaths.includes(p.route));

if (missing.length > 0) {
    console.log('\n❌ Missing pages in sidebar:');
    missing.forEach(p => console.log(`- ${p.route} (${p.path})`));
} else {
    console.log('\n✅ All eligible pages are in the sidebar!');
}

console.log('\nSummary:');
console.log(`Missing: ${missing.length}`);
console.log(`Covered: ${eligiblePages.length - missing.length}`);
console.log(`Coverage: ${((eligiblePages.length - missing.length) / eligiblePages.length * 100).toFixed(2)}%`);

// Also list paths in sidebar that don't match any route
const orphans = sidebarPaths.filter(p => !eligiblePages.map(ep => ep.route).includes(p));
if (orphans.length > 0) {
    console.log('\n⚠️ Sidebar items without matching (eligible) route:');
    orphans.forEach(p => console.log(`- ${p}`));
}
