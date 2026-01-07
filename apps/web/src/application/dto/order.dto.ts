export interface CreateOrderDTO {
    customerId: string;
    customerName: string;
    customerEmail: string;
    paymentMethod: string;
    items: Array<{
        id: string;
        productId: string;
        productName: string;
        sku: string;
        quantity: number;
        unitPrice: number;
        discount?: number;
    }>;
    shippingAddress: {
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        complement?: string;
    };
    billingAddress: {
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        complement?: string;
    };
    shipping?: number;
    tax?: number;
    discount?: number;
    notes?: string;
}

export interface OrderResponseDTO {
    id: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    items: any[];
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
    shippingAddress: any;
    billingAddress: any;
    createdAt: string;
    updatedAt: string;
    notes?: string;
    confirmedAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
}
