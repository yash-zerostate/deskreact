import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { SiteLayout } from "@/components/SiteLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SignupPage } from "@/pages/SignupPage";
import { TicketsPage } from "@/pages/TicketsPage";
import { ComparePage } from "@/pages/site/ComparePage";
import { FaqPage } from "@/pages/site/FaqPage";
import { FeaturesPage } from "@/pages/site/FeaturesPage";
import { HomePage } from "@/pages/site/HomePage";
import { PricingPage } from "@/pages/site/PricingPage";
import { TestimonialsPage } from "@/pages/site/TestimonialsPage";

/**
 * The marketing site is PUBLIC and is several real routes.
 *
 * "/" used to be the dashboard behind ProtectedRoute, so the first thing any visit produced was a
 * redirect to /login. That is the wrong shape for what this demo is for: Preta targets on visitor
 * attributes that only exist once the context cookie is written, so the comparison worth looking
 * at is the SAME public page seen anonymously and then signed in. A gate at the front makes the
 * anonymous half of that unreachable.
 *
 * Separate routes rather than one scrolling page, because a pathname is what an element is scoped
 * to and a route change is what the loader's SPA handling reacts to — an anchor link exercises
 * neither.
 *
 * The app itself stays behind the gate. Only the shop window is open.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/faq" element={<FaqPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
