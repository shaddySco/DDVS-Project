import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../layout/Layout";
import ProtectedRoute from "./ProtectedRoute";

import Landing from "../pages/Landing";
import Community from "../pages/Community";
import SubmissionDetail from "../pages/SubmissionDetail";
import Submit from "../pages/Submit";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import PublicVerification from "../pages/PublicVerification";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/community" element={<Community />} />
          <Route path="/project/:id" element={<SubmissionDetail />} />

          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <Submit />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/profile/:wallet" element={<Profile />} />

          {/* ✅ PUBLIC VERIFICATION ROUTE */}
          <Route path="/verify/:id" element={<PublicVerification />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
