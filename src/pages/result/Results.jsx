import { useState } from "react";
import api from "../../api/axios";
import { DateTime, Duration } from "luxon";

export default function Results() {
    const [startForm, setStartForm] = useState({
        examId: "",
        hiringDriveId: "",
    });

    const [submitForm, setSubmitForm] = useState({
        examId: "",
        hiringDriveId: "",
        score: 0,
        isPassed: false,
    });

    const [startResponse, setStartResponse] = useState(null);
    const [submitResponse, setSubmitResponse] = useState(null);

    const [loadingStart, setLoadingStart] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const [errorStart, setErrorStart] = useState("");
    const [errorSubmit, setErrorSubmit] = useState("");

    const formatDate = (date) => {
        if (!date) return "-";
        return DateTime.fromISO(date).toFormat("dd LLL yyyy, hh:mm a");
    };

    const formatDuration = (seconds) => {
        if (seconds === null || seconds === undefined) return "-";
        return Duration.fromObject({ seconds }).toFormat("hh:mm:ss");
    };

    const handleStartChange = (e) => {
        const { name, value } = e.target;
        setStartForm((prev) => ({ ...prev, [name]: value }));
    };

    const startExam = async (e) => {
        e.preventDefault();
        setLoadingStart(true);
        setErrorStart("");
        setStartResponse(null);

        try {
            const { data } = await api.post("/results/me/start", startForm);
            setStartResponse(data);
        } catch (err) {
            setErrorStart(err?.response?.data?.message || err.message);
        } finally {
            setLoadingStart(false);
        }
    };

    const handleSubmitChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSubmitForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const submitExam = async (e) => {
        e.preventDefault();
        setLoadingSubmit(true);
        setErrorSubmit("");
        setSubmitResponse(null);

        try {
            const payload = {
                ...submitForm,
                score: Number(submitForm.score),
            };

            const { data } = await api.post("/results/me/submit", payload);
            setSubmitResponse(data);
        } catch (err) {
            setErrorSubmit(err?.response?.data?.message || err.message);
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>Results API Tester</h1>

            <form onSubmit={startExam} style={{ marginBottom: 30 }}>
                <h3>Start Exam</h3>

                <input
                    name="examId"
                    placeholder="Exam ID"
                    value={startForm.examId}
                    onChange={handleStartChange}
                    required
                />

                <input
                    name="hiringDriveId"
                    placeholder="Hiring Drive ID"
                    value={startForm.hiringDriveId}
                    onChange={handleStartChange}
                    required
                />

                <div style={{ marginTop: 10 }}>
                    <button type="submit" disabled={loadingStart}>
                        {loadingStart ? "Starting..." : "Start Exam"}
                    </button>
                </div>

                {errorStart && <p style={{ color: "red" }}>❌ {errorStart}</p>}

                {startResponse && (
                    <div style={{ marginTop: 15 }}>
                        <h4>Start Response</h4>

                        <div
                            style={{
                                background: "#f4f4f4",
                                padding: 12,
                                borderRadius: 8,
                            }}
                        >
                            <p>
                                <b>Attempt No:</b> {startResponse?.data?.attemptNo ?? "-"}
                            </p>

                            <p>
                                <b>Status:</b>{" "}
                                <span style={{ fontWeight: "bold" }}>
                                    {startResponse?.data?.status || "-"}
                                </span>
                            </p>

                            <p>
                                <b>Started At:</b> {formatDate(startResponse?.data?.startedAt)}
                            </p>

                            <p>
                                <b>Result ID:</b> {startResponse?.data?._id || "-"}
                            </p>
                        </div>

                        <pre style={{ marginTop: 10 }}>
                            {JSON.stringify(startResponse, null, 2)}
                        </pre>
                    </div>
                )}
            </form>

            <hr />

            <form onSubmit={submitExam} style={{ marginTop: 30 }}>
                <h3>Submit Exam</h3>

                <input
                    name="examId"
                    placeholder="Exam ID"
                    value={submitForm.examId}
                    onChange={handleSubmitChange}
                    required
                />

                <input
                    name="hiringDriveId"
                    placeholder="Hiring Drive ID"
                    value={submitForm.hiringDriveId}
                    onChange={handleSubmitChange}
                    required
                />

                <input
                    type="number"
                    name="score"
                    placeholder="Score"
                    value={submitForm.score}
                    onChange={handleSubmitChange}
                    required
                />

                <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                        type="checkbox"
                        name="isPassed"
                        checked={submitForm.isPassed}
                        onChange={handleSubmitChange}
                    />
                    Passed?
                </label>

                <div style={{ marginTop: 10 }}>
                    <button type="submit" disabled={loadingSubmit}>
                        {loadingSubmit ? "Submitting..." : "Submit Exam"}
                    </button>
                </div>

                {errorSubmit && <p style={{ color: "red" }}>❌ {errorSubmit}</p>}

                {submitResponse && (
                    <div style={{ marginTop: 15 }}>
                        <h4>Submit Response</h4>

                        <div
                            style={{
                                background: "#f4f4f4",
                                padding: 12,
                                borderRadius: 8,
                            }}
                        >
                            <p>
                                <b>Attempt No:</b> {submitResponse?.data?.attemptNo ?? "-"}
                            </p>

                            <p>
                                <b>Status:</b>{" "}
                                <span style={{ fontWeight: "bold" }}>
                                    {submitResponse?.data?.status || "-"}
                                </span>
                            </p>

                            <p>
                                <b>Started At:</b> {formatDate(submitResponse?.data?.startedAt)}
                            </p>

                            <p>
                                <b>Submitted At:</b>{" "}
                                {formatDate(submitResponse?.data?.submittedAt)}
                            </p>

                            <p>
                                <b>Duration Taken:</b>{" "}
                                {formatDuration(submitResponse?.data?.durationTaken)}
                            </p>

                            <p>
                                <b>Score:</b> {submitResponse?.data?.score ?? 0}
                            </p>

                            <p
                                style={{
                                    fontWeight: "bold",
                                    color: submitResponse?.data?.isPassed ? "green" : "red",
                                }}
                            >
                                {submitResponse?.data?.isPassed ? "Passed ✅" : "Failed ❌"}
                            </p>
                        </div>

                        <pre style={{ marginTop: 10 }}>
                            {JSON.stringify(submitResponse, null, 2)}
                        </pre>
                    </div>
                )}
            </form>
        </div>
    );
}
