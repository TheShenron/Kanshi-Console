import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

import { DateTime, Duration } from "luxon";

const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined) return "-";
    return Duration.fromObject({ seconds }).toFormat("hh:mm:ss");
};

const formatDateTime = (iso) => {
    if (!iso) return "-";
    return DateTime.fromISO(iso).toFormat("dd LLL yyyy, hh:mm a");
};

export default function HiringDriveDetails() {
    const { id } = useParams();
    const [drive, setDrive] = useState(null);
    const [results, setResults] = useState(null);
    const [exam, setExam] = useState(null);
    const [userId, setUserId] = useState("");
    const [examId, setExamId] = useState("");

    const fetchDrive = async () => {
        const { data } = await api.get(`/hiring-drives/${id}/candidates`);
        setDrive(data || {});
    };

    const fetchDriveResult = async () => {
        const { data } = await api.get(`/hiring-drives/${id}/results`);
        setResults(data || {});
    };

    const fetchExam = async () => {
        const { data } = await api.get(`/hiring-drives/${id}/exams`);
        setExam(data || {});
    };

    useEffect(() => {
        fetchDrive();
        fetchExam();
        fetchDriveResult()
    }, [id]);

    if (!drive) return <p>Loading...</p>;

    const addCandidate = async () => {
        await api.post(`/hiring-drives/${id}/candidates`, { userId: [userId] });
        setUserId("");
        fetchDrive();
    };

    const removeCandidate = async (uid) => {
        await api.delete(`/hiring-drives/${id}/candidates/${uid}`);
        fetchDrive();
    };

    const incAttempts = async (uid) => {
        await api.patch(`/hiring-drives/${id}/candidates/${uid}/attempts/inc`);
        fetchDrive();
    };

    const decAttempts = async (uid) => {
        await api.patch(`/hiring-drives/${id}/candidates/${uid}/attempts/dec`);
        fetchDrive();
    };

    const addExam = async () => {
        await api.post(`/hiring-drives/${id}/exam`, { examIds: [examId] });
        setExamId("");
        fetchExam();
    };

    const removeExam = async (eid) => {
        await api.delete(`/hiring-drives/${id}/exams/${eid}`);
        fetchExam();
    };

    return (
        <div>
            <Link to="/hiring-drives">⬅ Back</Link>
            <h3> Total Drive Count: {drive?.count}</h3>

            <h3>Candidates</h3>
            <input
                placeholder="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />
            <button onClick={addCandidate}>Add Candidate</button>

            {drive?.data?.length === 0 ? (
                <p>No candidates found</p>
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
                            <th>Email</th>
                            <th>Attempts Used</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {drive?.data?.map((c) => (
                            <tr key={c?.userId?._id}>
                                <td>
                                    <b>{c.userId?.name || "-"}</b>
                                </td>

                                <td>{c.userId?.email || "-"}</td>

                                <td>
                                    <b>{c.attemptsUsed}</b>
                                </td>

                                <td style={{ display: "flex", gap: 10 }}>
                                    <button onClick={() => incAttempts(c.userId?._id)}>
                                        Attempts +1
                                    </button>

                                    <button onClick={() => decAttempts(c.userId?._id)}>
                                        Attempts -1
                                    </button>

                                    <button onClick={() => removeCandidate(c.userId?._id)}>
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            )}

            <h3>Exams</h3>
            <input
                placeholder="Exam ID"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
            />
            <button onClick={addExam}>Add Exam</button>

            {exam?.data?.length === 0 ? (
                <p>No exams found</p>
            ) : (
                <table
                    border="1"
                    style={{
                        borderCollapse: "collapse",
                    }}
                >
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Difficulty</th>
                            <th>Duration (min)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {exam?.data?.map((e) => (
                            <tr key={e?._id}>
                                <td>
                                    <b>{e?.title || "-"}</b>
                                </td>

                                <td>{e?.description || "-"}</td>

                                <td style={{ textTransform: "capitalize" }}>
                                    {e?.difficulty || "-"}
                                </td>

                                <td>{e?.duration ?? "-"}</td>

                                <td style={{ color: e?.isActive ? "green" : "red" }}>
                                    {e?.isActive ? "Active ✅" : "Inactive ❌"}
                                </td>

                                <td>
                                    <button onClick={() => removeExam(e?._id)}>
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}


            <h3>
                Drive: {results?.data?.drive?.name} | Passing Marks:{" "}
                {results?.data?.drive?.passingMarks}
            </h3>

            {results?.data?.candidates?.length === 0 ? (
                <p>No candidates found</p>
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
                            <th>Email</th>
                            <th>Exam</th>
                            <th>Attempt No</th>
                            <th>Status</th>
                            <th>Score</th>
                            <th>Result</th>
                            <th>Duration</th>
                            <th>Started At</th>
                            <th>Submitted At</th>
                        </tr>
                    </thead>

                    <tbody>
                        {results?.data?.candidates?.flatMap((c) => {
                            // if no history → show one row saying not attempted
                            if (!c?.history?.length) {
                                return (
                                    <tr key={c?.user?._id}>
                                        <td><b>{c?.user?.name || "-"}</b></td>
                                        <td>{c?.user?.email || "-"}</td>
                                        <td colSpan={8} style={{ textAlign: "center" }}>
                                            Not Attempted
                                        </td>
                                    </tr>
                                );
                            }

                            // if history exists → one row per attempt
                            return c.history.map((h) => (
                                <tr key={h?._id}>
                                    <td><b>{c?.user?.name || "-"}</b></td>
                                    <td>{c?.user?.email || "-"}</td>

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

                                    <td>{formatDuration(h?.durationTaken ?? 0)}</td>

                                    <td>{h?.startedAt ? formatDateTime(h.startedAt) : "-"}</td>
                                    <td>{h?.submittedAt ? formatDateTime(h.submittedAt) : "-"}</td>
                                </tr>
                            ));
                        })}
                    </tbody>
                </table>
            )}

        </div>
    );
}
