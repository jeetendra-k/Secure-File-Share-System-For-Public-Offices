import { useEffect, useState } from "react";
import { userService } from "../services/user.service";
import type { User } from "../services/user.service";
import { useAuth } from "../context/AuthContext";
import UserRow from "../components/UserRow";
import AddEmployeeModal from "../components/AddEmployeeModal";

const UserManagement = () => {
  const { token, user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // 🔐 Admin-only gate
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    return (
      <div className="p-10 text-red-500">
        Access denied. Admins only.
      </div>
    );
  }

  const loadUsers = () => {
    setLoading(true);
    userService
      .getUsers(token!)
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return <div className="p-10">Loading users...</div>;
  }

  return (
    <div className="p-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Personnel Roster
        </h1>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
        >
          + Add New Employee
        </button>
      </div>

      {/* TABLE */}
      <table className="w-full border border-gray-700 rounded">
        <thead className="bg-[#0b1220]">
          <tr>
            <th className="p-3 text-left">Employee ID</th>
            <th>Department</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <UserRow key={u.id} user={u} />
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showAdd && (
        <AddEmployeeModal
          onClose={() => {
            setShowAdd(false);
            loadUsers(); // 🔄 refresh list after adding
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
