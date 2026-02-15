import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { DateTime } from "luxon";
import { calculateProctoringScore } from "../../utils/proctoringScore";

const formatEventTime = (ts) => {
    if (!ts) return "-";
    return DateTime.fromMillis(ts).toFormat("dd LLL yyyy, hh:mm:ss a");
};

export default function UserProctoringReport() {
    const navigate = useNavigate();
    const { resultId, userId } = useParams();

    const [loading, setLoading] = useState(true);
    const [proctoring, setProctoring] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!resultId) return;

        setLoading(true);
        setError("");

        api
            .get(`/results/${resultId}/${userId}/proctoring`)
            .then((res) => setProctoring(res.data?.data || null))
            .catch((err) => {
                setError(
                    err?.response?.data?.message || "Failed to fetch proctoring data."
                );
            })
            .finally(() => setLoading(false));
    }, [resultId]);

    const risk = useMemo(() => {
        return calculateProctoringScore(proctoring?.events || []);
    }, [proctoring]);

    const riskColor =
        risk.level === "HIGH" ? "red" : risk.level === "MEDIUM" ? "orange" : "green";

    const summary = useMemo(() => {
        const events = proctoring?.events || [];
        const counts = {};

        for (const e of events) {
            counts[e.type] = (counts[e.type] || 0) + 1;
        }

        return counts;
    }, [proctoring]);

    return (
        <div style={{ padding: 20 }}>
            <button onClick={() => navigate(-1)}>⬅ Back</button>

            <h1 style={{ marginTop: 15 }}>Proctoring Report</h1>

            <p>
                <b>Result ID:</b> {resultId}
            </p>

            {loading && <p>Loading proctoring data...</p>}

            {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

            {!loading && !error && !proctoring && <p>No proctoring data found.</p>}

            {!loading && proctoring && (
                <>
                    {/* ----------------------------- */}
                    {/* Risk Score Section */}
                    {/* ----------------------------- */}
                    <div
                        style={{
                            border: "1px solid #ddd",
                            padding: 15,
                            borderRadius: 10,
                            marginBottom: 20,
                            background: "#fafafa",
                        }}
                    >
                        <h2 style={{ marginTop: 0 }}>
                            Risk Score:{" "}
                            <span style={{ color: riskColor }}>
                                {risk.score}/100 ({risk.level})
                            </span>
                        </h2>

                        {risk.reasons.length > 0 ? (
                            <>
                                <h3>Reasons</h3>
                                <ul style={{ marginTop: 5 }}>
                                    {risk.reasons.map((r, idx) => (
                                        <li key={idx}>{r}</li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <p style={{ marginBottom: 0 }}>
                                No suspicious patterns detected.
                            </p>
                        )}
                    </div>

                    <p>
                        <b>Total Events:</b> {proctoring?.events?.length || 0}
                    </p>

                    {/* ----------------------------- */}
                    {/* Summary */}
                    {/* ----------------------------- */}
                    <h2>Summary</h2>

                    <table
                        border="1"
                        style={{
                            borderCollapse: "collapse",
                            width: "100%",
                            marginBottom: 20,
                        }}
                    >
                        <thead>
                            <tr>
                                <th>Event Type</th>
                                <th>Count</th>
                            </tr>
                        </thead>

                        <tbody>
                            {Object.keys(summary).length === 0 ? (
                                <tr>
                                    <td colSpan={2}>No events</td>
                                </tr>
                            ) : (
                                Object.entries(summary).map(([type, count]) => (
                                    <tr key={type}>
                                        <td style={{ fontWeight: "bold" }}>{type}</td>
                                        <td>{count}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* ----------------------------- */}
                    {/* Timeline */}
                    {/* ----------------------------- */}
                    <h2>Timeline</h2>

                    <table
                        border="1"
                        style={{
                            borderCollapse: "collapse",
                            width: "100%",
                        }}
                    >
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Type</th>
                                <th>Time</th>
                                <th>Meta</th>
                            </tr>
                        </thead>

                        <tbody>
                            {proctoring?.events?.map((ev, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>

                                    <td
                                        style={{
                                            fontWeight: "bold",
                                            color: ev.type === "FOCUS_LOST" ? "red" : "black",
                                        }}
                                    >
                                        {ev.type}
                                    </td>

                                    <td>{formatEventTime(ev.timestamp)}</td>

                                    <td>
                                        {ev.meta ? (
                                            <pre
                                                style={{
                                                    margin: 0,
                                                    whiteSpace: "pre-wrap",
                                                    fontSize: 12,
                                                    background: "#f6f6f6",
                                                    padding: 10,
                                                    borderRadius: 6,
                                                }}
                                            >
                                                {JSON.stringify(ev.meta, null, 2)}
                                            </pre>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}
