import * as React from "react";

type Props = {
  customerName: string;
  destinationName: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  flightIncluded: boolean;
  bookingId: string;
};

export default function BookingConfirmationEmail({
  customerName,
  destinationName,
  destinationCountry,
  startDate,
  endDate,
  guests,
  totalPrice,
  flightIncluded,
  bookingId,
}: Props) {
  const nights = Math.max(
    1,
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000
  );

  return (
    <html>
      <body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f5f7fa", margin: 0, padding: 0 }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#f5f7fa", padding: "40px 0" }}>
          <tr>
            <td align="center">
              <table width="600" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden" }}>
                
                {/* Header */}
                <tr>
                  <td style={{ backgroundColor: "#3f639e", padding: "30px 40px" }}>
                    <p style={{ color: "#ffffff", fontSize: "24px", fontWeight: "bold", margin: 0 }}>
                      ✈️ TravelAdmin
                    </p>
                    <p style={{ color: "#c7d7f0", fontSize: "14px", margin: "6px 0 0" }}>
                      Booking Confirmation
                    </p>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: "40px" }}>
                    <p style={{ fontSize: "16px", color: "#1f2937", marginTop: 0 }}>
                      Hi <strong>{customerName}</strong>,
                    </p>
                    <p style={{ fontSize: "14px", color: "#6b7280" }}>
                      Your booking has been confirmed! Here are your trip details:
                    </p>

                    {/* Booking info box */}
                    <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#f5f7fa", borderRadius: "12px", padding: "24px", marginTop: "24px" }}>
                      <tr>
                        <td>
                          <p style={{ fontSize: "18px", fontWeight: "bold", color: "#3f639e", margin: "0 0 16px" }}>
                            📍 {destinationName}, {destinationCountry}
                          </p>
                          <table width="100%" cellPadding={6} cellSpacing={0}>
                            <tr>
                              <td style={{ color: "#6b7280", fontSize: "13px", width: "40%" }}>Check-in</td>
                              <td style={{ color: "#1f2937", fontSize: "13px", fontWeight: "bold" }}>
                                {new Date(startDate).toLocaleDateString("sl-SI")}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ color: "#6b7280", fontSize: "13px" }}>Check-out</td>
                              <td style={{ color: "#1f2937", fontSize: "13px", fontWeight: "bold" }}>
                                {new Date(endDate).toLocaleDateString("sl-SI")}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ color: "#6b7280", fontSize: "13px" }}>Duration</td>
                              <td style={{ color: "#1f2937", fontSize: "13px", fontWeight: "bold" }}>
                                {nights} night{nights > 1 ? "s" : ""}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ color: "#6b7280", fontSize: "13px" }}>Guests</td>
                              <td style={{ color: "#1f2937", fontSize: "13px", fontWeight: "bold" }}>
                                {guests}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ color: "#6b7280", fontSize: "13px" }}>Flight</td>
                              <td style={{ color: "#1f2937", fontSize: "13px", fontWeight: "bold" }}>
                                {flightIncluded ? "✓ Included" : "Not included"}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    {/* Total */}
                    <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginTop: "24px" }}>
                      <tr>
                        <td style={{ backgroundColor: "#3f639e", borderRadius: "12px", padding: "20px 24px" }}>
                          <table width="100%">
                            <tr>
                              <td style={{ color: "#c7d7f0", fontSize: "13px" }}>Total Amount</td>
                              <td align="right" style={{ color: "#ffffff", fontSize: "22px", fontWeight: "bold" }}>
                                €{totalPrice?.toLocaleString()}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "16px" }}>
                      Booking ID: #{bookingId.slice(-8).toUpperCase()}
                    </p>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ backgroundColor: "#f9fafb", padding: "24px 40px", borderTop: "1px solid #e5e7eb" }}>
                    <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0, textAlign: "center" }}>
                      Questions? Contact us at support@traveladmin.com
                    </p>
                    <p style={{ fontSize: "12px", color: "#9ca3af", margin: "6px 0 0", textAlign: "center" }}>
                      © 2025 TravelAdmin. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}