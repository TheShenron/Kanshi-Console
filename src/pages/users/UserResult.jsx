import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { DateTime, Duration } from "luxon";

const formatDateTime = (iso) => {
    if (!iso) return "-";
    return DateTime.fromISO(iso).toFormat("dd LLL yyyy, hh:mm a");
};

const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined) return "-";
    return Duration.fromObject({ seconds }).toFormat("hh:mm:ss");
};

export default function UserResult() {
    const navigate = useNavigate();
    const { hiringDriveId, userId } = useParams();

    const [drives, setDrives] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get(`/users/${hiringDriveId}/results/${userId}`)
            .then((res) => setDrives(res.data))
            .finally(() => setLoading(false));
    }, [hiringDriveId, userId]);


    useEffect(() => {
        api
            .get(`/users/me/hiring-drives-exam/${hiringDriveId}`)
            .then((res) => console.log(res.data))
            .finally(() => console.log("Finally"));
    }, []);


    if (loading) return <p>Loading...</p>;

    let content = <p>No results found</p>;

    if (drives?.data) {
        if (drives?.data?.history?.length > 0) {
            content = (
                <table
                    border="1"
                    style={{
                        borderCollapse: "collapse",
                        width: "100%",
                    }}
                >
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Exam</th>
                            <th>Attempt No</th>
                            <th>Status</th>
                            <th>Score</th>
                            <th>Result</th>
                            <th>Duration</th>
                            <th>Started At</th>
                            <th>Submitted At</th>
                            <th>View</th>
                        </tr>
                    </thead>

                    <tbody>
                        {drives?.data?.history?.map((h) => (
                            <tr key={h?._id}>
                                <td>
                                    <b>{drives?.data?.user?.name || "-"}</b>
                                </td>

                                <td>{drives?.data?.user?.email || "-"}</td>

                                <td>{h?.examId?.title || "-"}</td>

                                <td>{h?.attemptNo ?? "-"}</td>

                                <td style={{ textTransform: "capitalize" }}>
                                    {h?.status || "-"}
                                </td>

                                <td>{h?.score ?? 0}</td>

                                <td
                                    style={{
                                        fontWeight: "bold",
                                        color: h?.isPassed ? "green" : "red",
                                    }}
                                >
                                    {h?.status === "started"
                                        ? "Running ⏳"
                                        : h?.status === "expired"
                                            ? "Expired ⛔"
                                            : h?.isPassed
                                                ? "Passed ✅"
                                                : "Failed ❌"}
                                </td>

                                <td>{formatDuration(h?.durationTaken)}</td>

                                <td>{h?.startedAt ? formatDateTime(h.startedAt) : "-"}</td>

                                <td>{h?.submittedAt ? formatDateTime(h.submittedAt) : "-"}</td>

                                <td>
                                    <button onClick={() => navigate(`/proctoring/${h?._id}/${userId}`)}>
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else {
            content = <p>No attempts found</p>;
        }
    }

    return (
        <div>
            <h1>User Results</h1>

            <button onClick={() => navigate(-1)}>⬅ Back</button>

            <h3>
                Drive: {drives?.data?.drive?.name} | Passing Marks:{" "}
                {drives?.data?.drive?.passingMarks}
            </h3>

            {content}

        </div>
    );
}
