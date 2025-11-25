import { Outlet } from "react-router";
import LandingPageNavbar from "~/components/landing-page-navbar";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingPageNavbar />
      <Outlet />
    </div>
  );
}
