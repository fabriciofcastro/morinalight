import { CreateUserForm } from '@/presentation/components/create-user-form';
import Link from 'next/link';

/**
 * New User Page (Clean Architecture Demo)
 * 
 * Página de exemplo demonstrando Clean Architecture.
 * Usa componente de apresentação que consome use cases via hooks.
 */

export default function CleanArchNewUserPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Link
          href="/clean-arch-demo/users"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
        >
          ← Back to Users List
        </Link>
        <h1 className="text-3xl font-bold mb-2">Clean Architecture Demo</h1>
        <p className="text-muted-foreground">
          Esta página demonstra a nova arquitetura implementada.
        </p>
      </div>

      <CreateUserForm />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Arquitetura</h2>
        <ul className="space-y-2 text-sm">
          <li>✅ <strong>Domain Layer</strong>: UserEntity, Email, UserRole</li>
          <li>✅ <strong>Application Layer</strong>: CreateUserUseCase</li>
          <li>✅ <strong>Infrastructure Layer</strong>: PrismaUserRepository</li>
          <li>✅ <strong>Presentation Layer</strong>: useCreateUser hook</li>
          <li>✅ <strong>Composition Root</strong>: DI Container em providers.tsx</li>
        </ul>
      </div>
    </div>
  );
}
