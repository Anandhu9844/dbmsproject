import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { Trash2 } from "lucide-react";
import "./Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ full_name: "", email: "", hometown: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { user, profile } = useAuth();

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      setMessage("Error fetching users: " + error.message);
    }
  }

  async function addUser(e) {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.hometown) {
      setMessage("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("users").insert([
        {
          id: crypto.randomUUID(), // Generate a random UUID for demo
          full_name: form.full_name,
          email: form.email,
          hometown: form.hometown,
        },
      ]);
      if (error) throw error;

      setForm({ full_name: "", email: "", hometown: "" });
      fetchUsers();
      setMessage("User added successfully!");
    } catch (error) {
      setMessage("Error adding user: " + error.message);
    }
    setLoading(false);
  }

  async function deleteUser(id) {
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
      fetchUsers();
      setMessage("User deleted successfully!");
    } catch (error) {
      setMessage("Error deleting user: " + error.message);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="users-container">
      <h1 className="users-heading">
        👥 My Cherthala Users
      </h1>

      {message && (
        <div className={`message-box ${message.includes("Error") ? "message-error" : "message-success"}`}>
          {message}
        </div>
      )}

      {/* Add User Form */}
      <div className="form-card">
        <div className="card-body">
          <h2 className="form-heading">
            Add New User
          </h2>
          <form onSubmit={addUser}>
            <div className="form-row">
              <input
                className="form-input"
                placeholder="Full Name"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
              />
              <input
                className="form-input"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="form-input"
                placeholder="Hometown"
                value={form.hometown}
                onChange={(e) => setForm({ ...form, hometown: e.target.value })}
              />
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add User"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Users List */}
      <div className="users-grid">
        {users.map((userItem) => (
          <div key={userItem.id} className="user-card">
            <div className="card-body">
              <div className="user-header">
                <div className="user-content">
                  <div className="user-name">
                    {userItem.full_name}
                  </div>
                  <div className="user-email">{userItem.email}</div>
                  <div className="badge badge-blue">{userItem.hometown}</div>
                  <div className="join-date">
                    Joined: {userItem.created_at ? new Date(userItem.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <button
                  className="delete-button"
                  onClick={() => deleteUser(userItem.id)}
                  aria-label="Delete user"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <p className="empty-state">
          No users found. Add the first user above!
        </p>
      )}
    </div>
  );
}