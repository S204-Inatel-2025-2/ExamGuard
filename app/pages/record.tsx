import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Download, Play, Clock, FileVideo, AlertCircle, Eye, Download as DownloadIcon, X, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useState } from "react";

// Mock highlights data
const mockHighlights = {
  1: [
    {
      id: 1,
      timestamp: "00:15:30",
      duration: "00:00:45",
      description: "Comportamento suspeito detectado",
      type: "Olhando para fora da tela",
      confidence: "Alto",
      thumbnail: "https://via.placeholder.com/320x180/1f2937/ffffff?text=Thumbnail+1",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
      id: 2,
      timestamp: "00:32:15",
      duration: "00:01:20",
      description: "Múltiplas faces detectadas",
      type: "Pessoa adicional",
      confidence: "Médio",
      thumbnail: "https://via.placeholder.com/320x180/1f2937/ffffff?text=Thumbnail+2",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    },
    {
      id: 3,
      timestamp: "01:05:42",
      duration: "00:00:30",
      description: "Uso de dispositivo móvel",
      type: "Objeto suspeito",
      confidence: "Alto",
      thumbnail: "https://via.placeholder.com/320x180/1f2937/ffffff?text=Thumbnail+3",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
  ],
  3: [
    {
      id: 1,
      timestamp: "00:08:15",
      duration: "00:00:35",
      description: "Ausência prolongada da tela",
      type: "Fora da câmera",
      confidence: "Alto",
      thumbnail: "https://via.placeholder.com/320x180/1f2937/ffffff?text=Thumbnail+4",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    },
    {
      id: 2,
      timestamp: "00:25:50",
      duration: "00:01:10",
      description: "Movimentação suspeita",
      type: "Comportamento anômalo",
      confidence: "Médio",
      thumbnail: "https://via.placeholder.com/320x180/1f2937/ffffff?text=Thumbnail+5",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    },
  ],
};

// Mock data - in real app this would come from API
const mockRecords = [
  {
    id: 1,
    nome: "Prova_Matematica_Turma_A.mp4",
    dataEnvio: "2024-10-15 14:30",
    status: "Processado",
    duracao: "02:45:30",
    tamanho: "1.2 GB",
    formato: "MP4",
    resolucao: "1920x1080",
    highlightsGerados: 12,
    tempoProcessamento: "15 min",
    disponivel: true,
  },
  {
    id: 2,
    nome: "Exame_Fisica_Online.mp4",
    dataEnvio: "2024-10-16 09:15",
    status: "Processando",
    duracao: "01:30:45",
    tamanho: "850 MB",
    formato: "MP4",
    resolucao: "1920x1080",
    highlightsGerados: 0,
    tempoProcessamento: "Em andamento...",
    disponivel: false,
  },
  {
    id: 3,
    nome: "Avaliacao_Quimica_Turma_B.mp4",
    dataEnvio: "2024-10-17 16:45",
    status: "Processado",
    duracao: "03:15:20",
    tamanho: "1.8 GB",
    formato: "MP4",
    resolucao: "1920x1080",
    highlightsGerados: 18,
    tempoProcessamento: "22 min",
    disponivel: true,
  },
  {
    id: 4,
    nome: "Teste_Historia_EAD.mp4",
    dataEnvio: "2024-10-18 11:20",
    status: "Erro",
    duracao: "02:10:15",
    tamanho: "1.1 GB",
    formato: "MP4",
    resolucao: "1920x1080",
    highlightsGerados: 0,
    tempoProcessamento: "Falhou",
    disponivel: false,
  },
  {
    id: 5,
    nome: "Prova_Biologia_Turma_C.mp4",
    dataEnvio: "2024-10-19 08:00",
    status: "Processando",
    duracao: "01:45:30",
    tamanho: "950 MB",
    formato: "MP4",
    resolucao: "1920x1080",
    highlightsGerados: 0,
    tempoProcessamento: "Em andamento...",
    disponivel: false,
  },
];

// Video Modal Component
function VideoModal({ highlight, isOpen, onClose }: { highlight: any; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{highlight.description}</h3>
            <p className="text-sm text-muted-foreground">{highlight.timestamp} - {highlight.duration}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <video
            controls
            autoPlay
            className="w-full rounded-lg"
            src={highlight.videoUrl}
          >
            Seu navegador não suporta vídeo.
          </video>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Tipo: {highlight.type}</p>
            <p className="text-sm text-muted-foreground">Confiança: {highlight.confidence}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Video Thumbnail Component
function VideoThumbnail({ highlight, isVideoAvailable, onModalOpen }: { highlight: any; isVideoAvailable: boolean; onModalOpen: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMouseEnter = () => {
    if (isVideoAvailable) {
      setIsHovered(true);
      setIsLoading(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setVideoLoaded(false);
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    setIsLoading(false);
  };

  const handleClick = () => {
    if (isVideoAvailable && (videoLoaded || !isHovered)) {
      onModalOpen();
    }
  };

  return (
    <div 
      className="relative w-32 h-18 rounded-lg overflow-hidden cursor-pointer border"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {!isHovered || !isVideoAvailable ? (
        <img 
          src={highlight.thumbnail} 
          alt="Video thumbnail"
          className="w-full h-full object-cover"
        />
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            </div>
          )}
          <video
            src={highlight.videoUrl}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
            onLoadedData={handleVideoLoad}
          />
        </>
      )}
      {!isVideoAvailable && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-white text-xs text-center px-2">
            Premium
          </div>
        </div>
      )}
    </div>
  );
}

export default function Record() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedHighlight, setSelectedHighlight] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const record = mockRecords.find(r => r.id === parseInt(id || '0'));
  
  if (!record) {
    return (
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Registro não encontrado</h1>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Processado: "default",
      Processando: "secondary",
      Erro: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    );
  };

  const isVideoAvailable = record.status === "Processado" && record.disponivel;

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
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalhes do Vídeo</h1>
          <p className="text-muted-foreground mt-2">
            Informações detalhadas e resultados do processamento
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
                <CardTitle className="break-all">{record.nome}</CardTitle>
                <CardDescription>Enviado em {record.dataEnvio}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(record.status)}
                <div className="relative group">
                  <Button
                    size="sm"
                    disabled={!isVideoAvailable}
                    className="disabled:cursor-not-allowed"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  {!isVideoAvailable && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      Vídeo não disponível para usuários gratuitos
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duração</p>
                  <p className="text-sm text-muted-foreground">{record.duracao}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileVideo className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tamanho</p>
                  <p className="text-sm text-muted-foreground">{record.tamanho}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Formato</p>
                <p className="text-sm text-muted-foreground">{record.formato}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Resolução</p>
                <p className="text-sm text-muted-foreground">{record.resolucao}</p>
              </div>
            </div>
          </CardContent>
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
            <CardTitle className="text-lg">Resultados do Processamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Highlights Gerados</span>
                <span className="text-2xl font-bold">{record.highlightsGerados}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tempo de Processamento</span>
                <span className="text-sm text-muted-foreground">{record.tempoProcessamento}</span>
              </div>
              {record.status === "Erro" && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    Erro durante o processamento. Tente enviar novamente.
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
                <span className="text-sm text-muted-foreground">#{record.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status</span>
                {getStatusBadge(record.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Disponibilidade</span>
                <span className={`text-sm ${record.disponivel ? 'text-green-600' : 'text-red-600'}`}>
                  {record.disponivel ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Highlights Section */}
      {record.status === "Processado" && record.highlightsGerados > 0 && (
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
                {(mockHighlights[record.id as keyof typeof mockHighlights] || []).map((highlight) => {
                  const getConfidenceBadge = (confidence: string) => {
                    const variants: Record<string, "default" | "secondary" | "destructive"> = {
                      Alto: "destructive",
                      Médio: "secondary",
                      Baixo: "default",
                    };
                    return (
                      <Badge variant={variants[confidence] || "default"} className="text-xs">
                        {confidence}
                      </Badge>
                    );
                  };

                  return (
                    <div key={highlight.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <VideoThumbnail 
                          highlight={highlight} 
                          isVideoAvailable={isVideoAvailable}
                          onModalOpen={() => openModal(highlight)}
                        />
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                {highlight.timestamp}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {highlight.duration}
                              </div>
                              {getConfidenceBadge(highlight.confidence)}
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
                              <div className="relative group">
                                <Button size="sm" disabled={!isVideoAvailable}>
                                  <DownloadIcon className="mr-1 h-3 w-3" />
                                  Baixar
                                </Button>
                                {!isVideoAvailable && (
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                    Disponível apenas para usuários premium
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{highlight.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Tipo: {highlight.type}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!mockHighlights[record.id as keyof typeof mockHighlights] || mockHighlights[record.id as keyof typeof mockHighlights].length === 0) && (
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
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </div>
  );
}