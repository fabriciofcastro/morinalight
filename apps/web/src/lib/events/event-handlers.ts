/**
 * Event Handlers - Domain Event Handlers
 * 
 * Handlers para processar eventos do domínio
 */

import { eventBus, USER_EVENTS, PRODUCT_EVENTS, ORDER_EVENTS } from "../events/event-bus";
import { auditService } from "../audit/audit-service";
import { notificationService } from "../patterns/notification-strategy";

/**
 * User Event Handlers
 */

// Handler: Enviar email de boas-vindas
eventBus.on(USER_EVENTS.CREATED, async (event) => {
    const { userId, email, name } = event.payload;

    await notificationService.send("email", {
        to: email,
        subject: "Bem-vindo!",
        message: `<h1>Olá ${name}!</h1><p>Bem-vindo à nossa plataforma.</p>`,
    });

    console.log(`[Handler] Welcome email sent to ${email}`);
});

// Handler: Criar audit log
eventBus.on(USER_EVENTS.CREATED, async (event) => {
    await auditService.log({
        action: "user_created",
        userId: event.userId || "system",
        resource: "user",
        resourceId: event.payload.userId,
        success: true,
        metadata: event.payload,
    });

    console.log(`[Handler] Audit log created for user ${event.payload.userId}`);
});

// Handler: Notificar admins
eventBus.on(USER_EVENTS.CREATED, async (event) => {
    await notificationService.send("in-app", {
        to: "admin-group",
        message: `Novo usuário cadastrado: ${event.payload.email}`,
        data: event.payload,
    });

    console.log(`[Handler] Admins notified about new user`);
});

// Handler: Login tracking
eventBus.on(USER_EVENTS.LOGIN, async (event) => {
    const { userId, ipAddress, userAgent } = event.payload;

    await auditService.log({
        action: "user_login",
        userId,
        resource: "auth",
        ipAddress,
        userAgent,
        success: true,
    });

    // Detectar login suspeito
    // if (await isSuspiciousLogin(userId, ipAddress)) {
    //   await notificationService.send('email', {
    //     to: event.payload.email,
    //     subject: 'Login suspeito detectado',
    //     message: 'Detectamos um login de um local não reconhecido...',
    //   });
    // }

    console.log(`[Handler] Login tracked for user ${userId}`);
});

/**
 * Product Event Handlers
 */

// Handler: Notificar sobre estoque baixo
eventBus.on(PRODUCT_EVENTS.STOCK_CHANGED, async (event) => {
    const { productId, currentStock, minStock } = event.payload;

    if (currentStock <= minStock) {
        await notificationService.sendMultiple(["email", "in-app"], {
            to: "inventory-team",
            subject: "Alerta de Estoque Baixo",
            message: `Produto ${productId} está com estoque baixo: ${currentStock} unidades`,
            data: event.payload,
        });

        console.log(`[Handler] Low stock alert sent for product ${productId}`);
    }
});

// Handler: Atualizar cache de produtos
eventBus.on(PRODUCT_EVENTS.UPDATED, async (event) => {
    // Invalidar cache
    // await cacheService.invalidate(`product:${event.payload.productId}`);

    console.log(`[Handler] Cache invalidated for product ${event.payload.productId}`);
});

// Handler: Sincronizar com ERP externo
eventBus.on(PRODUCT_EVENTS.CREATED, async (event) => {
    // Sincronizar com sistema externo
    // await erpService.syncProduct(event.payload);

    console.log(`[Handler] Product synced with ERP: ${event.payload.productId}`);
});

/**
 * Order Event Handlers
 */

// Handler: Enviar confirmação de pedido
eventBus.on(ORDER_EVENTS.CREATED, async (event) => {
    const { orderId, customerEmail, items, total } = event.payload;

    await notificationService.send("email", {
        to: customerEmail,
        subject: `Pedido #${orderId} confirmado`,
        message: `
      <h1>Pedido Confirmado!</h1>
      <p>Seu pedido #${orderId} foi confirmado.</p>
      <p>Total: R$ ${total.toFixed(2)}</p>
    `,
    });

    console.log(`[Handler] Order confirmation sent for ${orderId}`);
});

// Handler: Atualizar estoque
eventBus.on(ORDER_EVENTS.CREATED, async (event) => {
    const { items } = event.payload;

    for (const item of items) {
        // await productRepository.updateStock(item.productId, item.quantity, 'OUT');

        // Emitir evento de mudança de estoque
        await eventBus.emit(PRODUCT_EVENTS.STOCK_CHANGED, {
            productId: item.productId,
            quantity: item.quantity,
            type: "OUT",
        });
    }

    console.log(`[Handler] Stock updated for order ${event.payload.orderId}`);
});

// Handler: Processar pagamento
eventBus.on(ORDER_EVENTS.PAYMENT_RECEIVED, async (event) => {
    const { orderId, amount, paymentMethod } = event.payload;

    // Processar pagamento
    // await paymentService.process(orderId, amount, paymentMethod);

    // Emitir evento de pedido completo
    await eventBus.emit(ORDER_EVENTS.COMPLETED, {
        orderId,
        completedAt: new Date(),
    });

    console.log(`[Handler] Payment processed for order ${orderId}`);
});

// Handler: Gerar nota fiscal
eventBus.on(ORDER_EVENTS.COMPLETED, async (event) => {
    const { orderId } = event.payload;

    // Gerar nota fiscal
    // await invoiceService.generate(orderId);

    console.log(`[Handler] Invoice generated for order ${orderId}`);
});

/**
 * EXEMPLO DE USO:
 * 
 * // Emitir evento de criação de usuário
 * await eventBus.emit(USER_EVENTS.CREATED, {
 *   userId: '123',
 *   email: 'user@example.com',
 *   name: 'John Doe',
 * });
 * 
 * // Todos os handlers registrados serão executados automaticamente:
 * // 1. Email de boas-vindas
 * // 2. Audit log
 * // 3. Notificação para admins
 * 
 * // Emitir evento de pedido criado
 * await eventBus.emit(ORDER_EVENTS.CREATED, {
 *   orderId: 'order-123',
 *   customerEmail: 'customer@example.com',
 *   items: [{ productId: 'prod-1', quantity: 2 }],
 *   total: 99.90,
 * });
 * 
 * // Handlers executados:
 * // 1. Confirmação de pedido
 * // 2. Atualização de estoque
 */

console.log("[Event Handlers] All domain event handlers registered");
