/* ========================================
   Motion+ Order Page Logic
   ======================================== */

// Auto-select product if ?product=xxx is in URL
(function() {
  var params = new URLSearchParams(window.location.search);
  var prod = params.get('product');
  if (prod && ['uclamp', 'wrapid', 'shinshe'].indexOf(prod) !== -1) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { selectProduct(prod); });
    } else {
      setTimeout(function() { selectProduct(prod); }, 100);
    }
  }
})();

// Shin Sheath SCAD parameters with user-friendly labels
var SHIN_PARAMS = [
  { group: 'Circumference Measurements', fields: [
    { id: 'param_Cp', name: 'Cp', label: 'Lower prosthetic circumference', hint: 'Measure around the narrowest part of the lower prosthetic cylinder', unit: 'mm', def: 110 },
    { id: 'param_Cs', name: 'Cs', label: 'Calf at soleus', hint: 'Circumference of your biological leg at the soleus muscle', unit: 'mm', def: 270 },
    { id: 'param_Cg', name: 'Cg', label: 'Widest part of calf', hint: 'Circumference at the widest point of your calf (gastrocnemius)', unit: 'mm', def: 415 },
    { id: 'param_Ct', name: 'Ct', label: 'Top of calf, below knee', hint: 'Circumference just below the knee', unit: 'mm', def: 357 }
  ]},
  { group: 'Length and Width Measurements', fields: [
    { id: 'param_Hg', name: 'Hg', label: 'Ankle to widest calf', hint: 'Vertical distance from ankle to widest part of calf', unit: 'mm', def: 300 },
    { id: 'param_Hp', name: 'Hp', label: 'Ankle to top of prosthetic', hint: 'Vertical distance from ankle to top of lower prosthetic cylinder', unit: 'mm', def: 187.5 },
    { id: 'param_Hk', name: 'Hk', label: 'Knee bend clearance', hint: 'Distance needed for the knee to bend freely', unit: 'mm', def: 55 },
    { id: 'param_Wp', name: 'Wp', label: 'Prosthetic max width', hint: 'Maximum width of the chunky part of the prosthetic', unit: 'mm', def: 71 },
    { id: 'param_Wk', name: 'Wk', label: 'Knee bend max width', hint: 'Maximum width needed when knee is bent (back portion)', unit: 'mm', def: 85 },
    { id: 'param_Lp', name: 'Lp', label: 'Total prosthetic length', hint: 'Full length from ankle to knee', unit: 'mm', def: 400 }
  ]}
];

var selectedProduct = null;

