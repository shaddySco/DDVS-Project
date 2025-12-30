import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Layout() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "2rem" }}>
        <Outlet />
      </main>
    </>
  );
}
