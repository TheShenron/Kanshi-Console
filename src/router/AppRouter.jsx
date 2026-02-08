import { BrowserRouter, Routes, Route } from "react-router-dom";
import Users from "../pages/users/Users";
import NotFound from "../pages/NotFound";
import Header from "../components/Header";
import UserHiringDrives from "../pages/users/UserHiringDrives";
import HiringDrives from "../pages/hiringDrives/HiringDrives";
import HiringDriveDetails from "../pages/hiringDrives/HiringDriveDetails";
import Exams from "../pages/exams/Exams";
import Results from "../pages/result/Results";
import Login from "../pages/login/Login";
import Proctoring from "../pages/Proctoring/Proctoring";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<Login />} />
                {/* Users */}
                <Route path="/users" element={<Users />} />
                <Route
                    path="/users/:userId/hiring-drives"
                    element={<UserHiringDrives />}
                />

                {/* HiringDrives */}
                <Route path="/hiring-drives" element={<HiringDrives />} />
                <Route
                    path="/hiring-drives/:id"
                    element={<HiringDriveDetails />}
                />

                {/* Exams */}
                <Route path="/exams" element={<Exams />} />

                {/* Result */}
                <Route path="/results" element={<Results />} />

                {/* Proctoring */}
                <Route path="/proctoring" element={<Proctoring />} />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
