/**
 * Query Builder Pattern
 * 
 * Constrói queries complexas de forma fluente e type-safe
 */

type WhereOperator = "=" | "!=" | ">" | ">=" | "<" | "<=" | "IN" | "NOT IN" | "LIKE" | "BETWEEN";
type OrderDirection = "asc" | "desc";

interface WhereClause {
    field: string;
    operator: WhereOperator;
    value: any;
    logicalOperator?: "AND" | "OR";
}

interface JoinClause {
    type: "INNER" | "LEFT" | "RIGHT" | "FULL";
    table: string;
    on: string;
}

interface OrderByClause {
    field: string;
    direction: OrderDirection;
}

/**
 * Query Builder para construir queries SQL de forma fluente
 */
export class QueryBuilder {
    private selectFields: string[] = ["*"];
    private fromTable?: string;
    private whereClauses: WhereClause[] = [];
    private joinClauses: JoinClause[] = [];
    private orderByClauses: OrderByClause[] = [];
    private limitValue?: number;
    private offsetValue?: number;
    private groupByFields: string[] = [];
    private havingClauses: WhereClause[] = [];

    /**
     * SELECT fields
     */
    select(...fields: string[]): this {
        this.selectFields = fields.length > 0 ? fields : ["*"];
        return this;
    }

    /**
     * FROM table
     */
    from(table: string): this {
        this.fromTable = table;
        return this;
    }

    /**
     * WHERE field = value
     */
    where(field: string, operator: WhereOperator, value: any): this {
        this.whereClauses.push({
            field,
            operator,
            value,
            logicalOperator: this.whereClauses.length > 0 ? "AND" : undefined,
        });
        return this;
    }

    /**
     * AND WHERE field = value
     */
    andWhere(field: string, operator: WhereOperator, value: any): this {
        this.whereClauses.push({
            field,
            operator,
            value,
            logicalOperator: "AND",
        });
        return this;
    }

    /**
     * OR WHERE field = value
     */
    orWhere(field: string, operator: WhereOperator, value: any): this {
        this.whereClauses.push({
            field,
            operator,
            value,
            logicalOperator: "OR",
        });
        return this;
    }

    /**
     * WHERE field IN (values)
     */
    whereIn(field: string, values: any[]): this {
        return this.where(field, "IN", values);
    }

    /**
     * WHERE field BETWEEN start AND end
     */
    whereBetween(field: string, start: any, end: any): this {
        return this.where(field, "BETWEEN", [start, end]);
    }

    /**
     * JOIN table ON condition
     */
    join(type: JoinClause["type"], table: string, on: string): this {
        this.joinClauses.push({ type, table, on });
        return this;
    }

    /**
     * INNER JOIN
     */
    innerJoin(table: string, on: string): this {
        return this.join("INNER", table, on);
    }

    /**
     * LEFT JOIN
     */
    leftJoin(table: string, on: string): this {
        return this.join("LEFT", table, on);
    }

    /**
     * ORDER BY field direction
     */
    orderBy(field: string, direction: OrderDirection = "asc"): this {
        this.orderByClauses.push({ field, direction });
        return this;
    }

    /**
     * GROUP BY fields
     */
    groupBy(...fields: string[]): this {
        this.groupByFields = fields;
        return this;
    }

    /**
     * HAVING (usado com GROUP BY)
     */
    having(field: string, operator: WhereOperator, value: any): this {
        this.havingClauses.push({
            field,
            operator,
            value,
            logicalOperator: this.havingClauses.length > 0 ? "AND" : undefined,
        });
        return this;
    }

    /**
     * LIMIT
     */
    limit(value: number): this {
        this.limitValue = value;
        return this;
    }

    /**
     * OFFSET
     */
    offset(value: number): this {
        this.offsetValue = value;
        return this;
    }

    /**
     * Pagination helper
     */
    paginate(page: number, perPage: number): this {
        this.limit(perPage);
        this.offset((page - 1) * perPage);
        return this;
    }

