import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useParams } from "react-router";
import Record from "../record";
import { expect, test, describe, vi, Mock } from "vitest";

const mockNavigate = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: vi.fn(),
  };
});

describe("Página de Registro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRecordPage = (id: string) => {
    (useParams as Mock).mockReturnValue({ id });
    return render(
      <MemoryRouter initialEntries={[`/dashboard/video/${id}`]}>
        <Routes>
          <Route path="/dashboard/video/:id" element={<Record />} />
        </Routes>
      </MemoryRouter>,
    );
  };

  test('Renderiza "Registro não encontrado" para um ID inválido', () => {
    renderRecordPage("999");
    expect(screen.getByText("Registro não encontrado")).toBeInTheDocument();
  });

  test('Renderiza corretamente os detalhes de um vídeo "Processado"', async () => {
    renderRecordPage("1");
    const title = await screen.findByText("Prova_Matematica_Turma_A.mp4");
    const mainCard = title.closest('div[data-slot="card"]');
    expect(mainCard).toBeInTheDocument();

    const cardHeader = mainCard!.querySelector('[data-slot="card-header"]');
    expect(cardHeader).toBeInTheDocument();

    expect(within(cardHeader!).getByText("Processado")).toBeInTheDocument();
    expect(screen.getByText("1.2 GB")).toBeInTheDocument();
    expect(screen.getByText("Highlights Detectados")).toBeInTheDocument();
    expect(
      screen.getByText("Comportamento suspeito detectado"),
    ).toBeInTheDocument();
  });

  test('Renderiza corretamente um vídeo "Processando"', async () => {
    renderRecordPage("2");
    const title = await screen.findByText("Exame_Fisica_Online.mp4");
    const mainCard = title.closest('div[data-slot="card"]');
    expect(mainCard).toBeInTheDocument();

    const cardHeader = mainCard!.querySelector('[data-slot="card-header"]');
    expect(cardHeader).toBeInTheDocument();

    expect(within(cardHeader!).getByText("Processando")).toBeInTheDocument();
    expect(screen.getByText("Em andamento...")).toBeInTheDocument();
    expect(screen.queryByText("Highlights Detectados")).not.toBeInTheDocument();
  });

  test('Renderiza corretamente um vídeo com status "Erro"', async () => {
    renderRecordPage("4");
    const title = await screen.findByText("Teste_Historia_EAD.mp4");
    const mainCard = title.closest('div[data-slot="card"]');
    expect(mainCard).toBeInTheDocument();

    const cardHeader = mainCard!.querySelector('[data-slot="card-header"]');
    expect(cardHeader).toBeInTheDocument();

    expect(within(cardHeader!).getByText("Erro")).toBeInTheDocument();
    expect(
      screen.getByText("Erro durante o processamento. Tente enviar novamente."),
    ).toBeInTheDocument();
  });

  test("Abre e fecha o modal de vídeo ao clicar em um destaque", async () => {
    renderRecordPage("1");
    const viewButton = screen.getAllByRole("button", { name: /ver/i })[0];
    await userEvent.click(viewButton);

    const modal = await screen.findByRole("heading", {
      name: /comportamento suspeito detectado/i,
    });
    const modalContainer = modal.closest('div[class*="fixed"]');
    expect(modalContainer).toBeInTheDocument();

    await waitFor(() => {
      const videoElement = modalContainer?.querySelector("video");
      expect(videoElement).toBeInTheDocument();
      expect(videoElement).toHaveAttribute(
        "src",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      );
    });

    const closeButton = within(modalContainer!).getByRole("button");
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(modalContainer).not.toBeInTheDocument();
    });
  });

  test('O botão "Voltar ao Dashboard" navega corretamente', async () => {
    renderRecordPage("1");
    const backButton = await screen.findByRole("button", { name: "" });
    await userEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
});
