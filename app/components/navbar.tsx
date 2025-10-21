import { motion } from "framer-motion";
import { Crosshair, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="border-b sticky top-0 bg-white z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Crosshair className="size-4" />
            </div>
            <Link to="/dashboard" className="p-0 hover:bg-transparent hover:underline">
              ExamGuard
            </Link>
          </a>

        <nav className="hidden md:flex items-center gap-12 text-sm font-medium">
          <Link to="dashboard/upload-video" className="hover:text-gray-600">
            Upload Vídeo
          </Link>
          <Link to="dashboard/upload-streaming" className="hover:text-gray-600">
            Upload Streaming
          </Link>
        </nav>

        {/* <div className="hidden md:flex gap-2"> */}
          {/* <Button variant="outline" className="display-" onClick={() => navigate("/login")}>
            Entrar
          </Button>
          <Button className="display-none">Cadastro</Button> */}
        {/* </div> */}

        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden flex flex-col items-center gap-4 py-4 border-t bg-white"
        >
          <Link to="/upload-video" className="hover:text-gray-600">
            Upload Vídeo
          </Link>
          <Link to="/upload-streaming" className="hover:text-gray-600">
            Upload Streaming
          </Link>
          <div className="flex gap-2">
            {/* <Button variant="outline">Entrar</Button> */}
            {/* <Button>Cadastro</Button> */}
          </div>
        </motion.nav>
      )}
    </header>
  );
}

export default Navbar;