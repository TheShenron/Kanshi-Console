import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

export default function HiringDriveDetails() {
    const { id } = useParams();
    const [drive, setDrive] = useState(null);
    const [exam, setExam] = useState(null);
    const [userId, setUserId] = useState("");
    const [examId, setExamId] = useState("");

    const fetchDrive = async () => {
        const { data } = await api.get(`/hiring-drives/${id}/candidates`);
        setDrive(data || {});
    };

    const fetchExam = async () => {
        const { data } = await api.get(`/hiring-drives/${id}/exams`);
        setExam(data || {});
    };
    useEffect(() => {
        fetchDrive();
        fetchExam();
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
        fetchDrive();
    };

    const removeExam = async (eid) => {
        await api.delete(`/hiring-drives/${id}/exams/${eid}`);
        fetchDrive();
    };

    return (
        <div>
            <Link to="/hiring-drives">⬅ Back</Link>
            <h1>{drive?.count}</h1>
            {console.log(drive)}

            <h3>Candidates</h3>
            <input
                placeholder="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />
            <button onClick={addCandidate}>Add Candidate</button>

            <ul>
                {drive?.data?.map((c) => (
                    <li key={c?.userId?._id}>
                        {console.log(c)}
                        {c.userId?.name || c.userId?._id} — Attempts: {c.attemptsUsed}
                        <button onClick={() => removeCandidate(c.userId?._id)}>Remove</button>
                        <button onClick={() => incAttempts(c.userId?._id)}>
                            Attempts+1
                        </button>

                        <button onClick={() => decAttempts(c.userId?._id)}>
                            Attempts-1
                        </button>
                    </li>
                ))}
            </ul>

            <h3>Exams</h3>
            <input
                placeholder="Exam ID"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
            />
            <button onClick={addExam}>Add Exam</button>

            <ul>
                {exam?.data?.map((e) => (
                    <li key={e?._id}>
                        {JSON.stringify(e)}
                        <button onClick={() => removeExam(e?._id)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
