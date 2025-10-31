import { useState } from "react";
import { motion } from "framer-motion";
import { Search, FileVideo, Upload } from "lucide-react";
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

// Mock data
const mockVideos = [
  {
    id: 1,
    nome: "Prova_Matematica_Turma_A.mp4",
    dataEnvio: "2024-10-15 14:30",
    status: "Processado",
  },
  {
    id: 2,
    nome: "Exame_Fisica_Online.mp4",
    dataEnvio: "2024-10-16 09:15",
    status: "Processando",
  },
  {
    id: 3,
    nome: "Avaliacao_Quimica_Turma_B.mp4",
    dataEnvio: "2024-10-17 16:45",
    status: "Processado",
  },
  {
    id: 4,
    nome: "Teste_Historia_EAD.mp4",
    dataEnvio: "2024-10-18 11:20",
    status: "Erro",
  },
  {
    id: 5,
    nome: "Prova_Biologia_Turma_C.mp4",
    dataEnvio: "2024-10-19 08:00",
    status: "Processando",
  },
];

export default function DashboardHome() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVideos = mockVideos.filter((video) =>
    video.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Vídeos
            </CardTitle>
            <FileVideo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockVideos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockVideos.filter((v) => v.status === "Processado").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Processo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockVideos.filter((v) => v.status === "Processando").length}
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
          className="flex-1 sm:flex-initial"
        >
          <Upload className="mr-2 h-4 w-4" />
          Enviar Vídeo
        </Button>
        <Button
          onClick={() => navigate("/dashboard/upload-streaming")}
          variant="outline"
          className="flex-1 sm:flex-initial"
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
            <CardDescription>
              Lista de todos os vídeos enviados para análise
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome do arquivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Table - Desktop */}
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Arquivo</TableHead>
                    <TableHead>Data de Envio</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVideos.length > 0 ? (
                    filteredVideos.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium">
                          <Link to={`/dashboard/video/${video.id}`} className="hover:underline">
                            {video.nome}
                          </Link>
                        </TableCell>
                        <TableCell>{video.dataEnvio}</TableCell>
                        <TableCell>{getStatusBadge(video.status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        Nenhum vídeo encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Cards - Mobile */}
            <div className="md:hidden space-y-3">
              {filteredVideos.length > 0 ? (
                filteredVideos.map((video) => (
                  <Card key={video.id}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/dashboard/video/${video.id}`} className="font-medium text-sm break-all">
                            {video.nome}
                          </Link>
                          {getStatusBadge(video.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {video.dataEnvio}
                        </p>
                      </div>
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