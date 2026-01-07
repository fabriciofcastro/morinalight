'use client';

import { useUsers } from '@/presentation/hooks';
import Link from 'next/link';

/**
 * Users List Page (Clean Architecture Demo)
 * 
 * Demonstra query (read operation) usando Clean Architecture.
 */

export default function CleanArchUsersPage() {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">
          Error loading users: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Clean Architecture - Users</h1>
          <p className="text-muted-foreground">
            Lista de usuários usando ListUsersQuery (CQRS)
          </p>
        </div>
        <Link
          href="/users/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Create New User
        </Link>
      </div>

      <div className="grid gap-4">
        {users && users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 text-xs rounded bg-primary/10 text-primary">
                    {user.role}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No users found. Create one using the button above!
          </div>
        )}
      </div>
    </div>
  );
}
