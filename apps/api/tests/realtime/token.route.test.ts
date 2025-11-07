import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";

import { createServer } from "../../src/core/server/create-server";

describe("POST /realtime/token", () => {
  it("gera token quando REALTIME_SECRET configurado", async () => {
    process.env.REALTIME_SECRET = "supersecretkey123456";
    const app = await createServer();

    const response = await app.inject({
      method: "POST",
      url: "/realtime/token",
      headers: { "x-org-id": "org-1", "x-actor-id": "user-1" },
      payload: { expSeconds: 120 },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.token).toBeDefined();

    const secret = process.env.REALTIME_SECRET;
    expect(secret).toBeDefined();
    const decoded = jwt.verify(body.token, secret as string);
    expect(decoded).toMatchObject({ orgId: "org-1", actorId: "user-1", type: "realtime" });
  });
});
