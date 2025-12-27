import { useEffect, useState } from "react";
import { connectToHub, disconnectFromHub } from "../services/signalR";
import { useSelector } from "react-redux";

function Notification()
{
    const [userId, setUserId] = useState("");
    const [connected, setConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const {userData} = useSelector((state) => state.auth);
    
    useEffect(() =>
    {
        setUserId(userData?.userId || "");
        const savedId = localStorage.getItem("userId");
        if (savedId)
        {
            setUserId(savedId);

            // Auto connect on reload
            connectToHub(savedId, (msg) =>
            {
                setNotifications((prev) =>
                {
                    const updated = [msg, ...prev];
                    localStorage.setItem("notifications", JSON.stringify(updated));
                    return updated;
                });
            }).then(() =>
            {
                setConnected(true);
            });
        }

        const savedNotifications = localStorage.getItem("notifications");
        if (savedNotifications)
        {
            setNotifications(JSON.parse(savedNotifications));
        }
    }, []);

    const start = async () =>
    {
        if (!userId) return alert("Please enter userId");

        localStorage.setItem("userId", userId);

        await connectToHub(userId, (msg) =>
        {
            setNotifications((prev) =>
            {
                const updated = [msg, ...prev];
                localStorage.setItem("notifications", JSON.stringify(updated));
                return updated;
            });
        });

        setConnected(true);
    };

    const stop = () =>
    {
        disconnectFromHub(userId);
        setConnected(false);
        localStorage.removeItem("notifications");
    };

    return (
        <div style={{ padding: 40 }}>
            <h2>🔔 Notification Client (User-Specific)</h2>

            <input
                disabled= {true}
                type="text"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                style={{ padding: 10, marginRight: 10 }}
            />

            {!connected ? (
                <button onClick={start}>Connect</button>
            ) : (
                <button onClick={stop}>Disconnect</button>
            )}

            <h3>Notifications:</h3>

            {notifications.map((n, i) => (
                <div key={i} style={{ padding: 15, border: "1px solid #ccc", marginBottom: 10 }}>
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <small>{n.type}</small>
                </div>
            ))}
        </div>
    );
}

export default Notification;
