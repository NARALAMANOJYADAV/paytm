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

/**
 * Constructs a standard NPCI UPI payment deep-link URI
 */
export function getUpiPaymentUri(options: {
  upiId: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
}): string {
  const { upiId, payeeName, amount, transactionNote } = options;
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amount.toString(),
    cu: "INR",
    tn: transactionNote,
  });
  return `upi://pay?${params.toString()}`;
}

/**
 * Generates dynamic UPI QR Code for Paytm AI Workshop
 * Uses official Paytm Axis UPI ID: 9491803089@ptaxis
 * ₹50 for ISTE Members, ₹100 for Non-ISTE Participants
 */
export async function generateWorkshopUpiQr(isIsteMember: boolean): Promise<{
  dataUrl: string;
  upiUri: string;
  amount: number;
  upiId: string;
  payeeName: string;
}> {
  const upiId = "9491803089@ptaxis";
  const payeeName = "NBKRIST Paytm AI Workshop";
  const amount = isIsteMember ? 50 : 100;
  const transactionNote = isIsteMember 
    ? "P2P Workshop ISTE Fee" 
    : "P2P Workshop Non-ISTE Fee";

  const upiUri = getUpiPaymentUri({
    upiId,
    payeeName,
    amount,
    transactionNote,
  });

  const dataUrl = await generateQrDataUrl(upiUri);

  return {
    dataUrl,
    upiUri,
    amount,
    upiId,
    payeeName,
  };
}
