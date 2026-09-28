import QRCode from "qrcode";

/**
 * Generates high quality QR code data URL
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: "#030712", // deep black
        light: "#ffffff", // clean white
      },
      errorCorrectionLevel: "H",
    });
  } catch (err) {
    console.error("Error generating QR code:", err);
    // Fallback simple svg placeholder
    return "";
  }
}
