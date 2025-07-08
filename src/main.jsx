import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { createBrowserRouter, RouterProvider } from "react-router";
import StartPage from './pages/StartPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import BookDetails from './components/BookDetails.jsx';
import NotFound from './components/NotFound.jsx';
// import TransactionForm from './components/TransactionForm.jsx';
import { BookProvider } from './context/BookContext.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import MembersPage from './pages/MembersPage.jsx';
import Installment from './components/Installment.jsx';
import DashboardTab from './components/DashboardTab.jsx';
import CategoryList from './components/CategoryList.jsx';
import CategoryTransactions from './components/CategoryTransactions.jsx';


const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <StartPage />,
    errorElement: <NotFound />, // 404 for root-level
  },
 {
  path: "/dashboard",
  element: (
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  ),
  children: [
    { index: true, element: <DashboardTab /> },
    { path: "categories", element: <DashboardTab />, 
      children: [
        { index: true, element: <></> }, // You can leave empty or render null
        { path: ":categoryName", element: <CategoryTransactions /> },
      ]
    },
  ]
}
,
  {
    path: "*",
    Component: NotFound, // ✅ catch-all for any unknown top-level route
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BookProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </QueryClientProvider>
      </BookProvider>
    </AuthProvider>
  </StrictMode>
);
