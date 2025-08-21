import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "@fortawesome/fontawesome-free/css/all.min.css";

import { createBrowserRouter, RouterProvider } from "react-router";
import StartPage from './pages/LoginPage.jsx';
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
import CategoryList from './components/CategoryList.jsx';
import CategoryTransactions from './components/CategoryTransactions.jsx';
import CategoryLayout from './components/CategoryLayout.jsx';
import MainLayout from './layout/MainLayout.jsx';
import AllTransactions from './components/AllTransactions.jsx';
import ProductList from './pages/product/ProductList.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LoginPage from './pages/LoginPage.jsx';
import TransactionListTable from './components/TransactionListTable.jsx';
import HomeLayout from './layout/HomeLayout.jsx';
import ProductDetails from './pages/product/ProductDetails.jsx';


const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <NotFound />, // 404 for root-level
    children:[
      {index: true, element: <AllTransactions />}, // / (root)
      {path:"login", element: <LoginPage />}
    ]
  },

  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {index: true, element: <Dashboard />}, // /dashboard
      {
        path: "transactions",
        element: (
          <PrivateRoute>
            <AllTransactions />
          </PrivateRoute>
        ), // Wrap with PrivateRoute
      },
      {
        path: "categories",
        element: <CategoryLayout />, // New wrapper
        children: [
          { index: true, element: <CategoryList /> }, // /dashboard/categories
          { path: ":categoryName", element: <CategoryTransactions /> }, // /dashboard/categories/:name
        ],
      },
      { path: "members", element: <MembersPage /> },
      { path: "installment", element: <Installment /> },
      {
        path: "products",
        element: <ProductList />,
      },
      {
        path: "products/:id",
        element: <ProductDetails />,
      },
    ],
  },

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
