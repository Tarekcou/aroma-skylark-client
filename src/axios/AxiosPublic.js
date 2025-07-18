// src/axios.js
import axios from "axios";

const axiosPublic = axios.create({
  // baseURL: "http://localhost:5005/api",
  baseURL: "https://aroma-skylark-server.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosPublic;
