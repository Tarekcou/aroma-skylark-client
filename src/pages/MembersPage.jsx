import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MemberModal from "./MemberModal";
import axiosPublic from "../axios/AxiosPublic";
import toast from "react-hot-toast";

const MembersPage = () => {
  const [modalData, setModalData] = useState(undefined); // not null
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
    onError: () => toast.error("Delete failed"),
  });

  const handleDelete = (id) => {
    if (confirm("Are you sure to delete this member?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-xl">👥 Members List</h2>
        <button className="btn btn-primary" onClick={() => setModalData(null)}>
          + Add New Member
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200 text-sm">
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, idx) => (
              <tr key={m._id}>
                <td>{idx + 1}</td>
                <td>{m.name}</td>
                <td>{m.phone}</td>
                <td>{m.email}</td>
                <td>{m.role}</td>
                <td>
                  <div className="flex gap-2">
                    <button
                      className="btn-outline btn btn-sm"
                      onClick={() => setModalData(m)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-white btn btn-sm btn-error"
                      onClick={() => handleDelete(m._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading && <p className="p-4 text-center">Loading members...</p>}
        {!isLoading && members.length === 0 && (
          <p className="p-4 text-gray-500 text-center">No members yet.</p>
        )}
      </div>

      {/* Modal */}
      {modalData !== undefined && (
        <MemberModal
          data={modalData}
          closeModal={() => setModalData(undefined)}
        />
      )}
    </div>
  );
};

export default MembersPage;
