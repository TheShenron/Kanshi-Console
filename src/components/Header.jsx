import { NavLink } from "react-router-dom";

export default function Header() {
    const linkStyle = ({ isActive }) => ({
        marginRight: "12px",
        textDecoration: "none",
        fontWeight: isActive ? "bold" : "normal",
    });

    return (
        <header style={{ marginBottom: "20px" }}>
            <NavLink to="/" style={linkStyle}>Login</NavLink>
            <NavLink to="/users" style={linkStyle}>Users</NavLink>
            <NavLink to="/hiring-drives" style={linkStyle}>Hiring Drives</NavLink>
            <NavLink to="/exams" style={linkStyle}>Exams</NavLink>
            <NavLink to="/results" style={linkStyle}>Results</NavLink>
            <NavLink to="/proctoring" style={linkStyle}>Proctoring</NavLink>
        </header>
    );
}
