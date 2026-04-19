"use client";

import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Booking = {
  _id: string;
  customerName: string;
  customerEmail: string;
  destinationName: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  guests: number;
  flightIncluded: boolean;
  totalPrice: number;
  status: string;
  createdAt: string;
};

export default function InvoiceButton({ booking }: { booking: Booking }) {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(63, 99, 158);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("TravelAdmin", 14, 18);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Travel Booking Invoice", 14, 27);

    // Invoice number + datum
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`Invoice #${booking._id.slice(-8).toUpperCase()}`, 196, 18, { align: "right" });
    doc.text(`Date: ${new Date(booking.createdAt).toLocaleDateString("sl-SI")}`, 196, 27, { align: "right" });

    // Reset barve
    doc.setTextColor(40, 40, 40);

    // Customer info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(booking.customerName || "—", 14, 58);
    doc.text(booking.customerEmail || "—", 14, 64);

    // Status badge
    const statusColors: Record<string, [number, number, number]> = {
      confirmed: [34, 197, 94],
      pending: [234, 179, 8],
      cancelled: [239, 68, 68],
      completed: [59, 130, 246],
    };
    const [r, g, b] = statusColors[booking.status] || [150, 150, 150];
    doc.setFillColor(r, g, b);
    doc.roundedRect(150, 45, 46, 10, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(booking.status.toUpperCase(), 173, 51.5, { align: "center" });
    doc.setTextColor(40, 40, 40);

    // Booking details tabela
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Booking Details", 14, 80);

    const nights = Math.max(
      1,
      (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / 86400000
    );

    autoTable(doc, {
      startY: 85,
      head: [["Description", "Details"]],
      body: [
        ["Destination", `${booking.destinationName}, ${booking.destinationCountry}`],
        ["Check-in", new Date(booking.startDate).toLocaleDateString("sl-SI")],
        ["Check-out", new Date(booking.endDate).toLocaleDateString("sl-SI")],
        ["Duration", `${nights} night${nights > 1 ? "s" : ""}`],
        ["Guests", String(booking.guests || 1)],
        ["Flight Included", booking.flightIncluded ? "Yes" : "No"],
      ],
      headStyles: {
        fillColor: [63, 99, 158],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { cellWidth: 120 },
      },
    });

    // Cena
    const finalY =
      (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;

    doc.setFillColor(245, 247, 250);
    doc.roundedRect(120, finalY, 76, 20, 3, 3, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Total Amount:", 125, finalY + 8);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(63, 99, 158);
    doc.text(`€${booking.totalPrice?.toLocaleString() || "0"}`, 191, finalY + 15, { align: "right" });

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for booking with TravelAdmin.", 105, 280, { align: "center" });
    doc.text("For support contact: support@traveladmin.com", 105, 285, { align: "center" });

    // Shrani
    doc.save(`invoice-${booking._id.slice(-8).toUpperCase()}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition"
      title="Download Invoice"
    >
      <FileText size={15} />
    </button>
  );
}
