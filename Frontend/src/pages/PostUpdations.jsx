import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axiosClient from "../utils/axiosClient";
import AdminNavbar from '../components/AdminNavbar';
import UserNavbar from '../components/UserNavbar';
import { useSelector } from 'react-redux';
import Footer from "../components/Footer";

function PostUpdations() {
  const user = useSelector((state) => state.auth?.user);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        importance: "important"
    });
    const [message, setMessage] = useState("");
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosClient.post("/post/create", formData);
            console.log("Post Created:", response.data);
            setMessage("✅ Post created successfully!");
            setFormData({ title: "", description: "", importance: "important" });
        } catch (error) {
            console.error("Error creating post:", error.response?.data || error.message);
            setMessage("❌ Error creating post!");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

            {/* Background Elements */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>

                <div className="absolute inset-0 opacity-10">
                    <div className="w-full h-full" style={{
                        backgroundImage: `
                            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                        animation: 'grid-move 20s linear infinite',
                    }}></div>
                </div>

                <motion.div
                    className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
                    style={{
                        left: mousePosition.x - 192,
                        top: mousePosition.y - 192,
                    }}
                    transition={{ type: "spring", stiffness: 50, damping: 30 }}
                />
                
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Form */}
            <div className="relative z-10 flex items-center justify-center min-h-screen">
                <motion.form
                    onSubmit={handleSubmit}
                    className="bg-black/50 backdrop-blur-md p-8 rounded-lg border border-cyan-400/20 shadow-lg w-full max-w-lg flex flex-col gap-5"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent text-center">Create a Post</h2>

                    {message && <p className="text-center text-sm">{message}</p>}

                    <input
                        type="text"
                        name="title"
                        placeholder="Post Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="border border-cyan-400/30 bg-black/20 p-3 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition"
                    />

                    <textarea
                        name="description"
                        placeholder="Description (10 - 300 characters)"
                        value={formData.description}
                        onChange={handleChange}
                        minLength={10}
                        maxLength={300}
                        required
                        className="border border-cyan-400/30 bg-black/20 p-3 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition h-32"
                    />

                    <select
                        name="importance"
                        value={formData.importance}
                        onChange={handleChange}
                        className="border border-cyan-400/30 bg-black/20 p-3 rounded text-white focus:outline-none focus:border-cyan-400 transition"
                    >
                        <option value="important">Important</option>
                        <option value="not-important">Not Important</option>
                    </select>

                    <motion.button
                        type="submit"
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 p-3 rounded text-white font-semibold hover:scale-105 hover:shadow-xl transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Submit
                    </motion.button>
                </motion.form>
            </div>

            {/* Custom Keyframes */}
            <style jsx>{`
                @keyframes grid-move {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(50px, 50px); }
                }
            `}</style>
            <Footer/>
        </div>
    );
}

export default PostUpdations;
