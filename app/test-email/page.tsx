"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function TestEmailPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        to: "",
        subject: "",
        message: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to: formData.to,
                    subject: formData.subject,
                    text: formData.message,
                    html: `<p>${formData.message.replace(/\n/g, "<br>")}</p>`,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to send email");
            }

            toast.success("Email sent successfully!");
            setFormData({ to: "", subject: "", message: "" });
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
            <Toaster position="bottom-right" />
            <div className="w-full max-w-md bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-700">
                <div className="bg-blue-600 p-6 flex items-center gap-3">
                    <Mail className="w-6 h-6 text-white" />
                    <h1 className="text-xl font-bold">Email Tester</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">
                            Recipient Email
                        </label>
                        <input
                            type="email"
                            name="to"
                            value={formData.to}
                            onChange={handleChange}
                            placeholder="recipient@example.com"
                            required
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-neutral-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">
                            Subject
                        </label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Hello from Plutus"
                            required
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-neutral-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">
                            Message
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Type your message here..."
                            required
                            rows={4}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none placeholder:text-neutral-600"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Send Email
                            </>
                        )}
                    </button>
                </form>

                <div className="bg-neutral-900 p-4 border-t border-neutral-700">
                    <p className="text-xs text-neutral-500 font-mono">
                        API Endpoint: /api/send-email
                    </p>
                </div>
            </div>
        </div>
    );
}
