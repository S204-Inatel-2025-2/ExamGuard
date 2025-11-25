import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { X, UploadCloud, CheckCircle, Loader2 } from "lucide-react";
import api from "~/services/axios-backend-client";
import { toast } from "sonner";

function UploadVideo() {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ID do vídeo para gerar o link final
  const [finishedVideoId, setFinishedVideoId] = useState<string | null>(null);

  // State to track active task and video ID for polling
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
      setError(null);
      setStatusMessage(null);
      setFinishedVideoId(null);
    }
  };

  // Polling logic using useEffect
  useEffect(() => {
    if (!activeTaskId || !activeVideoId) return;

    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/api/status/${activeTaskId}`);
        const data = response.data;

        if (data.status === "CONCLUIDO") {
          clearInterval(interval);
          setIsProcessing(false);
          setFinishedVideoId(activeVideoId);
          setStatusMessage("Análise concluída com sucesso!");
          setActiveTaskId(null); // Stop polling logic
          setActiveVideoId(null);
        } else if (data.status === "FALHA") {
          clearInterval(interval);
          setIsProcessing(false);
          const errorMsg = `Erro no processamento: ${data.error || "Desconhecido"}`;
          setError(errorMsg);
          toast.error(errorMsg);
          setActiveTaskId(null);
          setActiveVideoId(null);
        }
      } catch (err) {
        console.error("Erro no polling:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTaskId, activeVideoId]);

  const handleUpload = async () => {
    if (!videoFile || !title) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("title", title);

    try {
      //const response = await api.post("/upload-video", formData, { timeout: 20000 })
      const response = await api.post("/upload-video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = response.data;

      setIsUploading(false);
      setIsProcessing(true);
      setStatusMessage("Processando inteligência artificial...");

      // Trigger polling via useEffect
      setActiveTaskId(result.task_id);
      setActiveVideoId(result.video_id);
    } catch (err: unknown) {
      setIsUploading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any).response?.data?.error || "Erro ao enviar vídeo.";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleCancel = () => {
    setVideoFile(null);
    setTitle("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // tela de sucesso
  if (finishedVideoId) {
    return (
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-lg text-center p-8 space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-green-700">
            Vídeo Processado!
          </h2>
          <p className="text-gray-600">
            A inteligência artificial finalizou a análise do vídeo{" "}
            <strong>{title}</strong>.
          </p>
          <Button
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => navigate(`/dashboard/video/${finishedVideoId}`)}
          >
            Ver Resultado Agora
          </Button>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Enviar Outro Vídeo
          </Button>
        </Card>
      </div>
    );
  }

  // --- TELA DE UPLOAD NORMAL ---
  return (
    <div className="flex items-center justify-center p-6">
      <Card className="w-full max-w-lg p-6">
        <CardContent className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Upload de Vídeo
          </h2>

          {!videoFile ? (
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center cursor-pointer hover:bg-gray-50"
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Clique para selecionar</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-100 p-3 rounded">
                <span className="text-sm truncate max-w-[200px]">
                  {videoFile.name}
                </span>
                <button onClick={handleCancel} disabled={isProcessing}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          {isProcessing && (
            <div className="text-center space-y-2 py-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-blue-600 font-medium">{statusMessage}</p>
              <p className="text-xs text-gray-400">
                Isso pode levar alguns minutos...
              </p>
            </div>
          )}

          {!isProcessing && videoFile && (
            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={isUploading || !title}
            >
              {isUploading ? "Enviando..." : "Iniciar Análise"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UploadVideo;
