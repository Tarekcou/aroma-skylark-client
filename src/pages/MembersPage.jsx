// ✅ MembersPage.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosPublic from "../axios/AxiosPublic";
import toast from "react-hot-toast";
import MemberModal from "./MemberModal";

const MembersPage = () => {
  const [modalData, setModalData] = useState(null);
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
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

  const handleDelete = (id) => {
    if (confirm("Are you sure to delete this member?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-xl">👥 Members</h2>
        <button onClick={() => setModalData({})} className="btn btn-primary">
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
              <th>Role</th>
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
                <td>{m.role}</td>
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

      {modalData && (
        <MemberModal data={modalData} closeModal={() => setModalData(null)} />
      )}
    </div>
  );
};

export default MembersPage;
