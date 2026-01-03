/**
 * Internationalization Configuration
 * Supports EN, PT-BR, and ES
 */

export const locales = ['en', 'pt-BR', 'es'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'pt-BR';

export const localeNames: Record<Locale, string> = {
    'en': 'English',
    'pt-BR': 'Português',
    'es': 'Español',
};

// Playbook translations
export const translations = {
    'en': {
        playbook: {
            hero: {
                title: 'Transform Your Business',
                subtitle: 'Enterprise-grade playbooks for digital transformation',
                cta: {
                    primary: 'Get Started',
                    secondary: 'Explore Playbooks',
                },
            },
            features: {
                title: 'Powerful Features',
                subtitle: 'Everything you need to succeed',
            },
            metrics: {
                title: 'Proven Results',
                subtitle: 'Data-driven success',
            },
            cta: {
                title: 'Ready to Transform?',
                subtitle: 'Join thousands of companies already using our platform',
                form: {
                    email: 'Email address',
                    company: 'Company name',
                    submit: 'Start Free Trial',
                },
            },
        },
    },
    'pt-BR': {
        playbook: {
            hero: {
                title: 'Transforme Seu Negócio',
                subtitle: 'Playbooks enterprise para transformação digital',
                cta: {
                    primary: 'Começar Agora',
                    secondary: 'Explorar Playbooks',
                },
            },
            features: {
                title: 'Recursos Poderosos',
                subtitle: 'Tudo que você precisa para ter sucesso',
            },
            metrics: {
                title: 'Resultados Comprovados',
                subtitle: 'Sucesso baseado em dados',
            },
            cta: {
                title: 'Pronto para Transformar?',
                subtitle: 'Junte-se a milhares de empresas que já usam nossa plataforma',
                form: {
                    email: 'Endereço de e-mail',
                    company: 'Nome da empresa',
                    submit: 'Iniciar Teste Grátis',
                },
            },
        },
    },
    'es': {
        playbook: {
            hero: {
                title: 'Transforme Su Negocio',
                subtitle: 'Playbooks empresariales para transformación digital',
                cta: {
                    primary: 'Comenzar Ahora',
                    secondary: 'Explorar Playbooks',
                },
            },
            features: {
                title: 'Características Poderosas',
                subtitle: 'Todo lo que necesita para tener éxito',
            },
            metrics: {
                title: 'Resultados Comprobados',
                subtitle: 'Éxito basado en datos',
            },
            cta: {
                title: '¿Listo para Transformar?',
                subtitle: 'Únase a miles de empresas que ya usan nuestra plataforma',
                form: {
                    email: 'Dirección de correo electrónico',
                    company: 'Nombre de la empresa',
                    submit: 'Iniciar Prueba Gratuita',
                },
            },
        },
    },
};

export function getTranslation(locale: Locale, key: string): string {
    const keys = key.split('.');
    let value: any = translations[locale];

    for (const k of keys) {
        value = value?.[k];
    }

    return value || key;
}
