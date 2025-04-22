import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import Elections from "./pages/admin/Elections";
import ElectionSetup from "./pages/admin/ElectionSetup";
import CountingPanel from "./pages/admin/CountingPanel";
import NotFound from "./pages/NotFound";
import { LoginForm } from "./components/auth/LoginForm";
import { SignupForm } from "./components/auth/SignupForm";
import { ApolloClient, InMemoryCache, ApolloProvider, from, HttpLink } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { useEffect, useState } from "react";
import VerifyEmail from "./pages/VerifyEmail";
import { AccessPage } from "./pages/AccessPage";

// Initialize Apollo Client
if (!import.meta.env.VITE_GRAPHQL_API_URL) {
  console.error("Missing GraphQL API URL in environment variables");
}

// Error handling link with more detailed error logging
const errorLink = onError(({ networkError, graphQLErrors, operation }) => {
  if (networkError) {
    console.error(`[Network error on ${operation.operationName}]:`, networkError);
  }
  
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error in ${operation.operationName}]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
});

// Create HTTP link - WITH credentials for session auth
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_API_URL || "https://vote-stream-ticker.onrender.com/graphql",
  credentials: 'include', // Critical for session-based auth
  fetchOptions: {
    mode: 'cors',
  }
});

// Combine the links
const link = from([errorLink, httpLink]);

// Create Apollo client
const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: {
    mutate: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    }
  }
});

const queryClient = new QueryClient();

// Authentication utilities
const getToken = () => localStorage.getItem("token");
const getUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() > expirationTime;
  } catch (error) {
    console.error("Error parsing token:", error);
    return true;
  }
};

const isAuthenticated = () => {
  const token = getToken();
  return token && !isTokenExpired(token);
};

// Redirect authenticated users away from auth pages
const AuthRedirect = () => {
  const user = getUser();
  
  if (isAuthenticated()) {
    // Redirect based on user role
    if (user && user.role === "ADMIN") {
      return <Navigate to="/admin/elections" replace />;
    }
    // Default redirect for authenticated users
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Protected route component
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const token = getToken();
  const user = getUser();
  const [isAuth, setIsAuth] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated
      const isTokenValid = token && !isTokenExpired(token);
      setIsAuth(isTokenValid);

      // Check if user has required role
      const hasRequiredRole = allowedRoles.length === 0 || 
                             (user && allowedRoles.includes(user.role));
      setIsAuthorized(hasRequiredRole);
      
      setIsChecking(false);
    };

    checkAuth();
  }, [token, user, allowedRoles]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const App = () => (
  <ApolloProvider client={apolloClient}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<AccessPage />} />
            <Route path="/election/:id" element={<Index />} />
            
            {/* Auth pages with redirect for logged-in users */}
            <Route element={<AuthRedirect />}>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
            </Route>
            
            {/* Protected admin routes */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin/elections" element={<Elections />} />
              <Route path="/admin/elections/new" element={<ElectionSetup />} />
              <Route path="/admin/elections/:id/edit" element={<ElectionSetup />} />
              <Route path="/admin/elections/counting" element={<CountingPanel />} />
              <Route
              path="/admin/elections/:id/count"
              element={<CountingPanel />}
              />
            </Route>

            {/* Protected user routes */}
            <Route element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]} />}>
              {/* Placeholder for dashboard route */}
              {/* <Route path="/election/:id" element={<Index />} /> */}
              <Route path="/dashboard" element={<Index />} />
            </Route>

            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ApolloProvider>
);

export default App;