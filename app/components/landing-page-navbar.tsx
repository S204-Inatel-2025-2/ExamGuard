import { motion } from "framer-motion";
import { Crosshair, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";

function LandingPageNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="border-b sticky top-0 bg-white z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Crosshair className="size-4" />
            </div>
            ExamGuard
          </a>

        <nav className="hidden md:flex items-center gap-12 text-sm font-medium">
        </nav>

        <div className="hidden md:flex gap-2">
          <Button variant="outline" onClick={() => navigate("/login")}>
            Entrar
          </Button>
          <Button>Cadastro</Button>
        </div>

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
          <div className="flex gap-2">
            <Button variant="outline">Entrar</Button>
            <Button>Cadastro</Button>
          </div>
        </motion.nav>
      )}
    </header>
  );
}

export default LandingPageNavbar;