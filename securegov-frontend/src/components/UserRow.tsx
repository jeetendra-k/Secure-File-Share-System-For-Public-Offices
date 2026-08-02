import type { User } from "../services/user.service";

const roleBadge = (role: string) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "bg-red-600";
    case "ADMIN":
      return "bg-blue-600";
    case "DEPT_OFFICER":
      return "bg-yellow-500";
    case "CLERK":
      return "bg-gray-500";
    case "AUDITOR":
      return "bg-green-600";
    case "SECURITY_OFFICER":
      return "bg-purple-600";
    default:
      return "bg-gray-700";
  }
};

const UserRow = ({ user }: { user: User }) => {
  return (
    <tr className="border-t border-gray-700">
      <td className="p-3 font-medium">{user.employee_id}</td>
      <td>{user.department}</td>
      <td>
        <span
          className={`px-3 py-1 text-xs rounded ${roleBadge(
            user.role
          )}`}
        >
          {user.role}
        </span>
      </td>
      <td className="text-gray-400">Active</td>
    </tr>
  );
};

export default UserRow;
