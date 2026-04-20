"use client";

import { useState } from "react";
import { Send, Mail, Users, CheckCircle, XCircle } from "lucide-react";
import { sendNewsletterEmail, saveSentEmail } from "@/app/actions/email";

type SentEmail = {
  _id: string;
  subject: string;
  sentAt: string;
  recipientCount: number;
  status: string;
};

export default function EmailsClient({
  sentEmails: initialSentEmails,
  customerCount,
}: {
  sentEmails: SentEmail[];
  customerCount: number;
}) {
  const [sentEmails, setSentEmails] = useState<SentEmail[]>(initialSentEmails);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: number;
    failed?: number;
    errors?: string[];
    error?: string;
  } | null>(null);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    setLoading(true);
    setResult(null);

    const res = await sendNewsletterEmail(subject, message);

    if ("error" in res) {
      setResult({ error: res.error });
    } else {
      setResult(res);
      const status = res.failed === 0 ? "sent" : "partial";
      await saveSentEmail(subject, res.success, status);

      // Posodobi seznam
      setSentEmails((prev) => [{
        _id: "temp-" + Date.now(),
        subject,
        sentAt: new Date().toISOString(),
        recipientCount: res.success,
        status,
      }, ...prev]);

      if (res.success > 0) {
        setSubject("");
        setMessage("");
      }
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">

      {/* Info kartica */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
        <Users size={20} className="text-blue-600" />
        <p className="text-sm text-blue-800">
          Your newsletter will be sent to <strong>{customerCount} customers</strong>.
        </p>
      </div>

      {/* Compose */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Mail size={18} /> Compose Newsletter
        </h2>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Summer Deals — 20% Off All Bookings!"
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your newsletter message here..."
            rows={8}
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Rezultat */}
        {result && (
          <div className={`rounded-xl p-4 flex items-center gap-3 ${
            result.error ? "bg-red-50 text-red-700" :
            result.failed === 0 ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
          }`}>
            {result.error
              ? <XCircle size={18} />
              : <CheckCircle size={18} />}
            <p className="text-sm font-medium">
              {result.error
                ? result.error
                : `Sent to ${result.success} customers${result.failed ? `, ${result.failed} failed` : ""}.`}
            </p>
          </div>
        )}

        {result?.errors && result.errors.length > 0 && (
          <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
            <p className="mb-2 text-sm font-medium text-yellow-800">
              Delivery errors
            </p>
            <ul className="space-y-1">
              {result.errors.slice(0, 5).map((error, index) => (
                <li key={index} className="text-xs text-yellow-700">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={loading || !subject.trim() || !message.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
        >
          <Send size={15} />
          {loading ? "Sending..." : `Send to ${customerCount} customers`}
        </button>
      </div>

      {/* Zgodovina */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Email History</h2>

        {sentEmails.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No emails sent yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wide">
                  <th className="pb-3 font-medium">Subject</th>
                  <th className="pb-3 font-medium">Recipients</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sentEmails.map((e) => (
                  <tr key={e._id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{e.subject}</td>
                    <td className="py-3 text-gray-600">{e.recipientCount} customers</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        e.status === "sent" ? "bg-green-100 text-green-700" :
                        e.status === "partial" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(e.sentAt).toLocaleDateString("sl-SI")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
