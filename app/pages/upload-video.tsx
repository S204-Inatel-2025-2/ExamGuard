import { useState, useRef } from "react";
import { Button } from "../components/ui/button";
import { Card, CardAction, CardContent } from "../components/ui/card";
import { X, Loader2 } from "lucide-react";
import api from "~/services/axios-backend-client";

function UploadVideo() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);

  const pollIntervalRef = useRef<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setUploadError(null);
      setStatusMessage(null);
      setProcessedVideoUrl(null); 
      setIsProcessing(false);
      setIsUploading(false);
      
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    }
  };

  const handleCancel = () => {
    setVideoFile(null);
    setVideoUrl(null);
    setUploadError(null);
    setStatusMessage(null);
    setProcessedVideoUrl(null); 
    setIsProcessing(false);
    setIsUploading(false);

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };
  
  const pollTaskStatus = (taskId: string) => {
    pollIntervalRef.current = window.setInterval(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/status/${taskId}`);
        if (!response.ok) {
           throw new Error("Erro ao consultar o status da tarefa.");
        }
        
        const data = await response.json();

        if (data.status === "CONCLUIDO") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setIsProcessing(false);
          setStatusMessage("Processamento concluído!");
          setProcessedVideoUrl(data.video_url); 
        } else if (data.status === "FALHA") {
          // FALHA
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setIsProcessing(false);
          setUploadError(`Falha no processamento: ${data.error || 'Erro desconhecido'}`);
          
        }
      } catch (err: any) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        setIsProcessing(false);
        setUploadError(err.message || "Erro ao verificar status do processamento.");
      }
    }, 5000); 
  };

  const handleUpload = async () => {
    if (!videoFile) return;

    setIsUploading(true);
    setIsProcessing(false);
    setUploadError(null);
    setStatusMessage("Enviando vídeo...");
    setProcessedVideoUrl(null);

    const formData = new FormData();
    formData.append("video", videoFile, videoFile.name);

    try {
      // Envia o arquivo para a rota de upload (POST)
      const response = await api.post('/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(response);

      // Se chegou aqui, é 200 OK
      setIsUploading(false);
      setIsProcessing(true);
      setStatusMessage("Vídeo enviado com sucesso! Processando análise...");

      // Inicia o polling do status
      pollTaskStatus(response.data.task_id);

    } catch (err: any) {
      setIsUploading(false);
      setIsProcessing(false);
      console.error(err);
      setUploadError(err.response?.data?.error || "Ocorreu um erro no upload.");
    }
  };

  const isDisabled = isUploading || isProcessing;
  let buttonText = "Enviar Vídeo";
  if (isUploading) buttonText = "Enviando...";
  if (isProcessing) buttonText = "Processando...";


  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-lg shadow-lg rounded-2xl">
        <CardContent className="px-6 py-6 space-y-4">
          <h2 className="text-2xl font-semibold text-center">
            Upload de Vídeo
          </h2>

          {!videoFile && (
            <div data-testid="upload-area" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-10 bg-white">
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
                data-testid="video-input"
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer text-sm text_gray-600 hover:text-gray-900"
              >
                Clique para selecionar um vídeo
              </label>
            </div>
          )}

          {videoFile && videoUrl && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  controls
                  className="w-full rounded-lg shadow"
                  src={videoUrl}
                />
                <button
                  onClick={handleCancel}
                  aria-label="Cancelar upload"
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-center">
                <span className="text-sm text-gray-600 truncate max-w-[200px]">
                  {videoFile.name}
                </span>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardAction className="w-full text-center px-6 pb-6">
          <Button
            size="lg"
            variant="default"
            className="cursor-pointer w-full"
            onClick={handleUpload} 
            disabled={isDisabled || !videoFile}
          >
            {isDisabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {buttonText} 
          </Button>

          {statusMessage && !uploadError && (
            <p className="text-blue-600 text-sm mt-2">{statusMessage}</p>
          )}
          
          {uploadError && (
            <p className="text-red-500 text-sm mt-2">{uploadError}</p>
          )}
          
          {processedVideoUrl && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-left text-sm">
              <h4 className="font-bold mb-2">Vídeo Processado:</h4>
              <video 
                controls 
                className="w-full rounded-lg shadow mt-2" 
                src={processedVideoUrl} 
                key={processedVideoUrl}
              />
            </div>
          )}

        </CardAction>
      </Card>
    </div>
  );
}

export default UploadVideo;