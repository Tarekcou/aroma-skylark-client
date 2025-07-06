// src/pages/NotFound.jsx
import { Link } from "react-router";

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center p-6 min-h-screen text-center">
      <h1 className="mb-4 font-bold text-red-500 text-6xl">404</h1>
      <p className="mb-6 text-gray-600 text-xl">Page Not Found</p>
      <Link to="/" className="btn btn-primary">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
