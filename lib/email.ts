import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface BookingEmailData {
  reference: string;
  vehicle: string;
  pickupDate: string;
  returnDate: string;
  days: number;
  totalPrice: number;
  pickupLocation: string;
  pickupAddress?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality?: string;
  paymentMethod: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatPayment(method: string) {
  return method === 'cash_on_delivery' ? 'Cash on Delivery' : method === 'gcash' ? 'GCash' : 'Maya / Visa Card';
}

function formatDelivery(type: string, address?: string) {
  if (type === 'hotel') return `Hotel delivery${address ? ` — ${address}` : ''}`;
  if (type === 'airport') return `Airport pickup${address ? ` — ${address}` : ''}`;
  return 'Store pickup (Lapu-Lapu City)';
}

export async function sendBookingNotification(data: BookingEmailData) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('Email not configured — skipping notification');
    return;
  }

  const deliveryLabel = formatDelivery(data.pickupLocation, data.pickupAddress);
  const paymentLabel = formatPayment(data.paymentMethod);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#171717;padding:28px 32px;display:flex;align-items:center;gap:12px;">
      <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#f97316,#431407);display:inline-flex;align-items:center;justify-content:center;">
        <span style="color:#fff;font-weight:800;font-size:16px;">K</span>
      </div>
      <span style="color:#ffffff;font-weight:800;font-size:20px;letter-spacing:-0.5px;">KJM Rental</span>
      <span style="margin-left:auto;background:#22c55e;color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:99px;">NEW BOOKING</span>
    </div>

    <!-- Reference banner -->
    <div style="background:#fff7ed;border-bottom:1px solid #fed7aa;padding:20px 32px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#ea580c;text-transform:uppercase;letter-spacing:1px;">Booking Reference</p>
      <p style="margin:0;font-size:28px;font-weight:800;color:#c2410c;letter-spacing:-1px;">${data.reference}</p>
    </div>

    <!-- Content -->
    <div style="padding:28px 32px;">

      <!-- Vehicle + Dates -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;vertical-align:top;">
            <span style="font-size:12px;font-weight:600;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.5px;">Vehicle</span><br/>
            <span style="font-size:16px;font-weight:700;color:#171717;">${data.vehicle}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;vertical-align:top;text-align:right;">
            <span style="font-size:12px;font-weight:600;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.5px;">Duration</span><br/>
            <span style="font-size:16px;font-weight:700;color:#171717;">${data.days} day${data.days !== 1 ? 's' : ''}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;vertical-align:top;">
            <span style="font-size:12px;font-weight:600;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.5px;">Pickup</span><br/>
            <span style="font-size:14px;font-weight:600;color:#171717;">${formatDate(data.pickupDate)}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;vertical-align:top;text-align:right;">
            <span style="font-size:12px;font-weight:600;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.5px;">Return</span><br/>
            <span style="font-size:14px;font-weight:600;color:#171717;">${formatDate(data.returnDate)}</span>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:10px 0;border-bottom:1px solid #f5f5f4;">
            <span style="font-size:12px;font-weight:600;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.5px;">Delivery</span><br/>
            <span style="font-size:14px;font-weight:600;color:#171717;">${deliveryLabel}</span>
          </td>
        </tr>
      </table>

      <!-- Customer -->
      <h3 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.5px;">Customer</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#fafafa;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:12px;color:#737373;">Name</span><br/>
            <span style="font-size:15px;font-weight:700;color:#171717;">${data.firstName} ${data.lastName}</span>
          </td>
          <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:12px;color:#737373;">Nationality</span><br/>
            <span style="font-size:15px;font-weight:600;color:#171717;">${data.nationality || '—'}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:12px;color:#737373;">Phone / WhatsApp</span><br/>
            <a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}" style="font-size:15px;font-weight:700;color:#16a34a;text-decoration:none;">${data.phone}</a>
          </td>
          <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:12px;color:#737373;">Email</span><br/>
            <a href="mailto:${data.email}" style="font-size:14px;font-weight:600;color:#2563eb;text-decoration:none;">${data.email}</a>
          </td>
        </tr>
      </table>

      <!-- Payment + Total -->
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#ea580c;text-transform:uppercase;">Payment method</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#171717;">${paymentLabel}</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0 0 2px;font-size:12px;font-weight:600;color:#ea580c;text-transform:uppercase;">Total to collect</p>
          <p style="margin:0;font-size:24px;font-weight:800;color:#c2410c;">₱${data.totalPrice.toLocaleString('en-US')}</p>
          <p style="margin:2px 0 0;font-size:11px;color:#a3a3a3;">+ ₱2,500 refundable deposit</p>
        </div>
      </div>

      <!-- WhatsApp CTA -->
      <div style="text-align:center;">
        <a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}?text=Hi ${encodeURIComponent(data.firstName)}! This is KJM Rental confirming your booking ${data.reference} for the ${encodeURIComponent(data.vehicle)}. We'll be in touch shortly!"
           style="display:inline-block;background:#22c55e;color:#ffffff;font-weight:700;font-size:14px;padding:14px 28px;border-radius:12px;text-decoration:none;">
          💬 WhatsApp ${data.firstName}
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#fafafa;border-top:1px solid #f0f0f0;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#a3a3a3;">KJM Rental · Lapu-Lapu City, Cebu · +63 975 298 4845</p>
    </div>

  </div>

</body>
</html>
  `;

  await transporter.sendMail({
    from: `"KJM Rental" <${process.env.GMAIL_USER}>`,
    to: 'kristinemaranga@gmail.com',
    subject: `🛵 New Booking ${data.reference} — ${data.firstName} ${data.lastName} · ${data.vehicle}`,
    html,
  });
}
