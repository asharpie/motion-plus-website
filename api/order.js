// Motion+ Order API — Vercel Serverless Function
// Sends order email with file attachments via Resend

const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  try {
    const data = req.body;
    if (!data || !data.product || !data.customerEmail || !data.customerName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build email content and attachments
    const emailData = buildEmail(data);

    // Send via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Motion+ Orders <orders@motionplusllc.com>',
        to: ['team@motionplusllc.com'],
        reply_to: data.customerEmail,
        subject: emailData.subject,
        html: emailData.html,
        attachments: emailData.attachments
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Resend error:', errBody);
      return res.status(500).json({ error: 'Failed to send order email. Please email team@motionplusllc.com directly.' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Order API error:', err);
    return res.status(500).json({ error: 'Server error. Please email team@motionplusllc.com directly.' });
  }
};

function buildEmail(data) {
  var productNames = { uclamp: 'U-Clamp', wrapid: 'Wrapid', shinshe: 'Shin Sheath' };
  var productName = productNames[data.product] || data.product;
  var subject = 'New Order: ' + productName + ' from ' + data.customerName;
  var attachments = [];

  // Product-specific details
  var productDetails = '';

  if (data.product === 'uclamp') {
    productDetails = '<p><strong>Product:</strong> U-Clamp (Standard)</p>' +
      '<p><strong>Quantity:</strong> ' + (data.quantity || 1) + '</p>' +
      '<p><strong>Unit Price:</strong> $200</p>';

    // Attach U-Clamp STL file
    try {
      var stlPath = path.join(process.cwd(), 'assets', 'models', 'uclamp-clamp.stl');
      var stlData = fs.readFileSync(stlPath);
      attachments.push({
        filename: 'UClamp-order-' + Date.now() + '.stl',
        content: stlData.toString('base64')
      });
    } catch (e) {
      productDetails += '<p style="color:orange;"><em>Note: U-Clamp STL file could not be attached. Use the standard file from your local library.</em></p>';
    }

  } else if (data.product === 'wrapid') {
    var diameter = data.wheelDiameter === 'custom' ? (data.customWheelDiameter + ' inches (custom)') : (data.wheelDiameter + ' inches');
    productDetails = '<p><strong>Product:</strong> Wrapid Wheel Cover</p>' +
      '<p><strong>Wheel Diameter:</strong> ' + diameter + '</p>' +
      '<p><strong>Quantity:</strong> ' + (data.quantity || 1) + ' pair(s)</p>' +
      '<p><strong>Starting Price:</strong> $79/pair</p>' +
      '<p style="color:orange;"><em>Note: Wrapid print file is still in development. Prepare manually based on wheel diameter.</em></p>';

  } else if (data.product === 'shinshe') {
    // Build parameterized SCAD file
    var scadContent = buildCustomSCAD(data);
    var scadBase64 = Buffer.from(scadContent, 'utf-8').toString('base64');
    attachments.push({
      filename: 'ShinSheath-custom-' + data.customerName.replace(/[^a-zA-Z0-9]/g, '') + '.scad',
      content: scadBase64
    });

    productDetails = '<p><strong>Product:</strong> Shin Sheath (Custom)</p>' +
      '<p><strong>Quantity:</strong> ' + (data.quantity || 1) + '</p>' +
      '<p><strong>Starting Price:</strong> $200</p>' +
      '<h3>Customer Measurements</h3>' +
      '<table style="border-collapse:collapse; width:100%;">' +
      buildMeasurementRows(data) +
      '</table>' +
      '<p><em>Custom SCAD file is attached. Open in OpenSCAD, render (F6), export STL, then slice in Bambu Studio.</em></p>';
  }

  // Build full HTML email
  var html = '<div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto; color:#333;">' +
    '<div style="background:#DC143C; color:white; padding:20px; border-radius:8px 8px 0 0;">' +
    '<h1 style="margin:0; font-size:22px;">New ' + productName + ' Order</h1>' +
    '</div>' +
    '<div style="padding:24px; background:#f9f9f9; border:1px solid #ddd;">' +
    '<h2 style="color:#DC143C; font-size:18px; margin-top:0;">Product Details</h2>' +
    productDetails +
    '<hr style="border:none; border-top:1px solid #ddd; margin:20px 0;" />' +
    '<h2 style="color:#DC143C; font-size:18px;">Customer Information</h2>' +
    '<p><strong>Name:</strong> ' + esc(data.customerName) + '</p>' +
    '<p><strong>Email:</strong> <a href="mailto:' + esc(data.customerEmail) + '">' + esc(data.customerEmail) + '</a></p>' +
    (data.customerPhone ? '<p><strong>Phone:</strong> ' + esc(data.customerPhone) + '</p>' : '') +
    '<hr style="border:none; border-top:1px solid #ddd; margin:20px 0;" />' +
    '<h2 style="color:#DC143C; font-size:18px;">Shipping Address</h2>' +
    '<p>' + esc(data.shipStreet) + '<br/>' +
    esc(data.shipCity) + ', ' + esc(data.shipState) + ' ' + esc(data.shipZip) + '</p>' +
    (data.notes ? '<hr style="border:none; border-top:1px solid #ddd; margin:20px 0;" /><h2 style="color:#DC143C; font-size:18px;">Notes</h2><p>' + esc(data.notes) + '</p>' : '') +
    '</div>' +
    '<div style="padding:16px; background:#eee; border-radius:0 0 8px 8px; font-size:13px; color:#666; text-align:center;">' +
    'This order was submitted via motionplusllc.com/order' +
    '</div></div>';

  return { subject: subject, html: html, attachments: attachments };
}

function buildMeasurementRows(data) {
  var params = [
    { key: 'Cp', label: 'Lower prosthetic circumference' },
    { key: 'Cs', label: 'Calf circumference at soleus' },
    { key: 'Cg', label: 'Widest part of calf' },
    { key: 'Ct', label: 'Top of calf below knee' },
    { key: 'Hg', label: 'Ankle to widest calf' },
    { key: 'Hp', label: 'Ankle to top of prosthetic' },
    { key: 'Hk', label: 'Knee bend clearance' },
    { key: 'Wp', label: 'Prosthetic max width' },
    { key: 'Wk', label: 'Knee bend max width' },
    { key: 'Lp', label: 'Total prosthetic length' }
  ];
  var rows = '<tr style="background:#DC143C; color:white;"><th style="padding:8px; text-align:left;">Measurement</th><th style="padding:8px; text-align:left;">Value (mm)</th></tr>';
  params.forEach(function(p) {
    rows += '<tr style="border-bottom:1px solid #ddd;"><td style="padding:8px;">' + p.label + ' (' + p.key + ')</td><td style="padding:8px; font-weight:bold;">' + (data[p.key] || 'N/A') + '</td></tr>';
  });
  return rows;
}

function buildCustomSCAD(data) {
  // Read the template
  var templatePath = path.join(__dirname, 'shin-sheath-template.scad');
  var template = '';
  try {
    template = fs.readFileSync(templatePath, 'utf-8');
  } catch (e) {
    // Fallback: build from scratch with just the parameters
    template = getDefaultSCADTemplate();
  }

  // Replace parameter values in the template
  var replacements = {
    'Cp = 110': 'Cp = ' + (data.Cp || 110),
    'Cs = 270': 'Cs = ' + (data.Cs || 270),
    'Cg = 415': 'Cg = ' + (data.Cg || 415),
    'Ct = 357': 'Ct = ' + (data.Ct || 357),
    'Hg = 300': 'Hg = ' + (data.Hg || 300),
    'Hp = 187.5': 'Hp = ' + (data.Hp || 187.5),
    'Hk = 55': 'Hk = ' + (data.Hk || 55),
    'Wp = 71': 'Wp = ' + (data.Wp || 71),
    'Wk = 85': 'Wk = ' + (data.Wk || 85),
    'Lp = 400': 'Lp = ' + (data.Lp || 400)
  };

  var result = template;
  Object.keys(replacements).forEach(function(key) {
    result = result.replace(key, replacements[key]);
  });

  // Add a header comment with order info
  var header = '// ============================================\n' +
    '// CUSTOM SHIN SHEATH — Order for ' + (data.customerName || 'Customer') + '\n' +
    '// Generated: ' + new Date().toISOString().split('T')[0] + '\n' +
    '// Email: ' + (data.customerEmail || '') + '\n' +
    '// ============================================\n\n';

  return header + result;
}

function getDefaultSCADTemplate() {
  // Minimal fallback template with the core geometry
  return '// Shin Sheath Parametric Cover\n' +
    '// Open in OpenSCAD and press F6 to render\n\n' +
    'Cp = 110;\nCs = 270;\nCg = 415;\nCt = 357;\n' +
    'Hg = 300;\nHp = 187.5;\nHk = 55;\nWp = 71;\nWk = 85;\nLp = 400;\n\n' +
    '// NOTE: Full template was not found on server.\n' +
    '// Please use these parameters with the original SCAD file.\n';
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
