import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { NavLink, useNavigate } from "react-router";
import axiosPublic from "../axios/AxiosPublic";
import { useBook } from "../context/BookContext";

// Fetch all books
const fetchBooks = async () => {
  const res = await axiosPublic.get("/books");
  return res.data;
};

// Create new book
const createBook = async ({ name }) => {
  const res = await axiosPublic.post("/books", { name });
  return res.data;
};

// Update book
const updateBook = async ({ id, name }) => {
  const res = await axiosPublic.put(`/books/${id}`, { name });
  return res.data;
};

// Delete book
const deleteBook = async (id) => {
  const res = await axiosPublic.delete(`/books/${id}`);
  return res.data;
};

const BookList = () => {
  const queryClient = useQueryClient();

  const [newBookName, setNewBookName] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [editedName, setEditedName] = useState("");

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
  });

  const createMutation = useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      toast.success("Book created!");
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setNewBookName("");
    },
    onError: () => toast.error("Failed to create book"),
  });

  const updateMutation = useMutation({
    mutationFn: updateBook,
    onSuccess: () => {
      toast.success("Book updated!");
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setEditModalOpen(false);
    },
    onError: () => toast.error("Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      toast.success("Book deleted");
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  const handleCreateBook = () => {
    if (!newBookName.trim()) return toast.error("Please enter a name");
    createMutation.mutate({ name: newBookName.trim() });
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    setEditedName(book.name);
    setEditModalOpen(true);
    document.getElementById("edit_modal").showModal();
  };

  const handleUpdate = () => {
    updateMutation.mutate({ id: selectedBook._id, name: editedName });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure?")) {
      deleteMutation.mutate(id);
    }
  };
 const { setBookName } = useBook();
  const navigate=useNavigate()
 const handleBookClick = (book) => {
   setBookName(book.name);
   navigate(`/dashboard/${book.name}/${book._id}/transactions`, { replace: true });
 };
  return (
    <div className="space-y-4">
      {/* Add Book Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="New Book Name"
          className="input-bordered w-full max-w-xs input"
          value={newBookName}
          onChange={(e) => setNewBookName(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleCreateBook}>
          Add Book
        </button>
      </div>

      {/* Book List */}
      <div className="space-y-3">
        {books.map((book) => (
          <div
            onClick={() => handleBookClick(book)}
            
            key={book._id}
            className="flex justify-between bg-white hover:bg-gray-100 shadow p-4 rounded-lg transition-colors cursor-pointer"
          >
            <div>
              <h3 className="font-bold text-blue-600 hover:underline">
                {book.name}
              </h3>
              <p className="text-gray-500 text-sm">
                Updated: {new Date(book.updatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(book)}
                className="btn-outline btn btn-sm btn-info"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(book._id)}
                className="btn-outline btn btn-sm btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <dialog id="edit_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Edit Book</h3>
          <input
            type="text"
            className="mt-4 input-bordered w-full input"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
          <div className="modal-action">
            <form method="dialog" className="space-x-2">
              <button className="btn">Cancel</button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleUpdate}
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default BookList;
