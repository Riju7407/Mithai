'use client';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { formatPrice, formatDate, formatDateTime } from './utils';

// Helper to convert number to words for Indian Rupees
function numberToWords(num: number): string {
  if (!num || isNaN(num)) return 'Zero Rupees Only';
  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const inWords = (n: number): string => {
    let str = '';
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) str += a[n];
      else {
        str += b[Math.floor(n / 10)];
        if (n % 10 > 0) str += ' ' + a[n % 10];
      }
    }
    return str.trim();
  };

  const whole = Math.floor(num);
  return `${inWords(whole)} Rupees Only`;
}

// SVG Logo & Crest Generator
function getRoyalLogoSVG(): string {
  return `
    <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldCrest" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FBF5E6" />
          <stop offset="25%" stop-color="#E7BD65" />
          <stop offset="60%" stop-color="#B87F22" />
          <stop offset="100%" stop-color="#754917" />
        </linearGradient>
        <radialGradient id="royalBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1F4F44" />
          <stop offset="100%" stop-color="#0F2C26" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#royalBg)" stroke="url(#goldCrest)" stroke-width="3"/>
      <circle cx="50" cy="50" r="42" fill="none" stroke="#E7BD65" stroke-width="1" stroke-dasharray="2 2"/>
      <!-- Royal Crown / Sweet motif -->
      <path d="M26 62 L32 38 L50 50 L68 38 L74 62 Z" fill="url(#goldCrest)"/>
      <circle cx="32" cy="36" r="3.5" fill="#FFF8E7"/>
      <circle cx="50" cy="32" r="4.5" fill="#FFF8E7"/>
      <circle cx="68" cy="36" r="3.5" fill="#FFF8E7"/>
      <!-- Sparkle in center -->
      <path d="M50 48 L52 54 L58 56 L52 58 L50 64 L48 58 L42 56 L48 54 Z" fill="#FFF"/>
      <!-- Lower Banner Arc -->
      <path d="M30 68 Q50 76 70 68" stroke="url(#goldCrest)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </svg>
  `;
}

// Royal Seal Stamp SVG
function getRoyalSealSVG(): string {
  return `
    <svg width="90" height="90" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <path id="sealTextPath" d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
      </defs>
      <circle cx="50" cy="50" r="46" fill="#FDFBF5" stroke="#B87F22" stroke-width="2.5" stroke-dasharray="3 2" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="#D49D34" stroke-width="1.2" />
      <text font-size="6.8" font-family="'Outfit', sans-serif" font-weight="700" fill="#754917" letter-spacing="1.8">
        <textPath href="#sealTextPath" startOffset="50%" text-anchor="middle">
          ★ SHREE MITHAI ★ 100% PURE DESI GHEE ★
        </textPath>
      </text>
      <circle cx="50" cy="50" r="24" fill="#0F2C26" />
      <!-- Inner star & text -->
      <text x="50" y="47" font-size="8" font-weight="bold" fill="#F0D69A" text-anchor="middle" font-family="'Playfair Display', serif">ROYAL</text>
      <text x="50" y="56" font-size="6" font-weight="bold" fill="#FFF" text-anchor="middle" font-family="'Outfit', sans-serif">CERTIFIED</text>
    </svg>
  `;
}

