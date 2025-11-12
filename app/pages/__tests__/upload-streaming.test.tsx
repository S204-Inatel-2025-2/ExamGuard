import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UploadStreaming from "../upload-streaming";
import {
  expect,
  test,
  describe,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";

const mockMediaStreamTrack = { stop: vi.fn() };
const mockMediaStream = { getTracks: () => [mockMediaStreamTrack] };
let mockMediaRecorderInstance: any;

beforeEach(() => {
  vi.clearAllMocks();

  mockMediaRecorderInstance = {
    start: vi.fn(),
    stop: vi.fn(),
    ondataavailable: null,
    onstop: null,
  };

  global.MediaRecorder = vi.fn(() => mockMediaRecorderInstance) as any;

  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      getUserMedia: vi.fn().mockResolvedValue(mockMediaStream),
    },
    writable: true,
  });

  global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  global.URL.revokeObjectURL = vi.fn();
  global.alert = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Componente UploadStreaming", () => {
  test('Exibe inicialmente a mensagem "Câmera desligada"', () => {
    render(<UploadStreaming />);
    expect(screen.getByText(/câmera desligada/i)).toBeInTheDocument();
    expect(screen.getByTestId("video-icon")).toBeInTheDocument();
  });

  test("A função `startRecording` inicia o acesso à câmera e o stream de vídeo", async () => {
    render(<UploadStreaming />);
    await userEvent.click(
      screen.getByRole("button", { name: /iniciar gravação/i }),
    );
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
      expect(screen.getByTestId("recording-indicator")).toBeInTheDocument();
      expect(mockMediaRecorderInstance.start).toHaveBeenCalledWith(2000);
    });
  });

  test("A função `stopRecording` para a gravação e o stream", async () => {
    render(<UploadStreaming />);
    await userEvent.click(
      screen.getByRole("button", { name: /iniciar gravação/i }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /parar gravação/i }),
    );
    act(() => {
      mockMediaRecorderInstance.onstop();
    });
    await waitFor(() => {
      expect(mockMediaRecorderInstance.stop).toHaveBeenCalled();
      expect(
        screen.getByText(/gravação finalizada! revise e envie/i),
      ).toBeInTheDocument();
    });
  });

  test("A função `handleCancel` redefine o estado do componente", async () => {
    render(<UploadStreaming />);
    await userEvent.click(
      screen.getByRole("button", { name: /iniciar gravação/i }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /parar gravação/i }),
    );
    act(() => {
      mockMediaRecorderInstance.onstop();
    });
    await userEvent.click(
      await screen.findByRole("button", { name: /descartar/i }),
    );
    expect(screen.getByText(/câmera desligada/i)).toBeInTheDocument();
  });

  test("A função `handleFinalUpload` exibe o progresso e mostra o alerta de sucesso", async () => {
    render(<UploadStreaming />);
    await userEvent.click(
      screen.getByRole("button", { name: /iniciar gravação/i }),
    );

    act(() => {
      mockMediaRecorderInstance.ondataavailable({ data: new Blob(["chunk1"]) });
    });

    await userEvent.click(
      screen.getByRole("button", { name: /parar gravação/i }),
    );
    act(() => {
      mockMediaRecorderInstance.onstop();
    });

    await userEvent.click(
      await screen.findByRole("button", { name: /enviar vídeo/i }),
    );

    await waitFor(
      () => {
        expect(
          screen.getByText(/enviando vídeo final.../i),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    await waitFor(
      () => {
        expect(global.alert).toHaveBeenCalledWith(
          "Vídeo enviado com sucesso! ✅",
        );
      },
      { timeout: 3000 },
    );
  });

  test("Lida corretamente com erros de acesso à câmera", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    (
      navigator.mediaDevices.getUserMedia as unknown as Mock
    ).mockRejectedValueOnce(new Error("Permission denied"));

    render(<UploadStreaming />);
    await userEvent.click(
      screen.getByRole("button", { name: /iniciar gravação/i }),
    );

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        "Não foi possível acessar a câmera. Verifique as permissões.",
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
