'use client';

import type { CreateUserDTO } from '@/application/dto';
import { useCreateUser } from '@/presentation/hooks';
import { useState } from 'react';

/**
 * Create User Form Component
 * 
 * Componente puro de UI que usa hook de apresentação.
 * NÃO contém lógica de negócio.
 * 
 * Responsabilidades:
 * - Renderizar UI
 * - Capturar input do usuário
 * - Delegar ações para hooks
 */

export function CreateUserForm() {
  const { mutate, isPending, isError, error } = useCreateUser();
  
  const [formData, setFormData] = useState<CreateUserDTO>({
    email: '',
    name: '',
    password: '',
    role: 'user',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    mutate(formData, {
      onSuccess: (user) => {
        console.log('User created:', user);
        // Reset form
        setFormData({
          email: '',
          name: '',
          password: '',
          role: 'user',
        });
        alert(`User ${user.name} created successfully!`);
      },
      onError: (err) => {
        console.error('Failed to create user:', err);
        alert(`Error: ${err.message}`);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Create New User</h2>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          required
          minLength={3}
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          required
          minLength={8}
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium mb-1">
          Role
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="user">User</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      {isError && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error?.message || 'An error occurred'}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
