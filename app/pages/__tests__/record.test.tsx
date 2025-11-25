import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useParams } from "react-router";
import Record from "../record";
import { expect, test, describe, vi, type Mock, beforeEach } from "vitest";
import api from "~/services/axios-backend-client";
import { auth } from "~/utils/auth";

// Mocks
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
    useParams: vi.fn(),
  };
});

describe("Página de Registro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth.isAuthenticated as Mock).mockReturnValue(true);
  });

  const renderRecordPage = (id: string) => {
    (useParams as Mock).mockReturnValue({ id });
    return render(
      <MemoryRouter initialEntries={[`/dashboard/video/${id}`]}>
        <Routes>
          <Route path="/dashboard/video/:id" element={<Record />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );
  };

  test('Renderiza "Registro não encontrado" para um ID inválido', async () => {
    (api.get as Mock).mockRejectedValue({ response: { status: 404 } });
    renderRecordPage("999");
    expect(
      await screen.findByText("Vídeo não encontrado."),
    ).toBeInTheDocument();
  });

  test('Renderiza corretamente os detalhes de um vídeo "Processado"', async () => {
    const mockVideo = {
      id: "1",
      title: "Prova_Matematica_Turma_A.mp4",
      original_filename: "Prova_Matematica_Turma_A.mp4",
      created_at: "2023-10-27T10:00:00Z",
      status: "SUCCESS",
      summary_status: "Intensamente Suspeito",
      processed_video_url: "http://video.url",
      highlights: [
        {
          id: 1,
          timestamp_str: "00:10",
          timestamp_sec: 10,
          description: "Comportamento suspeito detectado",
          type: "Suspeito",
          confidence: "90%",
          confidence_level: "Alto",
        },
      ],
      highlightsGerados: 1,
      tempoProcessamento: "2m",
    };
    (api.get as Mock).mockResolvedValue({ data: mockVideo });

    renderRecordPage("1");

    // Verifica título e badge de status
    const title = await screen.findByText("Prova_Matematica_Turma_A.mp4");
    expect(title).toBeInTheDocument();
    expect(screen.getByText("SUCCESS")).toBeInTheDocument();

    // Verifica cards de informação
    expect(screen.getByText("Duração Processamento")).toBeInTheDocument();
    expect(screen.getByText("2m")).toBeInTheDocument();

    expect(screen.getByText("Highlights")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Contagem de highlights

    expect(
      screen.getByText("Comportamento suspeito detectado"),
    ).toBeInTheDocument();
  });

  test('Renderiza corretamente um vídeo "Processando"', async () => {
    const mockVideo = {
      id: "2",
      title: "Exame_Fisica_Online.mp4",
      status: "PROCESSING",
      summary_status: "Analisando",
      created_at: "2023-10-27T10:00:00Z",
      highlights: [],
      highlightsGerados: 0,
      tempoProcessamento: "-",
    };
    (api.get as Mock).mockResolvedValue({ data: mockVideo });

    renderRecordPage("2");
    const title = await screen.findByText("Exame_Fisica_Online.mp4");
    expect(title).toBeInTheDocument();

    expect(
      screen.getByText("O vídeo está sendo processado..."),
    ).toBeInTheDocument();
    expect(screen.getByText("PROCESSING")).toBeInTheDocument();
  });

  test("Renderiza corretamente mensagem de erro ao falhar carregamento", async () => {
    (api.get as Mock).mockRejectedValue({ response: { status: 500 } });
    renderRecordPage("4");
    expect(
      await screen.findByText("Erro ao carregar o vídeo."),
    ).toBeInTheDocument();
  });

  test('O botão "Voltar ao Dashboard" navega corretamente', async () => {
    (api.get as Mock).mockRejectedValue({ response: { status: 404 } });
    renderRecordPage("1");

    // Aguarda renderizar a tela de erro
    await screen.findByText("Erro");

    const backButton = screen.getByRole("button", {
      name: /voltar ao dashboard/i,
    });
    await userEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
});
