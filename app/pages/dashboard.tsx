import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, FileVideo, Upload } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { auth } from "~/utils/auth";
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
import { Link, useNavigate } from "react-router";
import api from "~/services/axios-backend-client"; 
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";

interface Video {
  id: string; 
  title: string;
  original_filename: string;
  created_at: string;
  status: string;
  summary_status: string;
}

interface DashboardData {
  processed_videos: number;
  videos: Video[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estado para guardar os dados da API
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        // Chama a rota unificada que retorna { data: { videos: [], processed_videos: 0 } }
        const response = await api.get('/videos');
        
        if (response.data && response.data.data) {
          setDashboardData(response.data.data);
        }
      } catch (error: any) {
        console.error("Erro ao buscar vídeos:", error);
        if (error.response?.status === 401) {
             navigate('/login');
        } else {
             toast.error('Erro ao carregar dashboard.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
    
    // Polling silencioso a cada 10s para atualizar status sem piscar a tela
    const interval = setInterval(() => {
        api.get('/videos').then(res => {
            if(res.data.data) setDashboardData(res.data.data);
        }).catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Filtro local por título ou nome do arquivo
  const filteredVideos = (dashboardData?.videos || []).filter((video) =>
    (video.title || video.original_filename).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper de Badge 
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

  const formatDate = (isoString: string) => {
      if (!isoString) return "-";
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

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        {isLoading ? (
          <>
            {/* Skeletons*/}
            <Card><CardHeader><Skeleton className="h-4 w-24"/></CardHeader><CardContent><Skeleton className="h-8 w-16"/></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-20"/></CardHeader><CardContent><Skeleton className="h-8 w-12"/></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-24"/></CardHeader><CardContent><Skeleton className="h-8 w-14"/></CardContent></Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Vídeos</CardTitle>
                <FileVideo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.videos.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.processed_videos || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Processo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                    {/* Cálculo: Total - (Processados + Falhas) */}
                    {(dashboardData?.videos.length || 0) - (dashboardData?.processed_videos || 0) - (dashboardData?.videos.filter(v => v.status === 'FAILURE').length || 0)}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>

      {/* Buttons Section */}
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
        <Button
          onClick={() => navigate("/dashboard/upload-streaming")}
          variant="outline"
          className="flex-1 sm:flex-initial cursor-pointer"
        >
          <FileVideo className="mr-2 h-4 w-4" />
          Streaming ao Vivo
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
            <CardDescription>Lista de todos os vídeos enviados para análise</CardDescription>
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

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Arquivo / Título</TableHead>
                    <TableHead>Risco (IA)</TableHead>
                    <TableHead>Data de Envio</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredVideos.length > 0 ? (
                    filteredVideos.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium">
                          <Link to={`/dashboard/video/${video.id}`} className="hover:underline text-blue-600">
                            {video.title || video.original_filename}
                          </Link>
                        </TableCell>
                        
                        {/* Coluna de Risco */}
                        <TableCell>
                            {video.summary_status === "Intensamente Suspeito" && <Badge variant="destructive">Alto</Badge>}
                            {video.summary_status === "Levemente Suspeito" && <Badge variant="secondary">Médio</Badge>}
                            {video.summary_status === "Normal" && <Badge variant="outline">Baixo</Badge>}
                            {video.summary_status === "Erro" && <span className="text-red-500">-</span>}
                            {video.summary_status === "Analisando" && <span className="text-gray-400">...</span>}
                        </TableCell>

                        <TableCell>{formatDate(video.created_at)}</TableCell>
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
