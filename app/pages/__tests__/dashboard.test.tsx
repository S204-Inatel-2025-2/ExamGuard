import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import DashboardHome from "../dashboard";
import { expect, test, describe, vi } from "vitest";

const mockNavigate = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("DashboardHome", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDashboard = () =>
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route
            path="/dashboard/video/:id"
            element={<div>Video Details Page</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

  test("Renderiza o card de status com contagem correta", async () => {
    renderDashboard();
    const totalVideosCard = (
      await screen.findByText("Total de Vídeos")
    ).closest('div[data-slot="card"]');
    const processadosCard = (await screen.findByText("Processados")).closest(
      'div[data-slot="card"]',
    );
    const emProcessoCard = (await screen.findByText("Em Processo")).closest(
      'div[data-slot="card"]',
    );

    await waitFor(() => {
      expect(within(totalVideosCard!).getByText("5")).toBeInTheDocument();
      expect(within(processadosCard!).getByText("2")).toBeInTheDocument();
      expect(within(emProcessoCard!).getByText("2")).toBeInTheDocument();
    });
  });

  test("Renderiza a tabela com todos os vídeos inicialmente", async () => {
    renderDashboard();
    const tableContainer = screen
      .getByRole("table")
      .closest("div.hidden.md\\:block");
    expect(tableContainer).toBeInTheDocument();

    await waitFor(() => {
      expect(
        within(tableContainer!).getByText("Prova_Matematica_Turma_A.mp4"),
      ).toBeInTheDocument();
      expect(
        within(tableContainer!).getByText("Exame_Fisica_Online.mp4"),
      ).toBeInTheDocument();
    });
  });

  test("Filtra a lista de vídeos quando usuário digita na pesquisa", async () => {
    renderDashboard();
    const searchInput = screen.getByPlaceholderText(
      "Buscar por nome do arquivo...",
    );
    await userEvent.type(searchInput, "Matematica");

    const tableContainer = screen
      .getByRole("table")
      .closest("div.hidden.md\\:block");
    expect(tableContainer).toBeInTheDocument();

    await waitFor(() => {
      expect(
        within(tableContainer!).getByText("Prova_Matematica_Turma_A.mp4"),
      ).toBeInTheDocument();
      expect(
        within(tableContainer!).queryByText("Exame_Fisica_Online.mp4"),
      ).not.toBeInTheDocument();
    });
  });

  test('Mostra "nenhum video encontrado" quando nenhum vídeo é encontrado', async () => {
    renderDashboard();
    const searchInput = screen.getByPlaceholderText(
      "Buscar por nome do arquivo...",
    );
    await userEvent.type(searchInput, "NonExistentVideo");

    const tableContainer = screen
      .getByRole("table")
      .closest("div.hidden.md\\:block");
    expect(tableContainer).toBeInTheDocument();

    await waitFor(() => {
      expect(
        within(tableContainer!).getByText("Nenhum vídeo encontrado"),
      ).toBeInTheDocument();
    });
  });

  test('Navega pra upload de video quando clica em "envair video"', async () => {
    renderDashboard();
    const uploadButton = screen.getByRole("button", { name: /enviar vídeo/i });
    await userEvent.click(uploadButton);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/upload-video");
  });

  test('Navega pro streaming quando clica em "Streaming ao vivo"', async () => {
    renderDashboard();
    const streamingButton = screen.getByRole("button", {
      name: /streaming ao vivo/i,
    });
    await userEvent.click(streamingButton);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/upload-streaming");
  });

  test("Navega pra pagina de detalhe quando o link é clicado", async () => {
    renderDashboard();
    const tableContainer = screen
      .getByRole("table")
      .closest("div.hidden.md\\:block");
    expect(tableContainer).toBeInTheDocument();

    const videoLink = within(tableContainer!).getByText(
      "Prova_Matematica_Turma_A.mp4",
    );
    await userEvent.click(videoLink);
    expect(videoLink).toHaveAttribute("href", "/dashboard/video/1");
  });
});
