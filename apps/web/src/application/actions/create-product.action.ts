'use server';

import { CreateProductDTO } from '@/application/dto';
import { CreateProductUseCase } from '@/application/use-cases';
import { getContainer } from '@/infrastructure/di/container';
import { isOk } from '@/shared/kernel/types';
import { revalidatePath } from 'next/cache';

export type CreateProductActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
};

export async function createProductAction(
  prevState: CreateProductActionState | null,
  formData: FormData | CreateProductDTO
): Promise<CreateProductActionState> {
  try {
    // TODO: Add Auth/Permission Check here
    // const session = await getSession();
    // if (!session || !checkPermission(...)) return { success: false, message: 'Unauthorized' };

    let dto: CreateProductDTO;
    
    // Basic FormData mapping - customize as needed based on exact form fields
    if (formData instanceof FormData) {
       // Parse number fields carefully
       const costPrice = parseFloat(formData.get('costPrice') as string) || 0;
       const sellingPrice = parseFloat(formData.get('sellingPrice') as string) || 0;
       const currentStock = parseInt(formData.get('currentStock') as string) || 0;
       const minStock = parseInt(formData.get('minStock') as string) || 0;
       const maxStock = parseInt(formData.get('maxStock') as string) || 0;

       dto = {
        sku: formData.get('sku') as string,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        categoryId: formData.get('categoryId') as string,
        brand: formData.get('brand') as string,
        unit: formData.get('unit') as string,
        status: (formData.get('status') as any) || 'ACTIVE',
        costPrice,
        sellingPrice,
        currentStock,
        minStock,
        maxStock,
        imageUrl: formData.get('imageUrl') as string,
      };
    } else {
      dto = formData;
    }

    const container = getContainer();
    const useCase = container.resolve<CreateProductUseCase>('CreateProductUseCase');
    
    const result = await useCase.execute(dto);

    if (isOk(result)) {
      revalidatePath('/catalogo/produtos'); 
      return {
        success: true,
        data: result.value,
        message: 'Product created successfully',
      };
    } else {
      return {
        success: false,
        message: result.error.message,
      };
    }

  } catch (error: any) {
    console.error('CreateProductAction Error:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
    };
  }
}
