import { useState, useEffect } from "react";
import axios from "axios";
import AdminUserToggle from "../Elements/AdminUserItem";
import { useAuth0 } from "@auth0/auth0-react";
import Loader from "../Elements/Loader";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isLoading } = useAuth0();

  const fetchUsers = async () => {
    await axios.get("/api/admin/users").then((res) => {
      setUsers(res.data.users);
      setLoading(false);
    });
  };
  useEffect(() => {
    try {
      fetchUsers();
    } catch (error) {}
  }, []);

  const handleAllow = async (user) => {
    try {
      const response = await axios.post(
        `/api/admin/users/${user.userId}/access`,
        {
          isAllowed: !user.isAllowed, // Toggle the current state
        }
      );

      if (response.data.success) {
        // Update the user in place instead of refetching all users
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.userId === user.userId ? { ...u, isAllowed: !u.isAllowed } : u
          )
        );
      }
    } catch (error) {
      console.error("❌ Failed to update user access:", error);
      // Optionally show an error message
    }
  };

  const handleRoleChange = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";

    try {
      const response = await axios.post(
        `/api/admin/users/${user.userId}/role`,
        {
          role: newRole,
        }
      );

      if (response.data.success) {
        // Update the user in place
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.userId === user.userId ? { ...u, role: newRole } : u
          )
        );
      }
    } catch (error) {
      console.error("❌ Failed to update user role:", error);
      // Optionally show an error message
    }
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-header">
        <h1 className="section-heading">Admin</h1>
      </div>
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>Users</h2>
        </div>
        <div className="users-list">
          <div className="users-list-head">
            <p></p>
            <p>Name</p>
            <p>Email</p>
            <p>Role</p>
            <p>Permission</p>
          </div>
          {loading ? (
            <Loader />
          ) : (
            users &&
            users.map((user) => {
              return (
                <AdminUserToggle
                  key={user.userId}
                  user={user}
                  handleAllow={handleAllow}
                  handleRoleChange={handleRoleChange}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
export default Admin;
