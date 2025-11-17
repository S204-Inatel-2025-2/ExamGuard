import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, FileVideo, Upload, Loader2, Folder } from "lucide-react"; // NOVO: Ícone de Pasta
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
import { Link, useNavigate } from "react-router";

const VITE_API_URL = "http://localhost:5001";

// Função para formatar a data
const formatDate = (isoString: string) => {
  if (!isoString) return "Data indisponível";
  try {
    return new Date(isoString).toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (e) { return isoString; }
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const [exams, setExams] = useState<any[]>([]); // MODIFICADO: de 'videos' para 'exams'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stats
  const [stats, setStats] = useState({ total: 0, processing: 0, success: 0 });

  // Busca as "Pastas" (Exams) da API
  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${VITE_API_URL}/api/exams`); // MODIFICADO: Rota agora é /api/exams
        if (!response.ok) {
          throw new Error("Falha ao buscar as provas.");
        }
        const data = await response.json();
        setExams(data);

        // Calcula os stats
        let totalVideos = 0;
        let totalProcessing = 0;
        let totalSuccess = 0;
        data.forEach((exam: any) => {
          totalVideos += exam.video_count;
          totalProcessing += exam.processing_count;
          totalSuccess += (exam.video_count - exam.processing_count - exam.failure_count);
        });
        setStats({ total: totalVideos, processing: totalProcessing, success: totalSuccess });

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  // Filtra as pastas (exams)
  const filteredExams = exams.filter((exam) =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Define o status GERAL da pasta
  const getExamStatusBadge = (exam: any) => {
    if (exam.failure_count > 0) {
      return <Badge variant="destructive">Erro</Badge>;
    }
    if (exam.processing_count > 0) {
      return <Badge variant="secondary">Processando</Badge>;
    }
    if (exam.video_count > 0) {
      return <Badge variant="default">Processado</Badge>;
    }
    return <Badge variant="outline">Vazio</Badge>;
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
          Gerencie e monitore suas pastas de avaliação
        </p>
      </motion.div>

      {/* Stats Cards (Modificado para usar stats reais) */}
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
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats.total}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats.success}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Processo</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats.processing}</div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Upload Button Section (Sem alterações) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Button
          onClick={() => navigate("/dashboard/upload-video")}
          className="flex-1 sm:flex-initial"
        >
          <Upload className="mr-2 h-4 w-4" />
          Enviar Vídeo
        </Button>
        {/* ... (botão de streaming) ... */}
      </motion.div>

      {/* Table Section (MODIFICADO para mostrar PASTAS) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Pastas de Provas</CardTitle>
            <CardDescription>
              Cada pasta contém um ou mais vídeos enviados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por Nome da Pasta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            )}
            {error && (
              <div className="text-center py-8 text-red-500">
                <p>Erro ao carregar pastas: {error}</p>
              </div>
            )}

            {/* Table - Desktop */}
            {!loading && !error && (
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome da Pasta</TableHead>
                      <TableHead>Vídeos</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExams.length > 0 ? (
                      filteredExams.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium">
                            <Link
                              to={`/dashboard/exam/${exam.id}`} // MODIFICADO: Link para a pasta
                              className="hover:underline flex items-center"
                            >
                              <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                              {exam.name}
                            </Link>
                          </TableCell>
                          <TableCell>{exam.video_count}</TableCell>
                          <TableCell>{formatDate(exam.created_at)}</TableCell>
                          <TableCell>{getExamStatusBadge(exam)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Nenhuma pasta encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Cards - Mobile */}
            {!loading && !error && (
              <div className="md:hidden space-y-3">
                {filteredExams.length > 0 ? (
                  filteredExams.map((exam) => (
                    <Card key={exam.id}>
                      <CardContent className="p-4">
                        <Link to={`/dashboard/exam/${exam.id}`}> {/* MODIFICADO: Link */}
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-medium text-sm break-all flex items-center">
                                <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                                {exam.name}
                              </span>
                              {getExamStatusBadge(exam)}
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{formatDate(exam.created_at)}</span>
                              <span>{exam.video_count} vídeo(s)</span>
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
                        Nenhuma pasta encontrada
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}