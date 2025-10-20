import { useState, useRef } from "react";
import { Button } from "../components/ui/button";
import { Card, CardAction, CardContent } from "../components/ui/card";
import { X } from "lucide-react";

// URL Flask
const API_URL = "http://localhost:5000";
function UploadVideo() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Estados para gerenciar o fluxo assíncrono
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  //Guarda a URL do vídeo processado
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);

  //Referência para o timer do polling
  const pollIntervalRef = useRef<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      // Reseta todos os estados
      setUploadError(null);
      setStatusMessage(null);
      setProcessedVideoUrl(null); // <-- Reseta o vídeo processado
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
  
  // Função que fica verificando o status da tarefa no backend
  const pollTaskStatus = (taskId: string) => {
    pollIntervalRef.current = window.setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/status/${taskId}`);
        if (!response.ok) {
           throw new Error("Erro ao consultar o status da tarefa.");
        }
        
        const data = await response.json();

        if (data.status === "CONCLUIDO") {
          // SUCESSO! aq temos a URL
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setIsProcessing(false);
          setStatusMessage("Processamento concluído!");
          setProcessedVideoUrl(data.video_url); // SALVA A URL DO VÍDEO
          console.log("Vídeo processado:", data.video_url);

        } else if (data.status === "FALHA") {
          // FALHA
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setIsProcessing(false);
          setUploadError(`Falha no processamento: ${data.error || 'Erro desconhecido'}`);
          
        } else {
          // PENDENTE
          console.log("Status: PENDENTE");
        }
      } catch (err: any) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        setIsProcessing(false);
        setUploadError(err.message || "Erro ao verificar status do processamento.");
      }
    }, 5000); // Verifica a cada 5 segundos
  };

  const handleUpload = async () => {
    if (!videoFile) return;

    // Reseta estados
    setIsUploading(true);
    setIsProcessing(false);
    setUploadError(null);
    setStatusMessage("Enviando vídeo...");
    setProcessedVideoUrl(null);

    const formData = new FormData();
    formData.append("video", videoFile, videoFile.name);

    try {
      // Envia o arquivo para a rota de upload (POST)
      const response = await fetch(`${API_URL}/upload-video`, {
        method: "POST",
        body: formData,
      });

      setIsUploading(false);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "Falha no upload." }));
        throw new Error(errData.error || "Falha no upload.");
      }

      const result = await response.json();

      //Upload OK! Agora começa o processamento
      setIsProcessing(true);
      setStatusMessage("Vídeo enviado. Processando análise...");

      //Inicia o polling para verificar o status
      pollTaskStatus(result.task_id);

    } catch (err: any) {
      setIsUploading(false);
      setUploadError(err.message || "Ocorreu um erro desconhecido.");
    }
  };

  //botão
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

          {/* ÁREA DE SELEÇÃO DE ARQUIVO */}
          {!videoFile && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-10 bg-white">
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer text-sm text_gray-600 hover:text-gray-900"
              >
                Clique para selecionar um vídeo
              </label>
            </div>
          )}

          {/* PREVIEW DO VÍDEO (quando selecionado) */}
          {videoFile && videoUrl && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  controls
                  className="w-full rounded-lg shadow"
                  src={videoUrl}
                />
                <button
                  onClick={handleCancel} // Botão 'X' para cancelar
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
        
        {/* ÁREA DE AÇÃO (BOTÃO E FEEDBACK) */}
        <CardAction className="w-full text-center px-6 pb-6">
          <Button
            size="lg"
            variant="default"
            className="cursor-pointer w-full"
            onClick={handleUpload} 
            disabled={isDisabled || !videoFile}
          >
            {buttonText} 
          </Button>

          {/* Feedback para o usuário */}
          {statusMessage && !uploadError && (
            <p className="text-blue-600 text-sm mt-2">{statusMessage}</p>
          )}
          
          {uploadError && (
            <p className="text-red-500 text-sm mt-2">{uploadError}</p>
          )}
          
          {/* Renderiza o player de vídeo quando URL estiver pronta */}
          {processedVideoUrl && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-left text-sm">
              <h4 className="font-bold mb-2">Vídeo Processado:</h4>
              <video 
                controls 
                className="w-full rounded-lg shadow mt-2" 
                src={processedVideoUrl} 
                key={processedVideoUrl} /* Força o react a recarregar o player */
              />
            </div>
          )}

        </CardAction>
      </Card>
    </div>
  );
}

export default UploadVideo;