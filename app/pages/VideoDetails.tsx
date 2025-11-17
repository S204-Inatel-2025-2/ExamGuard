import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Clock,
  FileVideo,
  AlertCircle,
  Eye,
  Download as DownloadIcon,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useState, useEffect, useRef } from "react"; // NOVO: Importa useRef

const VITE_API_URL = "http://localhost:5001";

// --- COMPONENTES INTERNOS ---

// NOVO: VideoModal ATUALIZADO
function VideoModal({
  highlight,
  videoUrl, // URL real do vídeo processado
  isOpen,
  onClose,
}: {
  highlight: any;
  videoUrl: string; // URL real
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  
  // NOVO: Cria a URL com o tempo (ex: http://.../video.mp4#t=930)
  const startTime = highlight.timestamp_sec || 0;
  const videoSrc = `${videoUrl}#t=${startTime}`;
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // NOVO: Garante que o vídeo pule para o tempo certo
  useEffect(() => {
    if (isOpen && videoRef.current) {
        // Força o recarregamento e o pulo
        videoRef.current.src = videoSrc;
        videoRef.current.load();
        videoRef.current.play().catch(e => console.error("Erro ao dar play:", e));
        
        // Listener para garantir o pulo
        const onLoadedData = () => {
            if (videoRef.current) {
                videoRef.current.currentTime = startTime;
                videoRef.current.play().catch(e => console.error("Erro ao dar play:", e));
            }
        };
        videoRef.current.addEventListener('loadeddata', onLoadedData);
        return () => {
            videoRef.current?.removeEventListener('loadeddata', onLoadedData);
        };
    }
  }, [isOpen, videoSrc, startTime]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{highlight.description}</h3>
            <p className="text-sm text-muted-foreground">
              {highlight.timestamp_str}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <video
            ref={videoRef}
            controls
            autoPlay
            className="w-full rounded-lg"
            key={videoSrc} // Força o React a recarregar o <video>
          >
            <source src={videoSrc} type="video/mp4" />
            Seu navegador não suporta vídeo.
          </video>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Tipo: {highlight.type}</p>
            <p className="text-sm text-muted-foreground">
              Confiança: {highlight.confidence}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// NOVO: VideoThumbnail ATUALIZADO
function VideoThumbnail({
  highlight,
  videoUrl, // URL real do vídeo
  onModalOpen,
}: {
  highlight: any;
  videoUrl: string;
  onModalOpen: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Pega o tempo do highlight em segundos
  const startTime = highlight.timestamp_sec || 0;
  const videoSrc = `${videoUrl}#t=${startTime}`;

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsLoading(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsLoading(false);
    // Pausa o vídeo e reseta
    if(videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = startTime;
    }
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
    // Pula para o tempo certo
    if(videoRef.current) {
        videoRef.current.currentTime = startTime;
        videoRef.current.play().catch(e => console.error("Erro ao pré-carregar:", e));
    }
  };

  return (
    <div
      className="relative w-32 h-20 rounded-lg overflow-hidden cursor-pointer border bg-gray-900"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onModalOpen}
    >
      {!isHovered ? (
        // Mostra o timestamp como placeholder
        <div className="w-full h-full flex items-center justify-center bg-slate-800">
           <span className="text-white font-mono text-lg">{highlight.timestamp_str}</span>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            </div>
          )}
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
            onLoadedData={handleVideoLoad}
          />
        </>
      )}
    </div>
  );
}

// Função para formatar a data
const formatDate = (isoString: string) => {
  if (!isoString) return "Data indisponível";
  try {
    return new Date(isoString).toLocaleString("pt-BR");
  } catch (e) {
    return isoString;
  }
};

// --- COMPONENTE PRINCIPAL ---

export default function VideoDetails() {
  const { id } = useParams(); // ID do VÍDEO
  const navigate = useNavigate();
  const [selectedHighlight, setSelectedHighlight] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // NOVO: Estado para o botão de download
  const [isDownloading, setIsDownloading] = useState(false);

  // Busca os dados do VÍDEO
  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${VITE_API_URL}/api/videos/${id}`);
        if (!response.ok) {
          throw new Error("Registro de vídeo não encontrado");
        }
        const data = await response.json();
        setRecord(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);
  
  
  // NOVO: Função do botão de Download
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
        // 1. Pede a URL de download para a API
        const response = await fetch(`${VITE_API_URL}/api/videos/${record.id}/download_url`);
        if (!response.ok) {
            throw new Error("Não foi possível gerar a URL de download.");
        }
        const data = await response.json();
        const downloadUrl = data.download_url;

        // 2. Cria um link fantasma e clica nele
        const link = document.createElement('a');
        link.href = downloadUrl;
        // O nome do arquivo que será salvo
        link.setAttribute('download', record.processed_filename || 'video-processado.mp4');
        document.body.appendChild(link);
        link.click();
        
        // 3. Limpa o link
        document.body.removeChild(link);

    } catch (err: any) {
        console.error("Erro no download:", err);
        alert(err.message);
    } finally {
        setIsDownloading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">
            {error || "Registro não encontrado"}
          </h1>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      SUCCESS: "default",
      PROCESSING: "secondary",
      PENDING: "secondary",
      FAILURE: "destructive",
    };
    const textMap: Record<string, string> = {
      SUCCESS: "Processado",
      PROCESSING: "Processando",
      PENDING: "Pendente",
      FAILURE: "Erro",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {textMap[status] || status}
      </Badge>
    );
  };

  const isVideoAvailable = record.status === "SUCCESS";
  const disponivel = record.status === "SUCCESS";

  const openModal = (highlight: any) => {
    setSelectedHighlight(highlight);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedHighlight(null);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <Button
          variant="outline"
          size="sm"
          // VOLTA PARA A PÁGINA DA PASTA
          onClick={() => navigate(`/dashboard/exam/${record.exam_id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Detalhes do Vídeo
          </h1>
          <p className="text-muted-foreground mt-2">
            Análise e highlights do vídeo selecionado
          </p>
        </div>
      </motion.div>

      {/* Video Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="break-all">{record.exam_name}</CardTitle>
                <CardDescription>
                  Arquivo: {record.original_filename} | Enviado em:{" "}
                  {formatDate(record.created_at)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(record.status)}
                {/* NOVO: Botão de Download funcional */}
                <Button
                  size="sm"
                  onClick={handleDownload}
                  disabled={!isVideoAvailable || isDownloading}
                  className="disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                     <Download className="mr-2 h-4 w-4" />
                  )}
                  {isDownloading ? "Baixando..." : "Download"}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Processing Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Resultados do Processamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Highlights Gerados</span>
                <span className="text-2xl font-bold">
                  {record.highlightsGerados}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Tempo de Processamento
                </span>
                <span className="text-sm text-muted-foreground">
                  {record.tempoProcessamento}
                </span>
              </div>
              {record.status === "FAILURE" && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    Erro durante o processamento.
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações Técnicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">ID do Registro</span>
                <span className="text-sm text-muted-foreground">
                  #{record.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status</span>
                {getStatusBadge(record.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Disponibilidade</span>
                <span
                  className={`text-sm ${
                    disponivel ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {disponivel ? "Disponível" : "Indisponível"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Highlights Section */}
      {record.status === "SUCCESS" && record.highlightsGerados > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Highlights Detectados</CardTitle>
              <CardDescription>
                Momentos suspeitos identificados pela IA durante a análise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(record.highlights || []).map((highlight: any) => {
                  const getConfidenceBadge = (confidence: string) => {
                    const variants: Record<
                      string,
                      "default" | "secondary" | "destructive"
                    > = {
                      Alto: "destructive",
                      Médio: "secondary",
                      Baixo: "default",
                    };
                    return (
                      <Badge
                        variant={variants[confidence] || "default"}
                        className="text-xs"
                      >
                        {confidence}
                      </Badge>
                    );
                  };

                  return (
                    <div
                      key={highlight.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        <VideoThumbnail
                          highlight={highlight}
                          isVideoAvailable={isVideoAvailable}
                          // NOVO: Passa a URL real do vídeo
                          videoUrl={record.processed_video_url} 
                          onModalOpen={() => openModal(highlight)}
                        />
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                {highlight.timestamp_str}
                              </div>
                              {getConfidenceBadge(highlight.confidence_level)}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!isVideoAvailable}
                                onClick={() => openModal(highlight)}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                Ver
                              </Button>
                              {/* O botão de Download do highlight foi removido, 
                                  já que o "Ver" agora pula para o momento certo */}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {highlight.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Tipo: {highlight.type}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!record.highlights || record.highlights.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum highlight disponível para este vídeo</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Video Modal */}
      <VideoModal
        highlight={selectedHighlight}
        // NOVO: Passa a URL real do vídeo
        videoUrl={record?.processed_video_url} 
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}