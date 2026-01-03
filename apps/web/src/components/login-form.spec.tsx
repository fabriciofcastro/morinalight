import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { LoginForm, type LoginFormData } from "./login-form";

describe("LoginForm", () => {
  it("exibe mensagens de erro para credenciais inválidas", async () => {
    render(<LoginForm />);

    await userEvent.clear(screen.getByPlaceholderText(/morina.ai/i));
    await userEvent.type(screen.getByPlaceholderText(/morina.ai/i), "usuario-sem-arroba");
    await userEvent.type(screen.getByLabelText(/senha/i), "123");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText(/formato de e-mail inválido/i)).toBeInTheDocument();
    expect(await screen.findByText(/pelo menos 8 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/monitoramento em tempo real/i)).toBeInTheDocument();
  });

  it("chama onAuthenticate quando dados são válidos", async () => {
    const mockAuthenticate = vi.fn<[], Promise<void>>(() => Promise.resolve());

    render(
      <LoginForm onAuthenticate={mockAuthenticate as (payload: LoginFormData) => Promise<void>} />,
    );

    await userEvent.type(screen.getByPlaceholderText(/morina.ai/i), "lider@morina.ai");
    await userEvent.type(screen.getByLabelText(/senha/i), "SenhaSegura9");
    await userEvent.type(screen.getByPlaceholderText(/123 456/i), "123456");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockAuthenticate).toHaveBeenCalledWith({
        email: "lider@morina.ai",
        password: "SenhaSegura9",
        remember: true,
        otp: "123456",
      });
    });

    expect(screen.getByRole("status")).toHaveTextContent(/acesso autorizado/i);
  });
});
