import { useState } from "react";
import api from "../../api/axios";

export default function Login() {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [editingId, setEditingId] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submitForm = async (e) => {
        e.preventDefault();

        const { data } = await api.post("/users/login", form);
        setForm({ email: "", password: "" });
        setEditingId(null);
        localStorage.setItem("token", data?.data?.token);
        alert("Login successful! Token stored in localStorage.");
    };

    return (
        <div>
            <h1>Login API Tester</h1>

            {/* CREATE / UPDATE */}
            <form onSubmit={submitForm}>
                <h3>{editingId ? "Update User" : "Create User"}</h3>

                <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
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

                <button type="submit">
                    Login
                </button>
            </form>

            <hr />

        </div>
    );
}