// Small watermark of website name repeated diagonally
function getWatermarkCSS(): string {
  // SVG background with rotated website name repeated
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='120'>
    <text x='110' y='60' fill='rgba(184, 127, 34, 0.08)' font-size='10' font-family='sans-serif' font-weight='700' letter-spacing='2' text-anchor='middle' transform='rotate(-24, 110, 60)'>
      SHREE MITHAI • WWW.SHREEMITHAI.COM
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generate and download a colorful, premium PDF invoice for an Instant Order.
 */
export async function generateOrderInvoicePDF(order: any, autoDownload = true): Promise<void> {
  if (typeof window === 'undefined' || !order) return;

  const isCOD = order.paymentMethod === 'COD';
  const isPaid = order.paymentStatus === 'Paid';
  const items = order.items || [];
  const totalInWords = numberToWords(order.grandTotal);
  const invoiceNumber = `INV-${order.orderNumber || order._id?.slice(-8).toUpperCase()}`;

  // Container to hold the invoice off-screen
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.zIndex = '-9999';
  container.style.fontFamily = "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.color = '#1c1917';
  container.style.backgroundColor = '#ffffff';

  const watermarkUrl = getWatermarkCSS();

  container.innerHTML = `
    <div style="position: relative; background: #ffffff; padding: 36px 40px; box-sizing: border-box; overflow: hidden; border: 8px solid #FAF5E8;">
      
      <!-- Small Watermark Background Overlay -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('${watermarkUrl}'); background-repeat: repeat; pointer-events: none; opacity: 0.95; z-index: 0;"></div>

      <!-- Content wrapper -->
      <div style="position: relative; z-index: 1;">
        
        <!-- TOP ROYAL HEADER BANNER -->
        <div style="background: linear-gradient(135deg, #0F2C26 0%, #173D35 60%, #38200A 100%); border-radius: 16px; padding: 22px 26px; color: #ffffff; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 14px rgba(15, 44, 38, 0.25); border-bottom: 4px solid #D49D34;">
          
          <!-- Logo & Brand Identity -->
          <div style="display: flex; align-items: center; gap: 18px;">
            <div>${getRoyalLogoSVG()}</div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #FFF8E7;">Shree Mithai</span>
                <span style="background: linear-gradient(90deg, #D49D34, #F0D69A); color: #0F2C26; font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px;">Royal Confectionery</span>
              </div>
              <div style="font-size: 11px; color: #D49D34; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px;">
                Artisanal Delicacies & Luxury Celebrations
              </div>
              <div style="font-size: 10px; color: #C4DAD4; margin-top: 4px;">
                FSSAI Lic: 11522000000123 &bull; GSTIN: 29AAECS1234K1Z5
              </div>
            </div>
          </div>

          <!-- Invoice Title & Document Badge -->
          <div style="text-align: right;">
            <div style="background: rgba(212, 157, 52, 0.2); border: 1px solid #E7BD65; border-radius: 8px; padding: 6px 14px; display: inline-block;">
              <span style="font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #F6E8C5; display: block;">
                Tax Invoice & Receipt
              </span>
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #ffffff; margin-top: 6px; font-family: monospace;">
              # ${invoiceNumber}
            </div>
            <div style="font-size: 11px; color: #E7BD65; margin-top: 2px;">
              Date: ${formatDateTime(order.createdAt || new Date())}
            </div>
          </div>
        </div>

        <!-- STATUS BAR & PAYMENT BADGES -->
        <div style="margin-top: 18px; display: flex; justify-content: space-between; align-items: center; background: #FAF8F5; border: 1px solid #ECE6D9; border-radius: 12px; padding: 10px 18px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 11px; font-weight: 700; color: #5A3614; text-transform: uppercase; letter-spacing: 1px;">Order Status:</span>
            <span style="background: #E8F5E9; color: #1B5E20; border: 1px solid #A5D6A7; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase;">
              ${order.orderStatus || 'Confirmed'}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 11px; font-weight: 700; color: #5A3614; text-transform: uppercase; letter-spacing: 1px;">Payment:</span>
            ${
              isPaid
                ? `<span style="background: linear-gradient(135deg, #10B981, #059669); color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);">
                    ✓ PAID ONLINE
                   </span>`
                : isCOD
                ? `<span style="background: linear-gradient(135deg, #F59E0B, #D97706); color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);">
                    ⚡ CASH HOME DELIVERY (COD)
                   </span>`
                : `<span style="background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 9999px;">
                    ${order.paymentStatus || 'Pending'}
                   </span>`
            }
          </div>
        </div>

        <!-- 2-COLUMN INFO BLOCKS (CUSTOMER & ORDER PARTICULARS) -->
        <div style="margin-top: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
          
          <!-- Billed / Delivered To -->
          <div style="background: #FDFBF7; border: 1px solid #F0E6D2; border-left: 4px solid #B87F22; border-radius: 12px; padding: 14px 18px;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #B87F22; letter-spacing: 1.5px; margin-bottom: 6px;">
              Billed To & Delivery Destination
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #1c1917;">
              ${order.shippingAddress?.recipientName || order.customerName || 'Valued Patron'}
            </div>
            <div style="font-size: 11px; color: #44403c; margin-top: 4px; line-height: 1.5;">
              <div><strong>Phone:</strong> ${order.shippingAddress?.phone || order.customerPhone || 'N/A'}</div>
              <div><strong>Email:</strong> ${order.customerEmail || 'N/A'}</div>
              <div style="margin-top: 4px;">
                ${order.shippingAddress?.houseOrFlat || ''} ${order.shippingAddress?.street || ''}
              </div>
              ${order.shippingAddress?.landmark ? `<div>Landmark: ${order.shippingAddress.landmark}</div>` : ''}
              <div>${order.shippingAddress?.city || ''} ${order.shippingAddress?.pincode ? `- ${order.shippingAddress.pincode}` : ''}</div>
            </div>
          </div>

          <!-- Delivery Slot & Payment Details -->
          <div style="background: #F0F7F5; border: 1px solid #B8DBD2; border-left: 4px solid #2C695B; border-radius: 12px; padding: 14px 18px;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #2C695B; letter-spacing: 1.5px; margin-bottom: 6px;">
              Delivery & Payment Logistics
            </div>
            <div style="font-size: 11px; color: #173D35; line-height: 1.6;">
              <div><strong>Scheduled Slot:</strong> <span style="color: #94601A; font-weight: 700;">${order.deliverySlot || 'Standard Delivery'}</span></div>
              <div><strong>Delivery Date:</strong> ${order.deliveryDate ? formatDate(order.deliveryDate) : 'Same Day Dispatch'}</div>
              <div><strong>Fulfillment Mode:</strong> ${order.deliveryMethod || 'Home Delivery'}</div>
              <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #B8DBD2;">
                <strong>Payment Mode:</strong> ${isCOD ? 'Cash on Delivery (To be paid at doorstep)' : 'Online Payment (Razorpay Gateway)'}
              </div>
              ${
                order.razorpayPaymentId
                  ? `<div style="font-family: monospace; font-size: 10px; color: #0F2C26;"><strong>Payment ID:</strong> ${order.razorpayPaymentId}</div>`
                  : ''
              }
            </div>
          </div>
        </div>

        <!-- ITEMS ORDERED TABLE -->
        <div style="margin-top: 22px;">
          <table style="width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden;">
            <thead>
              <tr style="background: linear-gradient(135deg, #173D35 0%, #1F4F44 100%); color: #ffffff; text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: 1px;">
                <th style="padding: 10px 14px; width: 40px; text-align: center;">#</th>
                <th style="padding: 10px 14px;">Delicacy Description</th>
                <th style="padding: 10px 14px; width: 90px; text-align: right;">Unit Price</th>
                <th style="padding: 10px 14px; width: 60px; text-align: center;">Qty</th>
                <th style="padding: 10px 14px; width: 100px; text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item: any, idx: number) => `
                <tr style="background: ${idx % 2 === 0 ? '#FFFFFF' : '#FAF8F5'}; border-bottom: 1px solid #ECE6D9; font-size: 11.5px;">
                  <td style="padding: 10px 14px; text-align: center; color: #78716c; font-weight: 700;">${idx + 1}</td>
                  <td style="padding: 10px 14px;">
                    <div style="font-weight: 700; color: #1c1917;">${item.productName || 'Royal Sweet'}</div>
                    ${
                      item.variantName
                        ? `<div style="font-size: 10px; color: #B87F22; font-weight: 600;">Box Size: ${item.variantName}</div>`
                        : ''
                    }
                  </td>
                  <td style="padding: 10px 14px; text-align: right; color: #44403c; font-family: monospace;">
                    ${formatPrice(item.unitPrice || 0)}
                  </td>
                  <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #1c1917;">
                    ${item.quantity || 1}
                  </td>
                  <td style="padding: 10px 14px; text-align: right; font-weight: 800; color: #0F2C26; font-family: monospace;">
                    ${formatPrice(item.subtotal || item.unitPrice * (item.quantity || 1))}
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <!-- FINANCIAL SUMMARY & SEAL BLOCK -->
        <div style="margin-top: 18px; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; align-items: start;">
          
          <!-- Left: Amount in words & Pure Ghee Seal -->
          <div style="display: flex; gap: 14px; align-items: center; background: #FAF8F5; border: 1px solid #E7BD65; border-radius: 12px; padding: 14px 18px;">
            <div style="shrink-0;">${getRoyalSealSVG()}</div>
            <div style="font-size: 11px; line-height: 1.45;">
              <div style="font-weight: 800; color: #754917; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Amount in Words:</div>
              <div style="font-style: italic; color: #1c1917; font-weight: 600; margin-top: 2px;">
                "${totalInWords}"
              </div>
              <div style="font-size: 10px; color: #78716c; margin-top: 6px;">
                Crafted using 100% Pure Desi Ghee & Artisanal Standards. Guaranteed hygienic packaging.
              </div>
            </div>
          </div>

          <!-- Right: Totals Calculation Card -->
          <div style="background: #FFFFFF; border: 2px solid #D49D34; border-radius: 12px; padding: 14px 18px; box-shadow: 0 2px 8px rgba(212, 157, 52, 0.1);">
            <div style="font-size: 11px; color: #57534e; display: flex; justify-content: space-between; padding-bottom: 6px;">
              <span>Delicacies Subtotal:</span>
              <span style="font-family: monospace; font-weight: 600; color: #1c1917;">${formatPrice(order.subtotal || 0)}</span>
            </div>

            ${
              order.discount && order.discount > 0
                ? `<div style="font-size: 11px; color: #059669; display: flex; justify-content: space-between; padding-bottom: 6px; font-weight: 600;">
                    <span>Promotional Discount (${order.couponCode || 'PROMO'}):</span>
                    <span style="font-family: monospace;">-${formatPrice(order.discount)}</span>
                  </div>`
                : ''
            }

            <div style="font-size: 11px; color: #57534e; display: flex; justify-content: space-between; padding-bottom: 6px;">
              <span>Delivery & Shipping:</span>
              <span style="font-family: monospace; font-weight: 600; color: ${order.deliveryFee === 0 ? '#059669' : '#1c1917'};">
                ${order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee || 0)}
              </span>
            </div>

            <div style="font-size: 11px; color: #57534e; display: flex; justify-content: space-between; padding-bottom: 6px;">
              <span>Applicable GST (5% Included):</span>
              <span style="font-family: monospace; font-weight: 600; color: #1c1917;">${formatPrice(order.tax || 0)}</span>
            </div>

            <div style="border-top: 2px dashed #E7BD65; margin-top: 6px; padding-top: 8px; display: flex; justify-content: space-between; align-items: baseline;">
              <div>
                <span style="font-size: 13px; font-weight: 800; color: #0F2C26; text-transform: uppercase; letter-spacing: 0.5px;">Grand Total</span>
                <span style="display: block; font-size: 9px; color: #78716c;">(Inclusive of all taxes)</span>
              </div>
              <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 900; color: #754917;">
                ${formatPrice(order.grandTotal || 0)}
              </span>
            </div>
          </div>
        </div>

        <!-- FOOTER & LEGAL DISCLAIMER -->
        <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #ECE6D9; display: flex; justify-content: space-between; align-items: flex-end; font-size: 10px; color: #78716c;">
          <div style="line-height: 1.5; max-width: 480px;">
            <p style="margin: 0; font-weight: 600; color: #44403c;">
              Thank you for choosing Shree Mithai to sweeten your celebrations!
            </p>
            <p style="margin: 2px 0 0 0;">
              This is a digitally generated Tax Invoice and does not require physical signature.
              For customer support or corporate bulk bookings, contact <strong>care@shreemithai.com</strong> or call <strong>+91 98765 43210</strong>.
            </p>
            <p style="margin: 2px 0 0 0; color: #B87F22; font-weight: 700;">
              Official Boutique: www.shreemithai.com &bull; Bengaluru &bull; Mumbai &bull; Chennai
            </p>
          </div>

          <div style="text-align: right;">
            <div style="font-family: 'Playfair Display', serif; font-size: 12px; font-weight: 700; color: #0F2C26; letter-spacing: 0.5px;">
              Shree Mithai & Confectionery
            </div>
            <div style="font-size: 9px; color: #A8A29E; margin-top: 1px;">Authorized Signatory Stamp</div>
          </div>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // High resolution retina capture
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const computedHeight = (canvas.height * pdfWidth) / canvas.width;

    // If height fits in 1 page, render cleanly. Otherwise fit with slight margin
    if (computedHeight <= pdfPageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, computedHeight);
    } else {
      // Split or fit to page if within 10%
      if (computedHeight < pdfPageHeight * 1.1) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfPageHeight);
      } else {
        let heightLeft = computedHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, computedHeight);
        heightLeft -= pdfPageHeight;

        while (heightLeft > 0) {
          position = heightLeft - computedHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, computedHeight);
          heightLeft -= pdfPageHeight;
        }
      }
    }

    if (autoDownload) {
      pdf.save(`Shree_Mithai_Invoice_${order.orderNumber || 'receipt'}.pdf`);
    }
  } catch (error) {
    console.error('Failed to generate order PDF invoice:', error);
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Generate and download a colorful, premium PDF invoice for an Advance Event Booking.
 * Contains all booking details (Event Name, Type, Guests, Venue, Box style, Custom tag, Deposit, Balance).
 */
export async function generateBookingInvoicePDF(booking: any, autoDownload = true): Promise<void> {
  if (typeof window === 'undefined' || !booking) return;

  const isPaid = booking.paymentStatus === 'Paid';
  const items = booking.items || [];
  const totalInWords = numberToWords(booking.totalAmount || 0);
  const bookingNumber = booking.bookingNumber || booking._id?.slice(-8).toUpperCase();
  const invoiceNumber = `EVT-INV-${bookingNumber}`;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.zIndex = '-9999';
  container.style.fontFamily = "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.color = '#1c1917';
  container.style.backgroundColor = '#ffffff';

  const watermarkUrl = getWatermarkCSS();

  container.innerHTML = `
    <div style="position: relative; background: #ffffff; padding: 36px 40px; box-sizing: border-box; overflow: hidden; border: 8px solid #FAF5E8;">
      
      <!-- Watermark Background Overlay -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('${watermarkUrl}'); background-repeat: repeat; pointer-events: none; opacity: 0.95; z-index: 0;"></div>

      <!-- Content wrapper -->
      <div style="position: relative; z-index: 1;">
        
        <!-- TOP ROYAL HEADER BANNER -->
        <div style="background: linear-gradient(135deg, #2D1436 0%, #173D35 60%, #38200A 100%); border-radius: 16px; padding: 22px 26px; color: #ffffff; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 14px rgba(45, 20, 54, 0.25); border-bottom: 4px solid #D49D34;">
          
          <!-- Logo & Brand Identity -->
          <div style="display: flex; align-items: center; gap: 18px;">
            <div>${getRoyalLogoSVG()}</div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #FFF8E7;">Shree Mithai</span>
                <span style="background: linear-gradient(90deg, #D49D34, #F0D69A); color: #0F2C26; font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px;">Event Catering</span>
              </div>
              <div style="font-size: 11px; color: #D49D34; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px;">
                Grand Celebrations & Bespoke Wedding Hampers
              </div>
              <div style="font-size: 10px; color: #C4DAD4; margin-top: 4px;">
                FSSAI Lic: 11522000000123 &bull; GSTIN: 29AAECS1234K1Z5
              </div>
            </div>
          </div>

          <!-- Document Title & Badges -->
          <div style="text-align: right;">
            <div style="background: rgba(212, 157, 52, 0.25); border: 1px solid #E7BD65; border-radius: 8px; padding: 6px 14px; display: inline-block;">
              <span style="font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #F6E8C5; display: block;">
                Event Booking Bill
              </span>
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #ffffff; margin-top: 6px; font-family: monospace;">
              # ${invoiceNumber}
            </div>
            <div style="font-size: 11px; color: #E7BD65; margin-top: 2px;">
              Issued: ${formatDateTime(booking.createdAt || new Date())}
            </div>
          </div>
        </div>

        <!-- EVENT HIGHLIGHTS & STATUS BAR -->
        <div style="margin-top: 18px; display: flex; justify-content: space-between; align-items: center; background: #FAF5F0; border: 1px solid #EFE4D6; border-radius: 12px; padding: 10px 18px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 11px; font-weight: 700; color: #5A3614; text-transform: uppercase; letter-spacing: 1px;">Booking Status:</span>
            <span style="background: #E0F2FE; color: #0369A1; border: 1px solid #BAE6FD; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase;">
              ${booking.bookingStatus || 'Confirmed'}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 11px; font-weight: 700; color: #5A3614; text-transform: uppercase; letter-spacing: 1px;">Payment Status:</span>
            ${
              isPaid
                ? `<span style="background: linear-gradient(135deg, #10B981, #059669); color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px;">
                    ✓ 100% FULLY PAID
                   </span>`
                : `<span style="background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px;">
                    ★ ADVANCE DEPOSIT CONFIRMED
                   </span>`
            }
          </div>
        </div>

        <!-- 3-SECTION BOOKING PARTICULARS (CUSTOMER, EVENT DETAILS, PACKAGING & VENUE) -->
        <div style="margin-top: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
          
          <!-- Customer & Contact -->
          <div style="background: #FDFBF7; border: 1px solid #F0E6D2; border-left: 4px solid #B87F22; border-radius: 12px; padding: 14px 18px;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #B87F22; letter-spacing: 1.5px; margin-bottom: 6px;">
              Host & Contact Particulars
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #1c1917;">
              ${booking.customerName || 'Honored Host'}
            </div>
            <div style="font-size: 11px; color: #44403c; margin-top: 4px; line-height: 1.5;">
              <div><strong>Contact Number:</strong> ${booking.contactNumber || 'N/A'}</div>
              <div><strong>Email Address:</strong> ${booking.customerEmail || 'N/A'}</div>
              <div><strong>Booking Reference:</strong> <span style="font-family: monospace; font-weight: 700;">${booking.bookingNumber}</span></div>
            </div>
          </div>

          <!-- Celebration & Venue Logistics -->
          <div style="background: #F5F3FF; border: 1px solid #DDD6FE; border-left: 4px solid #7C3AED; border-radius: 12px; padding: 14px 18px;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #7C3AED; letter-spacing: 1.5px; margin-bottom: 6px;">
              Celebration & Venue Particulars
            </div>
            <div style="font-size: 11px; color: #3B0764; line-height: 1.6;">
              <div><strong>Occasion / Event:</strong> <span style="font-weight: 700; color: #5B21B6;">${booking.eventName}</span> (${booking.eventType})</div>
              <div><strong>Expected Guests:</strong> <span style="font-weight: 700;">${booking.numberOfGuests || 0} Guests</span></div>
              <div><strong>Delivery / Event Date:</strong> <span style="color: #94601A; font-weight: 700;">${booking.deliveryDate ? formatDate(booking.deliveryDate) : 'Scheduled Date'}</span></div>
              <div><strong>Dispatch Slot:</strong> ${booking.deliverySlot || 'Morning 9 AM - 12 PM'}</div>
              <div style="margin-top: 4px; font-size: 10.5px;">
                <strong>Venue:</strong> ${booking.deliveryAddress?.houseOrFlat || ''} ${booking.deliveryAddress?.street || ''}, ${booking.deliveryAddress?.city || ''}
              </div>
            </div>
          </div>
        </div>

        <!-- PACKAGING & CUSTOM MESSAGE BANNER -->
        ${
          booking.packaging?.optionName || booking.customMessage
            ? `
          <div style="margin-top: 14px; background: #FFFBEB; border: 1px dashed #F59E0B; border-radius: 10px; padding: 10px 16px; display: flex; justify-content: space-between; font-size: 11px; color: #92400E;">
            ${
              booking.packaging?.optionName
                ? `<div><strong>Box Presentation Style:</strong> ${booking.packaging.optionName}</div>`
                : ''
            }
            ${
              booking.customMessage
                ? `<div style="font-style: italic;"><strong>Personalized Greeting:</strong> "${booking.customMessage}"</div>`
                : ''
            }
          </div>
        `
            : ''
        }

        <!-- ITEMS RESERVED TABLE -->
        <div style="margin-top: 18px;">
          <table style="width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden;">
            <thead>
              <tr style="background: linear-gradient(135deg, #2D1436 0%, #173D35 100%); color: #ffffff; text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: 1px;">
                <th style="padding: 10px 14px; width: 40px; text-align: center;">#</th>
                <th style="padding: 10px 14px;">Artisanal Sweet / Delicacy</th>
                <th style="padding: 10px 14px; width: 100px; text-align: center;">Quantity / Unit</th>
                <th style="padding: 10px 14px; width: 90px; text-align: right;">Unit Price</th>
                <th style="padding: 10px 14px; width: 100px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item: any, idx: number) => `
                <tr style="background: ${idx % 2 === 0 ? '#FFFFFF' : '#FAF8F5'}; border-bottom: 1px solid #ECE6D9; font-size: 11.5px;">
                  <td style="padding: 10px 14px; text-align: center; color: #78716c; font-weight: 700;">${idx + 1}</td>
                  <td style="padding: 10px 14px; font-weight: 700; color: #1c1917;">
                    ${item.productName || 'Artisanal Selection'}
                  </td>
                  <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #173D35;">
                    ${item.quantity} ${item.unit || 'Kg'}
                  </td>
                  <td style="padding: 10px 14px; text-align: right; color: #44403c; font-family: monospace;">
                    ${formatPrice(item.unitPrice || 0)}
                  </td>
                  <td style="padding: 10px 14px; text-align: right; font-weight: 800; color: #0F2C26; font-family: monospace;">
                    ${formatPrice(item.subtotal || item.unitPrice * item.quantity)}
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <!-- FINANCIAL SUMMARY & SETTLEMENT BREAKDOWN -->
        <div style="margin-top: 18px; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; align-items: start;">
          
          <!-- Left: Amount in words & Royal Seal -->
          <div style="display: flex; gap: 14px; align-items: center; background: #FAF8F5; border: 1px solid #E7BD65; border-radius: 12px; padding: 14px 18px;">
            <div style="shrink-0;">${getRoyalSealSVG()}</div>
            <div style="font-size: 11px; line-height: 1.45;">
              <div style="font-weight: 800; color: #754917; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Total In Words:</div>
              <div style="font-style: italic; color: #1c1917; font-weight: 600; margin-top: 2px;">
                "${totalInWords}"
              </div>
              <div style="font-size: 10px; color: #78716c; margin-top: 6px;">
                All bulk preparations undergo strict quality testing and are sealed in moisture-protected, temperature-regulated containers.
              </div>
            </div>
          </div>

          <!-- Right: Deposit & Balance Breakdown -->
          <div style="background: #FFFFFF; border: 2px solid #7C3AED; border-radius: 12px; padding: 14px 18px; box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);">
            <div style="font-size: 11px; color: #57534e; display: flex; justify-content: space-between; padding-bottom: 6px;">
              <span>Total Event Booking Value:</span>
              <span style="font-family: monospace; font-weight: 800; color: #1c1917; font-size: 13px;">${formatPrice(booking.totalAmount || 0)}</span>
            </div>

            <div style="font-size: 11px; color: #059669; display: flex; justify-content: space-between; padding-bottom: 6px; font-weight: 700; border-top: 1px dashed #DDD6FE; padding-top: 6px;">
              <span>✓ Advance Deposit Received:</span>
              <span style="font-family: monospace;">${formatPrice(booking.advanceAmountPaid || 0)}</span>
            </div>

            <div style="font-size: 12px; color: ${booking.balanceAmountDue > 0 ? '#B91C1C' : '#059669'}; display: flex; justify-content: space-between; padding-bottom: 6px; font-weight: 800;">
              <span>${booking.balanceAmountDue > 0 ? 'Remaining Balance Due:' : 'Remaining Balance:'}</span>
              <span style="font-family: monospace; font-size: 13px;">${formatPrice(booking.balanceAmountDue || 0)}</span>
            </div>

            <div style="border-top: 2px solid #7C3AED; margin-top: 6px; padding-top: 8px; display: flex; justify-content: space-between; align-items: baseline;">
              <div>
                <span style="font-size: 12px; font-weight: 800; color: #2D1436; text-transform: uppercase;">Payment Settlement</span>
              </div>
              <span style="font-size: 11px; font-weight: 800; color: ${booking.balanceAmountDue > 0 ? '#B45309' : '#059669'};">
                ${booking.balanceAmountDue > 0 ? 'PARTIALLY SETTLED' : 'FULLY SETTLED'}
              </span>
            </div>
          </div>
        </div>

        <!-- FOOTER & LEGAL DISCLAIMER -->
        <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #ECE6D9; display: flex; justify-content: space-between; align-items: flex-end; font-size: 10px; color: #78716c;">
          <div style="line-height: 1.5; max-width: 480px;">
            <p style="margin: 0; font-weight: 600; color: #44403c;">
              Thank you for trusting Shree Mithai with your grand celebrations!
            </p>
            <p style="margin: 2px 0 0 0;">
              Any balance due may be settled online through your user dashboard prior to delivery dispatch.
              For changes to venue or delivery schedule, contact our VIP Event Desk at <strong>events@shreemithai.com</strong> or call <strong>+91 98765 43210</strong>.
            </p>
            <p style="margin: 2px 0 0 0; color: #B87F22; font-weight: 700;">
              Official Boutique: www.shreemithai.com &bull; Luxury Wedding & Event Catering Desk
            </p>
          </div>

          <div style="text-align: right;">
            <div style="font-family: 'Playfair Display', serif; font-size: 12px; font-weight: 700; color: #0F2C26; letter-spacing: 0.5px;">
              Shree Mithai & Confectionery
            </div>
            <div style="font-size: 9px; color: #A8A29E; margin-top: 1px;">Event Catering Directorate</div>
          </div>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const computedHeight = (canvas.height * pdfWidth) / canvas.width;

    if (computedHeight <= pdfPageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, computedHeight);
    } else {
      if (computedHeight < pdfPageHeight * 1.1) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfPageHeight);
      } else {
        let heightLeft = computedHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, computedHeight);
        heightLeft -= pdfPageHeight;

        while (heightLeft > 0) {
          position = heightLeft - computedHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, computedHeight);
          heightLeft -= pdfPageHeight;
        }
      }
    }

    if (autoDownload) {
      pdf.save(`Shree_Mithai_Event_Booking_${bookingNumber}.pdf`);
    }
  } catch (error) {
    console.error('Failed to generate booking PDF invoice:', error);
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
