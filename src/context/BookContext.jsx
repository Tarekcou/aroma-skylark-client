// src/context/BookContext.jsx
import { createContext, useContext, useState } from "react";

const BookContext = createContext();

export const useBook = () => useContext(BookContext);

export const BookProvider = ({ children }) => {
  const [bookName, setBookName] = useState("");

  return (
    <BookContext.Provider value={{ bookName, setBookName }}>
      {children}
    </BookContext.Provider>
  );
};
