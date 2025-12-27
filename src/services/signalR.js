import * as signalR from "@microsoft/signalr";

let connection = null;

// 🔥 Hardcoded JWT token here
// const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0cmluZyIsImVtYWlsIjoiaW5kdXJldmFpYmhhdjlAZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiTWFuYWdlciIsInVzZXJJZCI6IjEzIiwianRpIjoiMDMwMmQ3OTItN2FiYS00ODk4LWE3NDctY2Y4ZWQxMTYwZTg0IiwiZXhwIjoxNzY0NzQxNDA1LCJpc3MiOiJNeUF1dGhBcGkiLCJhdWQiOiJNeUF1dGhBcGlVc2VycyJ9.25xFIsiWNYKFKQbkfwzsfsRJ7TleZtPAvor5aKaCDoQeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0cmluZyIsImVtYWlsIjoiaW5kdXJldmFpYmhhdjlAZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiTWFuYWdlciIsInVzZXJJZCI6IjEzIiwianRpIjoiMDc5MDA3ZjAtYmYwZC00ZTYwLThkMzktYTc0YmJlOWJlNTYyIiwiZXhwIjoxNzY0NzQ1ODYwLCJpc3MiOiJNeUF1dGhBcGkiLCJhdWQiOiJNeUF1dGhBcGlVc2VycyJ9.06OofjYUl_TxaIEzMxmvyPwxXfuK7lDSxdZS5rvDC10";
// const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0cmluZyIsImVtYWlsIjoiaW5kdXJldmFpYmhhdjlAZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiTWFuYWdlciIsInVzZXJJZCI6IjEzIiwianRpIjoiMDc5MDA3ZjAtYmYwZC00ZTYwLThkMzktYTc0YmJlOWJlNTYyIiwiZXhwIjoxNzY0NzQ1ODYwLCJpc3MiOiJNeUF1dGhBcGkiLCJhdWQiOiJNeUF1dGhBcGlVc2VycyJ9.06OofjYUl_TxaIEzMxmvyPwxXfuK7lDSxdZS5rvDC10";

// const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0cmluZyIsImVtYWlsIjoiaW5kdXJldmFpYmhhdjlAZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiTWFuYWdlciIsInVzZXJJZCI6IjEzIiwianRpIjoiMmM0YmJkODAtZDAyZi00Y2I5LThkMDQtYjdmZDA2NjVhYWIxIiwiZXhwIjoxNzY0NzQ3MjcwLCJpc3MiOiJNeUF1dGhBcGkiLCJhdWQiOiJNeUF1dGhBcGlVc2VycyJ9.kIPZppk8n58EYhUbsvAuA3GpZmtmqkJm8dn2YdBiZKY"
// const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InZhaWJoYXYiLCJlbWFpbCI6InZhaWJoYXYuaW5kdXJlMjFAcGNjb2VwdW5lLm9yZyIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6Ik1hbmFnZXIiLCJ1c2VySWQiOiIxMyIsImp0aSI6ImNjZjhiOTNkLTkwYmItNDFiNC05YmRlLTQyZDMzN2YyZDRiNSIsImV4cCI6MTc2NTI5OTAzNCwiaXNzIjoiTXlBdXRoQXBpIiwiYXVkIjoiTXlBdXRoQXBpVXNlcnMifQ.hd_jtLvtrZZ9IqnbVfODI-Bo69UA4GofnfUDUndWqgU"
const TOKEN = localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null;
export async function connectToHub(userId, onNotification)
{
    connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7228/notifications", {
            accessTokenFactory: () => TOKEN   // 🔥 Attach JWT token
        })
        .withAutomaticReconnect()
        .build();

    // Receive notifications
    connection.on("ReceiveNotification", (message) =>
    {
        console.log("Notification received:", message);
        onNotification(message);
    });

    // Start connection
    await connection.start();
    console.log("Connected:", connection.connectionId);

    // Register the user on backend hub
    await connection.invoke("RegisterUser", userId);
    console.log("User registered to group:", userId);
}

export function disconnectFromHub(userId)
{
    if (!connection) return;

    // Optional unregister
    connection.invoke("UnregisterUser", userId);

    // Close connection
    connection.stop();
}
