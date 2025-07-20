// ✅ MembersPage.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosPublic from "../axios/AxiosPublic";
import toast from "react-hot-toast";
import MemberModal from "./MemberModal";
import Swal from "sweetalert2";
import { MdAdd } from "react-icons/md";

const MembersPage = () => {
  const [modalData, setModalData] = useState(null);
  const queryClient = useQueryClient();

  const { refetch,data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await axiosPublic.get("/members");
      return res.data.members || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await axiosPublic.delete(`/members/${id}`),
    onSuccess: () => {
      toast.success("Member deleted");
      queryClient.invalidateQueries(["members"]);
    },
  });

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This transaction will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      deleteMutation.mutate(id);
      // toast.success("Entry deleted");

      // Trigger refetch to refresh the data
      if (refetch) refetch();
    } catch (err) {
      toast.error("Failed to delete entry");
    }
  };
  

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-xl">👥 Members</h2>
        <button
          onClick={() => setModalData({})}
          className="hidden md:block btn btn-primary"
        >
          + Add Member
        </button>
      </div>

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200">
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Subscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={m._id}>
                <td>{i + 1}</td>
                <td>{m.name}</td>
                <td>{m.phone}</td>
                <td>{m.email}</td>
                <td>{m.subscription}</td>
                <td>
                  <button
                    className="btn-outline btn btn-sm"
                    onClick={() => setModalData(m)}
                  >
                    Edit
                  </button>
                  <button
                    className="ml-2 btn btn-error btn-sm"
                    onClick={() => handleDelete(m._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => setModalData({})}
        className="md:hidden bottom-0 left-1/2 z-30 absolute -translate-x-1/2 transform btn btn-primary btn-sm"
      >
        <MdAdd /> Add Member
      </button>
      {members.length == 0 && (
        <p className="flex justify-center items-center min-h-[50vh] text-gray-500 text-center">
          No Members found.
        </p>
      )}

      {modalData && (
        <MemberModal data={modalData} closeModal={() => setModalData(null)} />
      )}
    </div>
  );
};

export default MembersPage;