function selectProduct(productId) {
  selectedProduct = productId;

  // Update card selection UI
  var cards = document.querySelectorAll('.order-product-card');
  cards.forEach(function(card) {
    card.classList.toggle('selected', card.getAttribute('data-product') === productId);
  });

  // Show form section
  document.getElementById('orderFormSection').style.display = 'block';
  document.getElementById('selectedProduct').value = productId;

  // Update title
  var names = { uclamp: 'U-Clamp', wrapid: 'Wrapid', shinshe: 'Shin Sheath' };
  document.getElementById('formProductName').textContent = names[productId] || 'Product';

  // Build product-specific fields
  var fieldsContainer = document.getElementById('productFields');
  fieldsContainer.innerHTML = '';

  if (productId === 'wrapid') {
    fieldsContainer.innerHTML = buildWrapidFields();
  } else if (productId === 'shinshe') {
    fieldsContainer.innerHTML = buildShinSheathFields();
  } else if (productId === 'uclamp') {
    fieldsContainer.innerHTML = buildUClampFields();
  }

  // Scroll to form
  setTimeout(function() {
    document.getElementById('orderFormSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function buildUClampFields() {
  return '<div class="order-form-section">' +
    '<h3 class="order-form-heading">Product Details</h3>' +
    '<div style="background: rgba(220,20,60,0.04); border: 1px solid rgba(220,20,60,0.1); border-radius: 12px; padding: 1.25rem;">' +
    '<p style="color: #ccc; margin: 0;">The U-Clamp is a universal fit adapter — no custom sizing needed. ' +
    'Works with standard manual wheelchairs and electric scooters.</p>' +
    '<p style="color: #DC143C; font-weight: 600; margin-top: 0.75rem; margin-bottom: 0;">Price: $200</p>' +
    '</div>' +
    '<div class="order-form-field" style="margin-top: 1rem;">' +
    '<label for="uclampQty">Quantity</label>' +
    '<select id="uclampQty" name="quantity">' +
    '<option value="1">1</option>' +
    '<option value="2">2</option>' +
    '<option value="3">3</option>' +
    '<option value="4">4</option>' +
    '<option value="5">5</option>' +
    '</select>' +
    '</div>' +
    '</div>';
}

function buildWrapidFields() {
  return '<div class="order-form-section">' +
    '<h3 class="order-form-heading">Wheel Specifications</h3>' +
    '<div class="order-form-row">' +
    '<div class="order-form-field">' +
    '<label for="wheelDiam">Wheelchair Wheel Diameter *</label>' +
    '<select id="wheelDiam" name="wheelDiameter" required>' +
    '<option value="">Select your wheel size</option>' +
    '<option value="22">22 inches (pediatric / small)</option>' +
    '<option value="24">24 inches (standard)</option>' +
    '<option value="25">25 inches (sport)</option>' +
    '<option value="26">26 inches (large)</option>' +
    '<option value="custom">Other / Not sure</option>' +
    '</select>' +
    '<span class="field-hint">Check the sidewall of your tire or your wheelchair manual for the size.</span>' +
    '</div>' +
    '</div>' +
    '<div class="order-form-field" id="customDiamField" style="display:none; margin-top: 1rem;">' +
    '<label for="customDiam">Custom Wheel Diameter (inches)</label>' +
    '<input type="number" id="customDiam" name="customWheelDiameter" step="0.5" min="16" max="30" placeholder="e.g., 23.5" />' +
    '</div>' +
    '<div class="order-form-field" style="margin-top: 1rem;">' +
    '<label for="wrapidQty">Quantity (pairs)</label>' +
    '<select id="wrapidQty" name="quantity">' +
    '<option value="1">1 pair</option>' +
    '<option value="2">2 pairs</option>' +
    '</select>' +
    '</div>' +
    '</div>';
}

function buildShinSheathFields() {
  var html = '<div class="order-form-section">' +
    '<h3 class="order-form-heading">Prosthetic Measurements</h3>' +
    '<p style="color: #999; font-size: 0.9rem; margin-bottom: 1.5rem;">' +
    'We need precise measurements of your prosthetic leg and biological leg to create a perfect custom fit. ' +
    'All measurements should be in <strong style="color:#DC143C;">millimeters (mm)</strong>. ' +
    'Use a flexible tape measure for circumferences and a ruler or tape for lengths.</p>';

  SHIN_PARAMS.forEach(function(group) {
    html += '<div class="measurement-group">';
    html += '<h4>' + group.group + '</h4>';
    html += '<div class="measurement-grid">';
    group.fields.forEach(function(f) {
      html += '<div class="order-form-field">' +
        '<label for="' + f.id + '">' + f.label + ' (' + f.unit + ') *</label>' +
        '<input type="number" id="' + f.id + '" name="' + f.name + '" step="0.1" min="1" required placeholder="e.g., ' + f.def + '" />' +
        '<span class="field-hint">' + f.hint + '</span>' +
        '</div>';
    });
    html += '</div></div>';
  });

  html += '<div class="order-form-field" style="margin-top: 1rem;">' +
    '<label for="shinQty">Quantity</label>' +
    '<select id="shinQty" name="quantity">' +
    '<option value="1">1</option>' +
    '<option value="2">2</option>' +
    '</select>' +
    '</div>' +
    '</div>';

  return html;
}

// Handle Wrapid custom diameter toggle
document.addEventListener('change', function(e) {
  if (e.target.id === 'wheelDiam') {
    var customField = document.getElementById('customDiamField');
    if (customField) {
      customField.style.display = e.target.value === 'custom' ? 'block' : 'none';
    }
  }
});

// Form submission
document.getElementById('orderForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  var form = e.target;
  var btn = document.getElementById('submitBtn');
  var status = document.getElementById('orderStatus');
  var originalText = btn.textContent;

  btn.textContent = 'Submitting...';
  btn.disabled = true;

  // Collect all form data
  var formData = new FormData(form);
  var data = {};
  formData.forEach(function(value, key) {
    data[key] = value;
  });

  // Add product display name
  var names = { uclamp: 'U-Clamp', wrapid: 'Wrapid', shinshe: 'Shin Sheath' };
  data.productName = names[data.product] || data.product;

  try {
    var res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    var result = await res.json();

    if (res.ok && result.success) {
      showOrderStatus('Order request submitted! Check your email (' + data.customerEmail + ') for a confirmation. We will be in touch within 1-2 business days to finalize your order.', false);
      form.reset();
      // Deselect product cards
      document.querySelectorAll('.order-product-card').forEach(function(c) { c.classList.remove('selected'); });
      document.getElementById('productFields').innerHTML = '';
      document.getElementById('orderFormSection').style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showOrderStatus(result.error || 'Something went wrong. Please try again or email team@motionplusllc.com.', true);
    }
  } catch (err) {
    showOrderStatus('Network error. Please try again or email team@motionplusllc.com directly.', true);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

function showOrderStatus(msg, isError) {
  var status = document.getElementById('orderStatus');
  status.style.display = 'block';
  status.style.background = isError ? 'rgba(220,20,60,0.12)' : 'rgba(46,204,113,0.12)';
  status.style.border = isError ? '1px solid #DC143C' : '1px solid #2ecc71';
  status.style.color = isError ? '#ff5777' : '#6edc9e';
  status.textContent = msg;
}
