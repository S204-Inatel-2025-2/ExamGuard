import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, FileVideo, Upload, Loader2 } from "lucide-react";
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
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Link, useNavigate } from "react-router";

// Interface baseada no retorno do Backend Python
interface Video {
  id: number;
  title: string;
  original_filename: string;
  created_at: string;
  status: string;
  summary_status: string;
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca dados reais do backend
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/videos`);
        if (response.ok) {
          const data = await response.json();
          setVideos(data);
        }
      } catch (error) {
        console.error("Erro ao buscar vídeos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
    
    // Atualiza a cada 10 segundos (Polling simples para ver mudança de status)
    const interval = setInterval(fetchVideos, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredVideos = videos.filter((video) =>
    (video.title || video.original_filename).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      SUCCESS: "default",
      PROCESSING: "secondary",
      PENDING: "secondary",
      FAILURE: "destructive",
    };

    const label = {
        SUCCESS: "Processado",
        PROCESSING: "Processando",
        PENDING: "Pendente",
        FAILURE: "Erro"
    }[status] || status;

    return (
      <Badge variant={variants[status] || "default"}>
        {label}
      </Badge>
    );
  };

  // Formata data ISO para PT-BR
  const formatDate = (isoString: string) => {
      return new Date(isoString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie e monitore seus vídeos de avaliação
        </p>
      </motion.div>

      {/* Stats Cards - Calculados dinamicamente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Vídeos
            </CardTitle>
            <FileVideo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videos.filter((v) => v.status === "SUCCESS").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Processo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videos.filter((v) => v.status === "PROCESSING" || v.status === "PENDING").length}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upload Button Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Button
          onClick={() => navigate("/dashboard/upload-video")}
          className="flex-1 sm:flex-initial cursor-pointer"
        >
          <Upload className="mr-2 h-4 w-4" />
          Enviar Vídeo
        </Button>
      </motion.div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Vídeos Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : (
                <>
                    {/* Table - Desktop */}
                    <div className="hidden md:block rounded-md border">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Título / Arquivo</TableHead>
                            <TableHead>Data de Envio</TableHead>
                            <TableHead>Risco</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredVideos.length > 0 ? (
                            filteredVideos.map((video) => (
                            <TableRow key={video.id}>
                                <TableCell className="font-medium">
                                <Link to={`/dashboard/video/${video.id}`} className="hover:underline text-blue-600">
                                    {video.title || video.original_filename}
                                </Link>
                                </TableCell>
                                <TableCell>{formatDate(video.created_at)}</TableCell>
                                <TableCell>
                                    {video.summary_status === "Intensamente Suspeito" && <Badge variant="destructive">Alto</Badge>}
                                    {video.summary_status === "Levemente Suspeito" && <Badge variant="secondary">Médio</Badge>}
                                    {video.summary_status === "Normal" && <Badge variant="outline">Baixo</Badge>}
                                    {video.summary_status === "Erro" && <span className="text-red-500">-</span>}
                                    {video.summary_status === "Analisando" && <span className="text-gray-400">...</span>}
                                </TableCell>
                                <TableCell>{getStatusBadge(video.status)}</TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                            <TableCell colSpan={4} className="text-center py-8">
                                Nenhum vídeo encontrado
                            </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </div>

                    {/* Cards - Mobile (Simplificado) */}
                    <div className="md:hidden space-y-3">
                        {filteredVideos.map((video) => (
                            <Card key={video.id}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between mb-2">
                                        <Link to={`/dashboard/video/${video.id}`} className="font-bold text-blue-600">
                                            {video.title}
                                        </Link>
                                        {getStatusBadge(video.status)}
                                    </div>
                                    <p className="text-sm text-gray-500">{formatDate(video.created_at)}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}