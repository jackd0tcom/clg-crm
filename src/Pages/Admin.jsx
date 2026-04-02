import { useState, useEffect } from "react";
import axios from "axios";
import AdminUserToggle from "../Elements/Admin/AdminUserItem";
import { useAuth0 } from "@auth0/auth0-react";
import Loader from "../Elements/UI/Loader";
import ProfilePic from "../Elements/UI/ProfilePic";
import PendingUserItem from "../Elements/Admin/PendingUserItem";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isLoading } = useAuth0();
  const [newUser, setNewUser] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);

  const fetchUsers = async () => {
    await axios.get("/api/admin/users").then((res) => {
      setPendingUsers(res.data.allowedEmails);
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
        },
      );

      if (response.data.success) {
        // Update the user in place instead of refetching all users
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.userId === user.userId ? { ...u, isAllowed: !u.isAllowed } : u,
          ),
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
        },
      );

      if (response.data.success) {
        // Update the user in place
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.userId === user.userId ? { ...u, role: newRole } : u,
          ),
        );
      }
    } catch (error) {
      console.error("❌ Failed to update user role:", error);
      // Optionally show an error message
    }
  };

  const handleAddUser = async () => {
    try {
      await axios.post("/api/addUser", { email: newUser }).then((res) => {
        if (res.status === 200) {
          setPendingUsers((prev) => [...prev, res.data]);
          setShowAddUser(false);
          setNewUser("");
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-header">
        <h1 className="section-heading">Admin</h1>
        <button className="green-button" onClick={() => setShowAddUser(true)}>
          Add User
        </button>
      </div>
      {showAddUser ? (
        <div className="admin-section add-user-wrapper">
          <i class="fa-solid fa-circle-user"></i>
          <h2>Add a New User</h2>
          <p>
            To add a new user enter their email below, click add user, and
            instruct them to sign in with the email that was added
          </p>
          <input
            type="text"
            placeholder="Email address"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            className="new-user-input"
          />
          <button className="green-button" onClick={() => handleAddUser()}>
            Add User
          </button>
          <button
            className="light-button"
            onClick={() => setShowAddUser(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Users</h2>
              <p>View and manage your users</p>
            </div>
            <div className="users-list">
              <div className="users-list-head">
                <p></p>
                <p>Name</p>
                <p>Email</p>
                <p>Role</p>
                <p>Permission</p>
              </div>
              <div className="admin-users-list">
                {loading ? (
                  <Loader />
                ) : (
                  <>
                    {users &&
                      users.map((user) => {
                        return (
                          <AdminUserToggle
                            key={user.userId}
                            user={user}
                            handleAllow={handleAllow}
                            handleRoleChange={handleRoleChange}
                            users={users}
                            setUsers={setUsers}
                          />
                        );
                      })}
                    {pendingUsers?.map((user) => (
                      <PendingUserItem
                        user={user}
                        setPendingUsers={setPendingUsers}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default Admin;
