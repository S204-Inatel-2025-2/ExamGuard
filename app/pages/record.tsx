import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  AlertCircle,
  PlayCircle,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useState, useEffect, useRef } from "react";
import api from "~/services/axios-backend-client";
import { auth } from "~/utils/auth";

// Tipagem unificada
interface Highlight {
  id: number;
  timestamp_str: string;
  timestamp_sec: number;
  description: string;
  type: string;
  confidence: string;
  confidence_level: "Alto" | "Médio" | "Baixo";
}

interface VideoRecord {
  id: string; // UUID string
  title: string;
  original_filename: string;
  created_at: string;
  status: string;
  summary_status: string;
  processed_video_url?: string;
  highlights: Highlight[];
  highlightsGerados: number;
  tempoProcessamento: string;
}

export default function Record() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState<VideoRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Referência ao player de vídeo principal
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Proteção de Rota
    if (!auth.isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchRecord = async () => {
      try {
        // Usa o cliente 'api' dele que já injeta o Token
        const response = await api.get(`/api/videos/${id}`);
        const data = response.data; // Axios já retorna JSON em .data

        setRecord(data);
      } catch (err: unknown) {
        console.error(err);
        const error = err as { response?: { status: number } };
        if (error.response?.status === 403) {
          setError("Você não tem permissão para ver este vídeo.");
        } else if (error.response?.status === 404) {
          setError("Vídeo não encontrado.");
        } else {
          setError("Erro ao carregar o vídeo.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();

    // Polling
    const intervalId = setInterval(() => {
      if (
        record &&
        (record.status === "PROCESSING" || record.status === "PENDING")
      ) {
        // Polling silencioso
        api
          .get(`/api/videos/${id}`)
          .then((res) => {
            setRecord(res.data);
          })
          .catch(() => {});
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [id, navigate, record]); // Added 'record' dependency for polling logic, but need to be careful.
  // Ideally, we should refactor polling to not depend on the state directly in the dependency array if we don't want resets,
  // but since the interval logic checks `record`, it needs it in scope or via a ref.
  // However, adding 'record' to deps means the interval clears and restarts on every record update.
  // This is acceptable here as it ensures `record` inside the closure is fresh.

  // Pula o vídeo para o timestamp
  const handleJumpToTimestamp = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
      videoRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-gray-400" />
      </div>
    );

  if (error || !record) {
    return (
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Erro</h1>
          <p className="mb-4 text-gray-600">
            {error || "Registro não encontrado"}
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isVideoReady =
    record.status === "SUCCESS" && record.processed_video_url;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight break-all">
            {record.title || record.original_filename}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge
              variant={record.status === "SUCCESS" ? "default" : "secondary"}
            >
              {record.status}
            </Badge>
            <span className="text-sm text-gray-500">
              Enviado em: {new Date(record.created_at).toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA ESQUERDA: Player Principal + Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Player de Vídeo */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="overflow-hidden bg-black border-none shadow-xl">
              <CardContent className="p-0 relative aspect-video flex items-center justify-center">
                {isVideoReady ? (
                  <video
                    ref={videoRef}
                    src={record.processed_video_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-white flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    <p>O vídeo está sendo processado...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Informações Técnicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                Resumo da Análise
                {isVideoReady && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(record.processed_video_url, "_blank")
                    }
                  >
                    <Download className="mr-2 h-4 w-4" /> Baixar Vídeo
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Duração Processamento
                </p>
                <p className="text-lg font-semibold">
                  {record.tempoProcessamento || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Nível de Risco
                </p>
                <p
                  className={`text-lg font-semibold ${record.summary_status === "Intensamente Suspeito" ? "text-red-600" : "text-gray-800"}`}
                >
                  {record.summary_status}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Highlights</p>
                <p className="text-lg font-semibold">
                  {record.highlightsGerados}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-sm">{record.status}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/*Lista de Highlights (Timeline) */}
        <div className="lg:col-span-1">
          <Card className="h-full max-h-[800px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Momentos Suspeitos
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Clique para ver o momento exato
              </p>{" "}
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-2 space-y-3">
              {!record.highlights || record.highlights.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p>Nenhum comportamento suspeito detectado.</p>
                </div>
              ) : (
                record.highlights.map((h, index) => (
                  <div
                    key={index}
                    onClick={() => handleJumpToTimestamp(h.timestamp_sec)}
                    className="group flex items-start gap-3 p-3 rounded-lg border hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all"
                  >
                    <div className="mt-1">
                      <PlayCircle className="h-8 w-8 text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <Badge
                          variant="outline"
                          className="bg-gray-100 font-mono text-xs group-hover:bg-white"
                        >
                          {h.timestamp_str}
                        </Badge>
                        <span
                          className={`text-xs font-bold ${
                            h.confidence_level === "Alto"
                              ? "text-red-600"
                              : h.confidence_level === "Médio"
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {h.confidence}
                        </span>
                      </div>
                      <p className="font-medium text-sm text-gray-800 leading-tight">
                        {h.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tipo: {h.type}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
