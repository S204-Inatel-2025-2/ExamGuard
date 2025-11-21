import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { X, UploadCloud, CheckCircle, Loader2 } from "lucide-react";

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
  const [finishedVideoId, setFinishedVideoId] = useState<number | null>(null);

  const pollIntervalRef = useRef<number | null>(null);

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

  const pollTaskStatus = (taskId: string, videoId: number) => {
    pollIntervalRef.current = window.setInterval(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/status/${taskId}`);
        const data = await response.json();

        if (data.status === "CONCLUIDO") {
          // SUCESSO: Para o loading e mostra o botão
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsProcessing(false);
          setFinishedVideoId(videoId); // <--- Isso ativa a tela de sucesso
          setStatusMessage("Análise concluída com sucesso!");
        
        } else if (data.status === "FALHA") {
          // ERRO
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsProcessing(false);
          setError("Ocorreu um erro no processamento do vídeo.");
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);
  };

  const handleUpload = async () => {
    if (!videoFile || !title) return;

    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("title", title);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload-video`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Falha no upload");

      const result = await response.json();
      
      setIsUploading(false);
      setIsProcessing(true); // Começa a girar a roleta
      setStatusMessage("Processando inteligência artificial...");
      
      // Começa a vigiar
      pollTaskStatus(result.task_id, result.video_id);

    } catch (err: any) {
      setIsUploading(false);
      setError("Erro ao enviar vídeo.");
    }
  };

  // --- TELA DE SUCESSO SIMPLES ---
  if (finishedVideoId) {
    return (
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-lg text-center p-8 space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-green-700">Vídeo Processado!</h2>
          <p className="text-gray-600">
            A inteligência artificial finalizou a análise do vídeo <strong>{title}</strong>.
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
          <h2 className="text-2xl font-semibold text-center">Upload de Vídeo</h2>

          {!videoFile ? (
            <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center cursor-pointer hover:bg-gray-50">
              <input ref={inputRef} type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
              <UploadCloud className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Clique para selecionar</p>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="flex items-center justify-between bg-gray-100 p-3 rounded">
                  <span className="text-sm truncate max-w-[200px]">{videoFile.name}</span>
                  <button onClick={() => setVideoFile(null)} disabled={isProcessing}>
                    <X className="w-4 h-4" />
                  </button>
               </div>
               <div className="space-y-1">
                 <label className="text-sm font-medium">Título</label>
                 <Input value={title} onChange={e => setTitle(e.target.value)} disabled={isProcessing} />
               </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
          
          {isProcessing && (
             <div className="text-center space-y-2 py-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-blue-600 font-medium">{statusMessage}</p>
                <p className="text-xs text-gray-400">Isso pode levar alguns minutos...</p>
             </div>
          )}

          {!isProcessing && videoFile && (
            <Button className="w-full" onClick={handleUpload} disabled={isUploading || !title}>
              {isUploading ? "Enviando..." : "Iniciar Análise"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UploadVideo;