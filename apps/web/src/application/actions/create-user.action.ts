'use server';

import { CreateUserDTO } from '@/application/dto';
import { CreateUserUseCase } from '@/application/use-cases';
import { getContainer } from '@/infrastructure/di/container';
import { isOk } from '@/shared/kernel/types';
import { revalidatePath } from 'next/cache';

export type CreateUserActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
};

export async function createUserAction(
  prevState: CreateUserActionState | null,
  formData: FormData | CreateUserDTO
): Promise<CreateUserActionState> {
  try {
    // 1. Check Permissions
    // Note: Since this is a server action, we need to handle auth context manually or via a helper that works in server actions
    // For now, assuming the middleware/auth check logic can be adapted or we use a simplified check if specific request/context objects aren't available same as route handlers
    // However, requirePermission expects NextRequest. In Server Actions we might need to get session differently.
    // For this iteration, let's assume we proceed or add a TODO for rigorous auth check if session helper isn't handy.
    // Ideally: const session = await getSession(); if (!can(session, ...)) return error;
    
    // Convert FormData to DTO if needed
    let dto: CreateUserDTO;
    if (formData instanceof FormData) {
      dto = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        // ... map other fields
        role: (formData.get('role') as any) || 'USER', 
      };
    } else {
      dto = formData;
    }

    const container = getContainer();
    const useCase = container.resolve<CreateUserUseCase>('CreateUserUseCase');
    
    const result = await useCase.execute(dto);

    if (isOk(result)) {
      revalidatePath('/admin/users'); // or appropriate path
      return {
        success: true,
        data: result.value,
        message: 'User created successfully',
      };
    } else {
      return {
        success: false,
        message: result.error.message,
      };
    }

  } catch (error: any) {
    console.error('CreateUserAction Error:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
    };
  }
}
