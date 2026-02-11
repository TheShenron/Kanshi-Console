import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { DateTime } from "luxon";

const formatDateTime = (iso) => {
    if (!iso) return "-";
    return DateTime.fromISO(iso).toFormat("dd LLL yyyy, hh:mm a");
};

export default function UserHiringDrives() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);

    const viewResult = (driveId) => {
        navigate(`/users/${userId}/${driveId}/results`);
    }

    useEffect(() => {
        api
            .get(`/users/${userId}/hiring-drives`)
            .then((res) => setDrives(res.data))
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1>User Hiring Drives</h1>
            <button onClick={() => navigate(-1)}>
                ⬅ Back
            </button>

            {drives?.data?.length === 0 ? (
                <p>No hiring drives found</p>
            ) : (
                <table
                    border="1"
                    style={{
                        borderCollapse: "collapse",
                    }}
                >
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Starts At</th>
                            <th>Ends At</th>
                            <th>Status</th>
                            <th>Attempts Used</th>
                            <th>Result</th>
                        </tr>
                    </thead>

                    <tbody>
                        {drives?.data?.map((d) => (
                            <tr key={d._id}>
                                <td>{d.name}</td>
                                <td>
                                    <b>{d.code}</b>
                                </td>
                                <td>{formatDateTime(d.startsAt)}</td>
                                <td>{formatDateTime(d.endsAt)}</td>
                                <td style={{ color: d.isActive ? "green" : "red" }}>
                                    {d.isActive ? "Active ✅" : "Inactive ❌"}
                                </td>
                                <td>{d.attemptsUsed}</td>
                                <td><button onClick={() => viewResult(d._id)}>View Result</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

        </div>
    );
}
