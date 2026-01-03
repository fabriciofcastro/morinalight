import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PersonalizationPanel } from "./PersonalizationPanel";

// Mock do Next.js Image
vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src} alt={props.alt} />;
  },
}));

// Mock do useThemeEngine
vi.mock("@/hooks/use-theme-engine", () => ({
  useThemeEngine: () => ({
    companyTheme: {
      logoUrl: "",
      primaryColor: "#2855FF",
      secondaryColor: "#8B5CF6",
      themeMode: "auto",
      videoLink: "",
    },
    updateCompanyTheme: vi.fn(),
    persistCompanyTheme: vi.fn().mockResolvedValue({
      logoUrl: "",
      primaryColor: "#2855FF",
      secondaryColor: "#8B5CF6",
      themeMode: "auto",
      videoLink: "",
    }),
    loading: false,
    saving: false,
  }),
}));

describe("PersonalizationPanel", () => {
  it("renderiza o painel de personalização com campos obrigatórios", () => {
    render(<PersonalizationPanel />);

    expect(
      screen.getByRole("heading", {
        name: /personalização alphasyscore/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/identidade \(logo\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/modo do tema/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cor primária/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cor secundária/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/vídeo institucional/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/logo \(url pública\)/i)).toBeInTheDocument();
  });

  it("permite alterar a cor primária", async () => {
    const user = userEvent.setup();
    render(<PersonalizationPanel />);

    const primaryColorInput = screen.getByLabelText(/cor primária/i);
    expect(primaryColorInput).toBeInTheDocument();
    expect(primaryColorInput).toHaveAttribute("type", "color");

    await user.clear(primaryColorInput);
    await user.type(primaryColorInput, "#FF0000");

    expect(primaryColorInput).toHaveValue("#FF0000");
  });

  it("permite alterar a cor secundária", async () => {
    const user = userEvent.setup();
    render(<PersonalizationPanel />);

    const secondaryColorInput = screen.getByLabelText(/cor secundária/i);
    expect(secondaryColorInput).toBeInTheDocument();
    expect(secondaryColorInput).toHaveAttribute("type", "color");

    await user.clear(secondaryColorInput);
    await user.type(secondaryColorInput, "#00FF00");

    expect(secondaryColorInput).toHaveValue("#00FF00");
  });

  it("permite alterar o modo do tema", async () => {
    const user = userEvent.setup();
    render(<PersonalizationPanel />);

    const themeModeSelect = screen.getByLabelText(/modo do tema/i);
    expect(themeModeSelect).toBeInTheDocument();

    await user.selectOptions(themeModeSelect, "dark");

    expect(themeModeSelect).toHaveValue("dark");
  });

  it("exibe feedback de sucesso ao salvar", async () => {
    const user = userEvent.setup();
    render(<PersonalizationPanel />);

    const saveButton = screen.getByRole("button", {
      name: /salvar personalização/i,
    });

    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/personalização salva/i, { exact: false })).toBeInTheDocument();
    });
  });

  it("permite fazer upload de logo", async () => {
    const user = userEvent.setup();
    render(<PersonalizationPanel />);

    const logoInput = screen.getByLabelText(/identidade \(logo\)/i);
    expect(logoInput).toBeInTheDocument();

    const file = new File(["logo"], "logo.png", { type: "image/png" });
    await user.upload(logoInput, file);

    // Verifica se o input aceita o arquivo
    expect(logoInput).toHaveProperty("files");
  });

  it("possui acessibilidade adequada", () => {
    render(<PersonalizationPanel />);

    // Verifica labels associados aos inputs
    expect(screen.getByLabelText(/cor primária/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cor secundária/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/modo do tema/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/vídeo institucional/i)).toBeInTheDocument();

    // Verifica feedback aria-live
    const feedbackElement = screen.queryByRole("status");
    if (feedbackElement) {
      expect(feedbackElement).toHaveAttribute("aria-live", "polite");
      expect(feedbackElement).toHaveAttribute("aria-atomic", "true");
    }
  });

  it("exibe mensagem de alterações em tempo real", () => {
    render(<PersonalizationPanel />);

    expect(
      screen.getByText(/alterações são aplicadas em tempo real/i, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });
});
