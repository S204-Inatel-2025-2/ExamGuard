import { useState, useRef, useEffect } from "react";
import { Video, Square, Trash2, Loader2 } from "lucide-react";
import io from "socket.io-client";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

function UploadStreaming() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [chunksSent, setChunksSent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(
    null
  );
  const [batchesProcessing, setBatchesProcessing] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<any>(null);
  const uploadIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const pendingChunksRef = useRef<Blob[]>([]);

  // Conecta ao WebSocket
  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
    socketRef.current = io(BACKEND_URL);

    socketRef.current.on("connected", (data: any) => {
      console.log("🔌 Conectado ao servidor:", data);
    });

    socketRef.current.on("upload_started", (data: any) => {
      uploadIdRef.current = data.upload_id;
      console.log("✅ Upload iniciado:", data.upload_id);
      setStatusMessage("📡 Transmissão iniciada...");
    });

    socketRef.current.on("chunk_received", (data: any) => {
      console.log("📦 Chunk recebido no servidor:", data.received, "bytes");
      setChunksSent((prev) => prev + 1);
    });

    socketRef.current.on("upload_complete", (data: any) => {
      console.log("🎉 Upload completo, processando...", data);
      setIsProcessing(true);
      setStatusMessage("✅ Gravação finalizada! Processando vídeo completo...");
      pollTaskStatus(data.task_id);
    });

    socketRef.current.on("error", (data: any) => {
      console.error("❌ Erro no WebSocket:", data);
      setUploadError(data.message);
      setIsProcessing(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Polling do status de processamento final
  const pollTaskStatus = (taskId: string) => {
    pollIntervalRef.current = window.setInterval(async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/status/${taskId}`
        );
        if (!response.ok) {
          throw new Error("Erro ao consultar status da tarefa.");
        }

        const data = await response.json();

        if (data.status === "CONCLUIDO") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setIsProcessing(false);
          setStatusMessage("🎉 Processamento concluído!");
          setProcessedVideoUrl(data.video_url);
        } else if (data.status === "FALHA") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setIsProcessing(false);
          setUploadError(`Falha: ${data.error || "Erro desconhecido"}`);
        } else {
          // Ainda processando
          console.log("⏳ Processando...", data.status);
        }
      } catch (err: any) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        setIsProcessing(false);
        setUploadError(err.message);
      }
    }, 3000);
  };

  // Envia chunk em tempo real (como binary)
  const sendChunkRealtime = async (chunk: Blob) => {
    if (!uploadIdRef.current || !socketRef.current) {
      pendingChunksRef.current.push(chunk);
      return;
    }
    try {
      const arrayBuffer = await chunk.arrayBuffer();
      // Envia o chunk como ArrayBuffer (binário)
      socketRef.current.emit("video_chunk", {
        upload_id: uploadIdRef.current,
        chunk: arrayBuffer,
      });
      console.log(`📤 Chunk enviado (${chunk.size} bytes)`);
    } catch (error) {
      console.error("❌ Erro ao enviar chunk:", error);
    }
  };

  // Envia chunks pendentes (se houver)
  const sendPendingChunks = async () => {
    if (pendingChunksRef.current.length > 0) {
      console.log(
        `📦 Enviando ${pendingChunksRef.current.length} chunks pendentes...`
      );
      for (const chunk of pendingChunksRef.current) {
        await sendChunkRealtime(chunk);
      }
      pendingChunksRef.current = [];
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Inicia upload no servidor
      socketRef.current.emit("start_upload", {
        filename: `aula-${Date.now()}.webm`,
      });

      // Aguarda confirmação
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8,opus",
      });

      const chunks: Blob[] = [];

      // ENVIO EM TEMPO REAL: a cada chunk disponível
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          setRecordedChunks((prev) => [...prev, event.data]);

          // 🚀 ENVIA IMEDIATAMENTE para o backend
          await sendChunkRealtime(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setRecordedUrl(URL.createObjectURL(blob));

        // Para o stream da câmera
        stream.getTracks().forEach((track) => track.stop());

        // Envia chunks pendentes (se houver)
        await sendPendingChunks();

        // Finaliza upload
        if (uploadIdRef.current) {
          socketRef.current.emit("finish_upload", {
            upload_id: uploadIdRef.current,
          });
          console.log("🏁 Finalizando upload...");
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(2000); // Gera chunks a cada 2 segundos
      setIsRecording(true);
      setRecordedChunks([]);
      setChunksSent(0);
      setUploadError(null);
      setStatusMessage("🔴 Gravando e transmitindo...");
      setProcessedVideoUrl(null);
      setBatchesProcessing(0);
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      setUploadError(
        "Não foi possível acessar a câmera. Verifique as permissões."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatusMessage("⏸️ Finalizando gravação...");

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const handleCancel = () => {
    setRecordedChunks([]);
    setRecordedUrl(null);
    setChunksSent(0);
    setUploadError(null);
    setStatusMessage(null);
    setProcessedVideoUrl(null);
    setIsProcessing(false);
    setBatchesProcessing(0);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    uploadIdRef.current = null;
    pendingChunksRef.current = [];
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center light:bg-white">
      <Card className="w-full max-w-3xl shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Gravar Aula</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {isRecording && "🔴 Gravando e transmitindo em tempo real..."}
              {!isRecording &&
                !recordedUrl &&
                "Clique para iniciar a gravação da sua aula"}
              {recordedUrl && !isProcessing && "✅ Gravação finalizada!"}
              {isProcessing && "⚙️ Processando vídeo final com IA..."}
            </p>
          </div>

          {/* Video Preview */}
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              controls={recordedUrl ? true : false}
              className="w-full h-full object-cover"
              src={recordedUrl || undefined}
            />

            {!isRecording && !recordedUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center space-y-4">
                  <Video className="w-20 h-20 text-gray-500 mx-auto" />
                  <p className="text-gray-400 text-sm">Câmera desligada</p>
                </div>
              </div>
            )}

            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                GRAVANDO
              </div>
            )}

            {/* Indicador de transmissão em tempo real */}
            {isRecording && chunksSent > 0 && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                TRANSMITINDO
              </div>
            )}

            {recordedChunks.length > 0 && isRecording && (
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-xs backdrop-blur space-y-1">
                <div>📦 {recordedChunks.length} chunks gravados</div>
                <div>📤 {chunksSent} chunks enviados</div>
              </div>
            )}
          </div>

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 text-blue-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Juntando e processando vídeo final...</span>
            </div>
          )}

          {/* Status Messages */}
          {statusMessage && !uploadError && (
            <div className="text-center text-sm text-blue-600 font-medium bg-blue-50 p-3 rounded-lg">
              {statusMessage}
            </div>
          )}

          {uploadError && (
            <div className="text-center text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg">
              ❌ {uploadError}
            </div>
          )}

          {/* Stats em tempo real */}
          {(recordedChunks.length > 0 || chunksSent > 0) && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-xl">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {recordedChunks.length}
                </p>
                <p className="text-xs text-gray-600">Chunks gravados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {chunksSent}
                </p>
                <p className="text-xs text-gray-600">Chunks enviados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {(
                    recordedChunks.reduce((acc, chunk) => acc + chunk.size, 0) /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </p>
                <p className="text-xs text-gray-600">Tamanho total</p>
              </div>
            </div>
          )}

          {/* Processed Video Result */}
          {processedVideoUrl && (
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl space-y-3">
              <h4 className="font-bold text-green-800 flex items-center gap-2">
                ✅ Vídeo Processado com IA
              </h4>
              <video
                controls
                className="w-full rounded-lg shadow"
                src={processedVideoUrl}
                key={processedVideoUrl}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center flex-wrap">
            {!isRecording && !recordedUrl && (
              <Button
                size="lg"
                onClick={startRecording}
                disabled={isProcessing}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg px-8 py-6 text-lg"
              >
                <Video className="w-6 h-6 mr-2" />
                Iniciar Gravação
              </Button>
            )}

            {isRecording && (
              <Button
                size="lg"
                onClick={stopRecording}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg px-8 py-6 text-lg"
              >
                <Square className="w-6 h-6 mr-2" />
                Parar Gravação
              </Button>
            )}

            {recordedUrl && !isProcessing && (
              <Button
                size="lg"
                variant="outline"
                onClick={handleCancel}
                className="border-2 border-gray-300 hover:bg-gray-100 px-6 py-6"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Nova Gravação
              </Button>
            )}
          </div>

          {/* Info Box */}
          <div className="border-blue-200 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300">
            <p className="font-semibold mb-1">💡 Como funciona:</p>
            <ul className="space-y-1 text-xs">
              <li>
                🔴 <strong>Durante a gravação:</strong> Chunks são enviados
                automaticamente a cada 2 segundos
              </li>
              <li>
                ⚡ <strong>Processamento paralelo:</strong> A cada 5 chunks, o
                servidor já começa a processar com IA
              </li>
              <li>
                🎬 <strong>Ao finalizar:</strong> O servidor junta todos os
                chunks processados em um vídeo final
              </li>
              <li>
                ✅ <strong>Resultado:</strong> Vídeo completo com anotações de
                comportamentos suspeitos
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UploadStreaming;
