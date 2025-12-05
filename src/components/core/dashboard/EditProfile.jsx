import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../../../slices/authSlice";

export default function EditProfile()
{
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token);
    const userData = useSelector((state) => state.auth.userData);

    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({
        userId: userData?.userId || "",
        userName: userData?.userName || "",
        email: userData?.email || "",
    });

    const handleChange = (e) =>
    {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () =>
    {
        try
        {
            const res = await fetch("https://localhost:7228/api/User", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            const text = await res.text();
            let data;

            try
            {
                data = JSON.parse(text); // backend returned JSON
            } catch
            {
                data = { message: text }; // backend returned plain text
            }

            alert(data.message || "Profile updated");

            // Update Redux
            dispatch(setUserData({ ...userData, ...form }));
            setIsOpen(false);

        } catch (err)
        {
            console.error("Update error", err);
        }
    };


    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">My Profile</h2>

            <div className="bg-white p-4 rounded-lg shadow">
                <p><strong>User ID:</strong> {userData?.userId}</p>
                <p><strong>Name:</strong> {userData?.userName}</p>
                <p><strong>Email:</strong> {userData?.email}</p>

                <button
                    onClick={() => setIsOpen(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Edit Profile
                </button>
            </div>

            {/* EDIT PROFILE MODAL */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                        <h3 className="text-xl mb-4 font-semibold">Edit Profile</h3>

                        <label className="block mb-2">Name</label>
                        <input
                            type="text"
                            name="userName"
                            value={form.userName}
                            onChange={handleChange}
                            className="w-full border p-2 rounded mb-3"
                        />

                        <label className="block mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full border p-2 rounded mb-3"
                        />

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                onClick={handleUpdate}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
