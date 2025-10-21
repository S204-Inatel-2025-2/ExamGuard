import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadStreaming from '../upload-streaming';
import { expect, test, describe, vi, beforeEach } from 'vitest';

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

  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: vi.fn().mockResolvedValue(mockMediaStream),
    },
    writable: true,
  });

  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();
  global.alert = vi.fn();
});

describe('UploadStreaming', () => {
  test('Initially displays "Câmera desligada" message', () => {
    render(<UploadStreaming />);
    expect(screen.getByText(/câmera desligada/i)).toBeInTheDocument();
    expect(screen.getByTestId('video-icon')).toBeInTheDocument();
  });

  test('`startRecording` initiates camera access and video stream', async () => {
    render(<UploadStreaming />);
    await userEvent.click(screen.getByRole('button', { name: /iniciar gravação/i }));
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
      expect(screen.getByTestId('recording-indicator')).toBeInTheDocument();
      expect(mockMediaRecorderInstance.start).toHaveBeenCalledWith(2000);
    });
  });

  test('`stopRecording` stops recording and stream', async () => {
    render(<UploadStreaming />);
    await userEvent.click(screen.getByRole('button', { name: /iniciar gravação/i }));
    await userEvent.click(screen.getByRole('button', { name: /parar gravação/i }));
    act(() => {
        mockMediaRecorderInstance.onstop();
    });
    await waitFor(() => {
      expect(mockMediaRecorderInstance.stop).toHaveBeenCalled();
      expect(screen.getByText(/gravação finalizada! revise e envie/i)).toBeInTheDocument();
    });
  });

  test('`handleCancel` resets state', async () => {
    render(<UploadStreaming />);
    await userEvent.click(screen.getByRole('button', { name: /iniciar gravação/i }));
    await userEvent.click(screen.getByRole('button', { name: /parar gravação/i }));
    act(() => {
        mockMediaRecorderInstance.onstop();
    });
    await userEvent.click(await screen.findByRole('button', { name: /descartar/i }));
    expect(screen.getByText(/câmera desligada/i)).toBeInTheDocument();
  });

  test('`handleFinalUpload` shows progress and alert', async () => {
    render(<UploadStreaming />);
    await userEvent.click(screen.getByRole('button', { name: /iniciar gravação/i }));

    act(() => {
        mockMediaRecorderInstance.ondataavailable({ data: new Blob(['chunk1']) });
    });

    await userEvent.click(screen.getByRole('button', { name: /parar gravação/i }));
    act(() => {
        mockMediaRecorderInstance.onstop();
    });

    await userEvent.click(await screen.findByRole('button', { name: /enviar vídeo/i }));

    await waitFor(() => {
      expect(screen.getByText(/enviando vídeo final.../i)).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Vídeo enviado com sucesso! ✅');
    }, { timeout: 3000 });
  });

  test('Error handling for camera access', async () => {
    (navigator.mediaDevices.getUserMedia as vi.Mock).mockRejectedValueOnce(new Error('Permission denied'));
    render(<UploadStreaming />);
    await userEvent.click(screen.getByRole('button', { name: /iniciar gravação/i }));
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Não foi possível acessar a câmera. Verifique as permissões.');
    });
  });
});