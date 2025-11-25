import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import DashboardHome from "../dashboard";
import { expect, test, describe, vi, beforeEach, type Mock } from "vitest";
import api from "~/services/axios-backend-client";
import { auth } from "~/utils/auth";

// Mock dos módulos
vi.mock("~/services/axios-backend-client", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("~/utils/auth", () => ({
  auth: {
    isAuthenticated: vi.fn(),
    getToken: vi.fn(),
  },
}));

const mockNavigate = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("DashboardHome", () => {
  const mockVideos = [
    {
      id: "1",
      title: "Prova_Matematica_Turma_A.mp4",
      original_filename: "Prova_Matematica_Turma_A.mp4",
      created_at: "2023-10-27T10:00:00Z",
      status: "SUCCESS",
      summary_status: "Normal",
    },
    {
      id: "2",
      title: "Exame_Fisica_Online.mp4",
      original_filename: "Exame_Fisica_Online.mp4",
      created_at: "2023-10-28T14:30:00Z",
      status: "PROCESSING",
      summary_status: "Analisando",
    },
    {
      id: "3",
      title: "Video 3",
      original_filename: "video3.mp4",
      created_at: "2023-10-29T10:00:00Z",
      status: "PENDING",
      summary_status: "Pendente",
    },
    {
      id: "4",
      title: "Video 4",
      original_filename: "video4.mp4",
      created_at: "2023-10-30T10:00:00Z",
      status: "PENDING",
      summary_status: "Pendente",
    },
    {
      id: "5",
      title: "Video 5",
      original_filename: "video5.mp4",
      created_at: "2023-10-31T10:00:00Z",
      status: "FAILURE",
      summary_status: "Erro",
    },
  ];

  const mockDashboardData = {
    processed_videos: 2, // Ajustado para bater com os cards
    videos: mockVideos,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (auth.isAuthenticated as Mock).mockReturnValue(true);
    (api.get as Mock).mockResolvedValue({ data: { data: mockDashboardData } });
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
          <Route
            path="/dashboard/upload-video"
            element={<div>Upload Video Page</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

  test("Renderiza o card de status com contagem correta", async () => {
    renderDashboard();

    // Aguarda sair do estado de loading (esqueletos sumirem)
    await waitFor(() => {
      expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
    });

    const totalVideosCard = (
      await screen.findByText("Total de Vídeos")
    ).closest('div[data-slot="card"]') as HTMLElement;
    const processadosCard = (await screen.findByText("Processados")).closest(
      'div[data-slot="card"]',
    ) as HTMLElement;
    const emProcessoCard = (await screen.findByText("Em Processo")).closest(
      'div[data-slot="card"]',
    ) as HTMLElement;

    await waitFor(() => {
      expect(within(totalVideosCard!).getByText("5")).toBeInTheDocument();
      expect(within(processadosCard!).getByText("2")).toBeInTheDocument();
      // Cálculo no componente: Total (5) - Processados (2) - Falhas (1) = 2
      expect(within(emProcessoCard!).getByText("2")).toBeInTheDocument();
    });
  });

  test("Renderiza a tabela com todos os vídeos inicialmente", async () => {
    renderDashboard();
    const tableContainer = (await screen.findByRole("table")).closest(
      "div.hidden.md\\:block",
    ) as HTMLElement;
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
    const searchInput = await screen.findByPlaceholderText(
      "Buscar por nome do arquivo...",
    );
    await userEvent.type(searchInput, "Matematica");

    const tableContainer = (await screen.findByRole("table")).closest(
      "div.hidden.md\\:block",
    ) as HTMLElement;
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
    const searchInput = await screen.findByPlaceholderText(
      "Buscar por nome do arquivo...",
    );
    await userEvent.type(searchInput, "NonExistentVideo");

    const tableContainer = (await screen.findByRole("table")).closest(
      "div.hidden.md\\:block",
    ) as HTMLElement;
    expect(tableContainer).toBeInTheDocument();

    await waitFor(() => {
      expect(
        within(tableContainer!).getByText("Nenhum vídeo encontrado"),
      ).toBeInTheDocument();
    });
  });

  test('Navega pra upload de video quando clica em "enviar vídeo"', async () => {
    renderDashboard();
    const uploadButton = await screen.findByRole("button", {
      name: /enviar vídeo/i,
    });
    await userEvent.click(uploadButton);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/upload-video");
  });

  test("Navega pra pagina de detalhe quando o link é clicado", async () => {
    renderDashboard();
    const tableContainer = (await screen.findByRole("table")).closest(
      "div.hidden.md\\:block",
    ) as HTMLElement;
    expect(tableContainer).toBeInTheDocument();

    const videoLink = within(tableContainer!).getByText(
      "Prova_Matematica_Turma_A.mp4",
    );
    await userEvent.click(videoLink);
    // Link do React Router funciona internamente no MemoryRouter
    expect(screen.getByText("Video Details Page")).toBeInTheDocument();
  });
});
