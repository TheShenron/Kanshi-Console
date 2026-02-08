import { useState } from "react";
import api from "../../api/axios";
import { DateTime } from "luxon";

export default function Proctoring() {
    const [resultId, setResultId] = useState("");

    // POST form (events)
    const [eventsText, setEventsText] = useState(
        JSON.stringify(
            [
                {
                    type: "TAB_SWITCH",
                    timestamp: new Date().toISOString(),
                    meta: { reason: "user switched tab" },
                },
            ],
            null,
            2
        )
    );

    // Responses
    const [addResponse, setAddResponse] = useState(null);
    const [getResponse, setGetResponse] = useState(null);
    const [deleteResponse, setDeleteResponse] = useState(null);

    // Loading
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [loadingGet, setLoadingGet] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    // Errors
    const [errorAdd, setErrorAdd] = useState("");
    const [errorGet, setErrorGet] = useState("");
    const [errorDelete, setErrorDelete] = useState("");

    // -------------------------
    // Helpers
    // -------------------------
    const formatDate = (date) => {
        if (!date) return "-";
        return DateTime.fromISO(date).toFormat("dd LLL yyyy, hh:mm a");
    };

    const safeParseJSON = (text) => {
        try {
            return { ok: true, value: JSON.parse(text) };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    };

    // -------------------------
    // POST: Add Proctoring
    // -------------------------
    const addProctoring = async (e) => {
        e.preventDefault();
        setLoadingAdd(true);
        setErrorAdd("");
        setAddResponse(null);

        const parsed = safeParseJSON(eventsText);

        if (!parsed.ok) {
            setErrorAdd("Events JSON is invalid: " + parsed.error);
            setLoadingAdd(false);
            return;
        }

        try {
            const payload = { events: parsed.value };

            const { data } = await api.post(
                `/results/${resultId}/proctoring`,
                payload
            );

            setAddResponse(data);
        } catch (err) {
            setErrorAdd(err?.response?.data?.message || err.message);
        } finally {
            setLoadingAdd(false);
        }
    };

    // -------------------------
    // GET: Fetch Proctoring
    // -------------------------
    const getProctoring = async () => {
        setLoadingGet(true);
        setErrorGet("");
        setGetResponse(null);

        try {
            const { data } = await api.get(`/results/${resultId}/proctoring`);
            setGetResponse(data);
        } catch (err) {
            setErrorGet(err?.response?.data?.message || err.message);
        } finally {
            setLoadingGet(false);
        }
    };

    // -------------------------
    // DELETE: Remove Proctoring
    // -------------------------
    const deleteProctoring = async () => {
        setLoadingDelete(true);
        setErrorDelete("");
        setDeleteResponse(null);

        try {
            const { data } = await api.delete(`/results/${resultId}/proctoring`);
            setDeleteResponse(data);
        } catch (err) {
            setErrorDelete(err?.response?.data?.message || err.message);
        } finally {
            setLoadingDelete(false);
        }
    };

    // -------------------------
    // UI
    // -------------------------
    return (
        <div style={{ padding: 20 }}>
            <h1>Proctoring API Tester</h1>

            {/* RESULT ID */}
            <div style={{ marginBottom: 20 }}>
                <h3>Result ID</h3>
                <input
                    placeholder="Enter Result ID"
                    value={resultId}
                    onChange={(e) => setResultId(e.target.value)}
                    style={{ width: "100%", padding: 10 }}
                />
            </div>

            <hr />

            {/* ADD PROCTORING */}
            <form onSubmit={addProctoring} style={{ marginTop: 20 }}>
                <h3>POST /results/:resultId/proctoring</h3>

                <label style={{ display: "block", marginBottom: 8 }}>
                    Events (JSON Array)
                </label>

                <textarea
                    rows={10}
                    value={eventsText}
                    onChange={(e) => setEventsText(e.target.value)}
                    style={{ width: "100%", padding: 10, fontFamily: "monospace" }}
                />

                <div style={{ marginTop: 10 }}>
                    <button type="submit" disabled={!resultId || loadingAdd}>
                        {loadingAdd ? "Adding..." : "Add Proctoring"}
                    </button>
                </div>

                {errorAdd && <p style={{ color: "red" }}>❌ {errorAdd}</p>}

                {addResponse && (
                    <div style={{ marginTop: 15 }}>
                        <h4>Add Response</h4>

                        <div
                            style={{
                                background: "#f4f4f4",
                                padding: 12,
                                borderRadius: 8,
                            }}
                        >
                            <p>
                                <b>Proctoring ID:</b> {addResponse?.data?._id || "-"}
                            </p>
                            <p>
                                <b>Result ID:</b> {addResponse?.data?.resultId || "-"}
                            </p>
                            <p>
                                <b>Events Count:</b>{" "}
                                {addResponse?.data?.events?.length ?? "-"}
                            </p>
                            <p>
                                <b>Created At:</b> {formatDate(addResponse?.data?.createdAt)}
                            </p>
                        </div>

                        <pre style={{ marginTop: 10 }}>
                            {JSON.stringify(addResponse, null, 2)}
                        </pre>
                    </div>
                )}
            </form>

            <hr />

            {/* GET PROCTORING */}
            <div style={{ marginTop: 20 }}>
                <h3>GET /results/:resultId/proctoring</h3>

                <button onClick={getProctoring} disabled={!resultId || loadingGet}>
                    {loadingGet ? "Fetching..." : "Fetch Proctoring"}
                </button>

                {errorGet && <p style={{ color: "red" }}>❌ {errorGet}</p>}

                {getResponse && (
                    <div style={{ marginTop: 15 }}>
                        <h4>Get Response</h4>

                        <div
                            style={{
                                background: "#f4f4f4",
                                padding: 12,
                                borderRadius: 8,
                            }}
                        >
                            <p>
                                <b>Proctoring ID:</b> {getResponse?.data?._id || "-"}
                            </p>
                            <p>
                                <b>Result ID:</b> {getResponse?.data?.resultId || "-"}
                            </p>
                            <p>
                                <b>Events Count:</b>{" "}
                                {getResponse?.data?.events?.length ?? "-"}
                            </p>
                            <p>
                                <b>Created At:</b> {formatDate(getResponse?.data?.createdAt)}
                            </p>
                        </div>

                        <pre style={{ marginTop: 10 }}>
                            {JSON.stringify(getResponse, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            <hr />

            {/* DELETE PROCTORING */}
            <div style={{ marginTop: 20 }}>
                <h3>DELETE /results/:resultId/proctoring</h3>

                <button
                    onClick={deleteProctoring}
                    disabled={!resultId || loadingDelete}
                >
                    {loadingDelete ? "Deleting..." : "Delete Proctoring"}
                </button>

                {errorDelete && <p style={{ color: "red" }}>❌ {errorDelete}</p>}

                {deleteResponse && (
                    <div style={{ marginTop: 15 }}>
                        <h4>Delete Response</h4>
                        <pre>{JSON.stringify(deleteResponse, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}
