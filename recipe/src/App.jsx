import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Auth from "./components/Auth";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Users = lazy(() => import("./pages/Users"));
const Categories = lazy(() => import("./pages/Categories"));
const Locations = lazy(() => import("./pages/Locations"));
const Reviews = lazy(() => import("./pages/Reviews"));

// Loading component
const LoadingFallback = ({ message = "Loading..." }) => (
  <div className="loading-state">
    <div className="loading-spinner"></div>
    <p>{message}</p>
  </div>
);

function AppContent() {
  const { user, loading, signOut, profile } = useAuth();

  // Show loading with timeout
  if (loading) {
    return (
      <div className="app-container">
        <LoadingFallback message="Initializing app..." />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="app-title">
            🌴 My Cherthala - Hidden Gems Guide
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link">
              🏠 Home
            </Link>
            <Link to="/users" className="nav-link">
              👥 Users
            </Link>
            <Link to="/categories" className="nav-link">
              🏷️ Categories
            </Link>
            <Link to="/locations" className="nav-link">
              📍 Locations
            </Link>
            <Link to="/reviews" className="nav-link">
              ⭐ Reviews
            </Link>
            <div className="user-menu">
              <span className="user-greeting">
                Hi, {profile?.full_name || user.email}!
              </span>
              <button onClick={signOut} className="nav-link sign-out-btn">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with Suspense */}
      <Suspense fallback={<LoadingFallback message="Loading page..." />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<Users />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/reviews" element={<Reviews />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
