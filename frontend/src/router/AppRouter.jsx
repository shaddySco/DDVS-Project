import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../layout/layout";

import Landing from "../pages/Landing";
import Community from "../pages/Community";
import Project from "../pages/Project";
import Submit from "../pages/Submit";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import SubmissionDetail from "../pages/SubmissionDetail";

<Route path="/project/:id" element={<SubmissionDetail />} />


import ProtectedRoute from "./ProtectedRoute"; 


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/community" element={<Community />} />
          <Route path="/project/:id" element={<SubmissionDetail />} />
          <Route
 path="/submit" element={
  <ProtectedRoute>
    <Submit />
  </ProtectedRoute>
} />

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile/:wallet" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
