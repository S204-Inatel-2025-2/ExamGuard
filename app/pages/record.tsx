import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  FileVideo,
  Loader2,
  Folder,
  AlertTriangle, // NOVO
  ShieldCheck, // NOVO
  ShieldAlert, // NOVO
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";

const VITE_API_URL = "http://localhost:5001";

const formatDate = (isoString: string) => {
  if (!isoString) return "Data indisponível";
  try {
    return new Date(isoString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return isoString;
  }
};

// Mapeia status de PROCESSAMENTO
const getProcessingStatusBadge = (status: string) => {
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
    <Badge variant={variants[status] || "default"} className="text-xs">
      {textMap[status] || status}
    </Badge>
  );
};

// NOVO: Badge para o "Status Geral" (Suspeita)
const getSummaryStatusBadge = (summaryStatus: string) => {
  if (summaryStatus === "Intensamente Suspeito") {
    return (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Intenso
      </Badge>
    );
  }
  if (summaryStatus === "Levemente Suspeito") {
    return (
      <Badge variant="secondary" className="text-xs bg-yellow-400 text-black">
        <ShieldAlert className="h-3 w-3 mr-1" />
        Leve
      </Badge>
    );
  }
  if (summaryStatus === "Normal") {
    return (
      <Badge variant="default" className="text-xs bg-green-600 text-white">
        <ShieldCheck className="h-3 w-3 mr-1" />
        Normal
      </Badge>
    );
  }
   if (summaryStatus === "Analisando") {
    return (
      <Badge variant="outline" className="text-xs">
        Analisando...
      </Badge>
    );
  }
  return (
     <Badge variant="outline" className="text-xs">
        {summaryStatus || 'N/A'}
      </Badge>
  );
};

export default function Record() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${VITE_API_URL}/api/exams/${id}`);
        if (!response.ok) {
          throw new Error("Pasta de prova não encontrada");
        }
        const data = await response.json();
        setExam(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">
            {error || "Pasta não encontrada"}
          </h1>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const filteredVideos = (exam.videos || []).filter((video: any) =>
    video.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Folder className="h-8 w-8 text-muted-foreground" />
            {exam.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Todos os vídeos enviados para esta pasta de prova.
          </p>
        </div>
      </motion.div>

      {/* Tabela de Vídeos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Vídeos Enviados</CardTitle>
            <CardDescription>
              Lista de todos os vídeos nesta pasta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome do arquivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tabela - Desktop */}
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Arquivo</TableHead>
                    <TableHead>Data de Envio</TableHead>
                    <TableHead>Status (Processo)</TableHead>
                    <TableHead>Status (Análise)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVideos.length > 0 ? (
                    filteredVideos.map((video: any) => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/dashboard/video/${video.id}`}
                            className="hover:underline flex items-center"
                          >
                            <FileVideo className="h-4 w-4 mr-2 text-muted-foreground" />
                            {video.original_filename}
                          </Link>
                        </TableCell>
                        <TableCell>{formatDate(video.created_at)}</TableCell>
                        <TableCell>{getProcessingStatusBadge(video.status)}</TableCell>
                        {/* NOVO: Coluna de Status da Análise */}
                        <TableCell>{getSummaryStatusBadge(video.summary_status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        Nenhum vídeo encontrado nesta pasta.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Cards - Mobile */}
            <div className="md:hidden space-y-3">
              {filteredVideos.length > 0 ? (
                filteredVideos.map((video: any) => (
                  <Card key={video.id}>
                    <CardContent className="p-4">
                      <Link to={`/dashboard/video/${video.id}`}>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium text-sm break-all flex items-center">
                              <FileVideo className="h-4 w-4 mr-2 text-muted-foreground" />
                              {video.original_filename}
                            </span>
                             {getSummaryStatusBadge(video.summary_status)}
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-muted-foreground">
                              {formatDate(video.created_at)}
                            </p>
                            {getProcessingStatusBadge(video.status)}
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Nenhum vídeo encontrado
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}