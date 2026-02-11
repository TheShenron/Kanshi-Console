import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: 'candidate',
        code: ''
    });
    const [editingId, setEditingId] = useState(null);

    const fetchUsers = async () => {
        const { data } = await api.get("/users");
        setUsers(data?.data || []);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submitForm = async (e) => {
        e.preventDefault();

        if (editingId) {
            if (form.password === "") {
                delete form.password;
            }
            await api.put(`/users/${editingId}`, form);
        } else {
            await api.post("/users", form);
        }

        setForm({ name: "", email: "", password: "", role: 'candidate', code: '' });
        setEditingId(null);
        fetchUsers();
    };

    const editUser = (user) => {
        setEditingId(user._id);
        setForm({
            name: user.name,
            email: user.email,
            role: user.role,
            password: "",
            code: ''
        });
    };

    const deleteUser = async (id) => {
        if (!confirm("Delete user?")) return;
        await api.delete(`/users/${id}`);
        fetchUsers();
    };

    return (
        <div>
            <h1>Users API Tester</h1>

            <form onSubmit={submitForm}>
                <h3>{editingId ? "Update User" : "Create User"}</h3>

                <input
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <input
                    name="role"
                    placeholder="Role"
                    value={form.role}
                    onChange={handleChange}
                    required
                />

                <input
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required={!editingId}
                />

                <input
                    name="code"
                    placeholder="code"
                    value={form.code}
                    onChange={handleChange}
                    required={!editingId}
                />

                <button type="submit">
                    {editingId ? "Update" : "Create"}
                </button>
            </form>

            <hr />

            <h3>All Users</h3>

            <table
                border="1"
                style={{
                    borderCollapse: "collapse",
                }}
            >
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((u) => (
                        <tr key={u._id}>
                            <td>
                                <b>{u.name}</b>
                            </td>

                            <td>{u.email}</td>

                            <td>{u.role}</td>

                            <td style={{ display: "flex", gap: 10 }}>
                                <button onClick={() => editUser(u)}>Edit</button>
                                <button onClick={() => deleteUser(u._id)}>Delete</button>

                                <Link to={`/users/${u._id}/hiring-drives`}>
                                    Hiring Drives
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}
