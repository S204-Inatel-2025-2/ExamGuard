
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
} from "../components/ui/card"
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";

import { Link } from "react-router"; 

export default function Home() {
  // const navigate = useNavigate();
  
  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-bold mb-4"
      >
        ExamGuard
      </motion.h1>
      <p className="text-lg text-gray-600 mb-8">
        Assistente Computacional Anti-trapaça para garantir provas seguras.
      </p>
        <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link to="/login">Entrar</Link>
        </Button>
        <Button>Cadastro</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 max-w-4xl w-full">
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2">
              Monitoramento em tempo real
            </h3>
            <p className="text-gray-600 text-sm">
              Detecte comportamentos suspeitos durante avaliações online.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2">
              Relatórios inteligentes
            </h3>
            <p className="text-gray-600 text-sm">
              Geração automática de insights sobre possíveis tentativas de
              fraude.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}