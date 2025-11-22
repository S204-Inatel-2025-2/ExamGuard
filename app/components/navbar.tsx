import { motion } from "framer-motion";
import { Crosshair, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { auth } from "~/utils/auth";
import { Button } from "./ui/button";
import { useMounted } from "~/hooks/use-mounted";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMounted = useMounted();
  const navigate = useNavigate();

  function handleLogout() {
    auth.removeToken();
    navigate('/login', { replace: true });
  }

  return (
    <header className="border-b sticky top-0 bg-white z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Crosshair className="size-4" />
            </div>
            ExamGuard
        </Link>

        <nav className="hidden md:flex items-center gap-12 text-sm font-medium">
          <Link to="/dashboard/upload-video" className="hover:text-gray-600">
            Upload Vídeo
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </nav>

       <div className="md:hidden">
          {isMounted && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          )}
        </div>
      </div>
 
      {isMounted && mobileMenuOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden flex flex-col items-center gap-4 py-4 border-t bg-white"
        >
          <Link to="/dashboard/upload-video" className="hover:text-gray-600" onClick={() => setMobileMenuOpen(false)}>
            Upload Vídeo
          </Link>
          <Link to="/dashboard/upload-streaming" className="hover:text-gray-600" onClick={() => setMobileMenuOpen(false)}>
            Upload Streaming
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </motion.nav>
      )}
    </header>
  );
}

export default Navbar;