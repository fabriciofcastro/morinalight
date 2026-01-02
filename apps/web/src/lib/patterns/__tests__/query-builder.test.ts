/**
 * Query Builder Tests
 */

import { describe, it, expect } from "vitest";
import { QueryBuilder } from "../query-builder";

describe("Query Builder Pattern", () => {
    describe("Basic SELECT queries", () => {
        it("should build simple SELECT query", () => {
            const query = new QueryBuilder()
                .select("id", "name", "email")
                .from("users")
                .toSQL();

            expect(query).toBe("SELECT id, name, email FROM users");
        });

        it("should select all fields with *", () => {
            const query = new QueryBuilder()
                .select()
                .from("users")
                .toSQL();

            expect(query).toBe("SELECT * FROM users");
        });
    });

    describe("WHERE clauses", () => {
        it("should build query with single WHERE clause", () => {
            const query = new QueryBuilder()
                .select("*")
                .from("users")
                .where("status", "=", "active")
                .toSQL();

            expect(query).toBe("SELECT * FROM users WHERE status = 'active'");
        });

        it("should build query with AND WHERE", () => {
            const query = new QueryBuilder()
                .select("*")
                .from("users")
                .where("status", "=", "active")
                .andWhere("age", ">=", 18)
                .toSQL();

            expect(query).toBe("SELECT * FROM users WHERE status = 'active' AND age >= 18");
        });

        it("should build query with OR WHERE", () => {
            const query = new QueryBuilder()
                .select("*")
                .from("users")
                .where("role", "=", "admin")
                .orWhere("role", "=", "manager")
                .toSQL();

            expect(query).toBe("SELECT * FROM users WHERE role = 'admin' OR role = 'manager'");
        });

        it("should handle IN operator", () => {
            const query = new QueryBuilder()
                .select("*")
                .from("products")
                .whereIn("category", ["electronics", "books"])
                .toSQL();

            expect(query).toBe("SELECT * FROM products WHERE category IN ('electronics', 'books')");
        });

        it("should handle BETWEEN operator", () => {
            const query = new QueryBuilder()
                .select("*")
                .from("orders")
                .whereBetween("total", 100, 500)
                .toSQL();

            expect(query).toBe("SELECT * FROM orders WHERE total BETWEEN 100 AND 500");
        });
    });

    describe("JOIN clauses", () => {
        it("should build INNER JOIN query", () => {
            const query = new QueryBuilder()
                .select("orders.*", "users.name")
                .from("orders")
                .innerJoin("users", "orders.user_id = users.id")
                .toSQL();

            expect(query).toBe("SELECT orders.*, users.name FROM orders INNER JOIN users ON orders.user_id = users.id");
        });

        it("should build LEFT JOIN query", () => {
            const query = new QueryBuilder()
                .select("*")
                .from("users")
                .leftJoin("orders", "users.id = orders.user_id")
                .toSQL();

            expect(query).toBe("SELECT * FROM users LEFT JOIN orders ON users.id = orders.user_id");
        });
    });

    describe("ORDER BY", () => {
        it("should order by single field ascending", () => {
            const query = new QueryBuilder()
                .select("*")
                .from("users")
                .orderBy("name", "asc")
                .toSQL();

            expect(query).toBe("SELECT * FROM users ORDER BY name ASC");
        });

        it("should order by multiple fields", () => {
            const query = new QueryBuilder()
                .select("*")
                .from("users")
                .orderBy("department", "asc")
                .orderBy("salary", "desc")
                .toSQL();

            expect(query).toBe("SELECT * FROM users ORDER BY department ASC, salary DESC");
        });
    });

    describe("LIMIT and OFFSET", () => {
        it("should add LIMIT", () => {
            const query = new QueryBuilder()
                .select("*")
                .from("users")
                .limit(10)
                .toSQL();

            expect(query).toBe("SELECT * FROM users LIMIT 10");
        });

        it("should add LIMIT and OFFSET", () => {
            const query = new QueryBuilder()
                .select("*")
                .from("users")
                .limit(10)
                .offset(20)
                .toSQL();

            expect(query).toBe("SELECT * FROM users LIMIT 10 OFFSET 20");
        });

        it("should handle pagination", () => {
            const query = new QueryBuilder()
                .select("*")
                .from("products")
                .paginate(2, 20) // page 2, 20 per page
                .toSQL();

            expect(query).toBe("SELECT * FROM products LIMIT 20 OFFSET 20");
        });
    });

    describe("GROUP BY and HAVING", () => {
        it("should add GROUP BY", () => {
            const query = new QueryBuilder()
                .select("department", "COUNT(*) as total")
                .from("employees")
                .groupBy("department")
                .toSQL();

            expect(query).toBe("SELECT department, COUNT(*) as total FROM employees GROUP BY department");
        });

        it("should add GROUP BY with HAVING", () => {
            const query = new QueryBuilder()
                .select("department", "COUNT(*) as total")
                .from("employees")
                .groupBy("department")
                .having("COUNT(*)", ">", 5)
                .toSQL();

            expect(query).toBe("SELECT department, COUNT(*) as total FROM employees GROUP BY department HAVING COUNT(*) > 5");
        });
    });

    describe("Complex queries", () => {
        it("should build complex query with all features", () => {
            const query = new QueryBuilder()
                .select("orders.id", "users.name", "SUM(orders.total) as total_spent")
                .from("orders")
                .innerJoin("users", "orders.user_id = users.id")
                .where("orders.status", "=", "completed")
                .andWhere("orders.total", ">=", 100)
                .groupBy("orders.id", "users.name")
                .having("SUM(orders.total)", ">", 1000)
                .orderBy("total_spent", "desc")
                .limit(10)
                .toSQL();

            expect(query).toContain("SELECT orders.id, users.name, SUM(orders.total) as total_spent");
            expect(query).toContain("INNER JOIN users ON orders.user_id = users.id");
            expect(query).toContain("WHERE orders.status = 'completed'");
            expect(query).toContain("GROUP BY orders.id, users.name");
            expect(query).toContain("HAVING SUM(orders.total) > 1000");
            expect(query).toContain("ORDER BY total_spent DESC");
            expect(query).toContain("LIMIT 10");
        });
    });

    describe("Prisma compatibility", () => {
        it("should convert to Prisma format", () => {
            const prismaQuery = new QueryBuilder()
                .from("users")
                .where("status", "=", "active")
                .andWhere("age", ">=", 18)
                .orderBy("createdAt", "desc")
                .limit(10)
                .offset(0)
                .toPrisma();

            expect(prismaQuery).toEqual({
                where: {
                    status: "active",
                    age: { gte: 18 },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 10,
                skip: 0,
            });
        });

        it("should handle IN operator in Prisma format", () => {
            const prismaQuery = new QueryBuilder()
                .from("products")
                .whereIn("category", ["electronics", "books"])
                .toPrisma();

            expect(prismaQuery.where.category).toEqual({ in: ["electronics", "books"] });
        });
    });

    describe("Error handling", () => {
        it("should throw error when FROM is missing", () => {
            const builder = new QueryBuilder().select("*");

            expect(() => builder.toSQL()).toThrow("FROM table is required");
        });
    });
});