    /**
     * Construir SQL string
     */
    toSQL(): string {
        if (!this.fromTable) {
            throw new Error("FROM table is required");
        }

        let sql = `SELECT ${this.selectFields.join(", ")}`;
        sql += ` FROM ${this.fromTable}`;

        // JOINS
        for (const join of this.joinClauses) {
            sql += ` ${join.type} JOIN ${join.table} ON ${join.on}`;
        }

        // WHERE
        if (this.whereClauses.length > 0) {
            sql += " WHERE ";
            sql += this.whereClauses
                .map((clause, index) => {
                    let condition = "";
                    if (index > 0 && clause.logicalOperator) {
                        condition += ` ${clause.logicalOperator} `;
                    }

                    if (clause.operator === "IN" || clause.operator === "NOT IN") {
                        const values = Array.isArray(clause.value) ? clause.value : [clause.value];
                        condition += `${clause.field} ${clause.operator} (${values.map(v => typeof v === "string" ? `'${v}'` : v).join(", ")})`;
                    } else if (clause.operator === "BETWEEN") {
                        const [start, end] = clause.value;
                        condition += `${clause.field} BETWEEN ${start} AND ${end}`;
                    } else {
                        const value = typeof clause.value === "string" ? `'${clause.value}'` : clause.value;
                        condition += `${clause.field} ${clause.operator} ${value}`;
                    }

                    return condition;
                })
                .join("");
        }

        // GROUP BY
        if (this.groupByFields.length > 0) {
            sql += ` GROUP BY ${this.groupByFields.join(", ")}`;
        }

        // HAVING
        if (this.havingClauses.length > 0) {
            sql += " HAVING ";
            sql += this.havingClauses
                .map((clause, index) => {
                    let condition = "";
                    if (index > 0 && clause.logicalOperator) {
                        condition += ` ${clause.logicalOperator} `;
                    }
                    const value = typeof clause.value === "string" ? `'${clause.value}'` : clause.value;
                    condition += `${clause.field} ${clause.operator} ${value}`;
                    return condition;
                })
                .join("");
        }

        // ORDER BY
        if (this.orderByClauses.length > 0) {
            sql += " ORDER BY ";
            sql += this.orderByClauses
                .map(clause => `${clause.field} ${clause.direction.toUpperCase()}`)
                .join(", ");
        }

        // LIMIT
        if (this.limitValue !== undefined) {
            sql += ` LIMIT ${this.limitValue}`;
        }

        // OFFSET
        if (this.offsetValue !== undefined) {
            sql += ` OFFSET ${this.offsetValue}`;
        }

        return sql;
    }

    /**
     * Retorna objeto compatível com Prisma
     */
    toPrisma(): any {
        const where: any = {};

        for (const clause of this.whereClauses) {
            if (clause.operator === "=") {
                where[clause.field] = clause.value;
            } else if (clause.operator === ">") {
                where[clause.field] = { gt: clause.value };
            } else if (clause.operator === ">=") {
                where[clause.field] = { gte: clause.value };
            } else if (clause.operator === "<") {
                where[clause.field] = { lt: clause.value };
            } else if (clause.operator === "<=") {
                where[clause.field] = { lte: clause.value };
            } else if (clause.operator === "IN") {
                where[clause.field] = { in: clause.value };
            } else if (clause.operator === "LIKE") {
                where[clause.field] = { contains: clause.value };
            }
        }

        const orderBy: any = {};
        for (const clause of this.orderByClauses) {
            orderBy[clause.field] = clause.direction;
        }

        return {
            where,
            orderBy,
            take: this.limitValue,
            skip: this.offsetValue,
        };
    }
}

/**
 * EXEMPLO DE USO:
 * 
 * // Query simples
 * const query = new QueryBuilder()
 *   .select("id", "name", "email")
 *   .from("users")
 *   .where("status", "=", "active")
 *   .andWhere("age", ">=", 18)
 *   .orderBy("name", "asc")
 *   .limit(10);
 * 
 * console.log(query.toSQL());
 * // SELECT id, name, email FROM users WHERE status = 'active' AND age >= 18 ORDER BY name ASC LIMIT 10
 * 
 * // Query com JOIN
 * const ordersQuery = new QueryBuilder()
 *   .select("orders.*", "users.name as customer_name")
 *   .from("orders")
 *   .innerJoin("users", "orders.user_id = users.id")
 *   .where("orders.status", "=", "pending")
 *   .orderBy("orders.created_at", "desc");
 * 
 * // Paginação
 * const paginatedQuery = new QueryBuilder()
 *   .select("*")
 *   .from("products")
 *   .where("price", ">", 100)
 *   .paginate(2, 20); // página 2, 20 itens por página
 * 
 * // Usar com Prisma
 * const prismaQuery = new QueryBuilder()
 *   .from("users")
 *   .where("status", "=", "active")
 *   .orderBy("createdAt", "desc")
 *   .limit(10)
 *   .toPrisma();
 * 
 * const users = await prisma.user.findMany(prismaQuery);
 */
