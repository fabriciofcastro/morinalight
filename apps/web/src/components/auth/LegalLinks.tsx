import Link from 'next/link';

const legalLinks = [
    { href: '/lgpd', label: 'LGPD' },
    { href: '/termos', label: 'Termos' },
    { href: '/privacidade', label: 'Privacidade' },
    { href: '/cookies', label: 'Cookies' },
];

const complianceLinks = [
    { href: '/lei-representante', label: 'Lei 4.886/65' },
    { href: '/vinculo-empregaticio', label: 'Não Vínculo' },
];

export function LegalLinks() {
    return (
        <div className="flex justify-center">
            <div className="flex gap-6 text-[10px] font-semibold text-white/30">
                {legalLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="hover:text-white transition-colors cursor-pointer">
                        {link.label}
                    </Link>
                ))}
                {complianceLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="hover:text-white transition-colors cursor-pointer">
                        {link.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
