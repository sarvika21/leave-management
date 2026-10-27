let userId = null;
const $ = id => document.getElementById(id);

function showMessage(message, isError = false) {
  $('response-message').textContent = message;
  $('response-message').style.color = isError ? '#b42318' : '#18794e';
}

async function requestJSON(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}

$('registration-form').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const data = await requestJSON('/api/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: $('username').value.trim(), email: $('reg-email').value.trim(),
        rollNumber: $('roll-number').value.trim(), casualLeave: Number($('casual-leave').value),
        medicalLeave: Number($('medical-leave').value)
      })
    });
    $('registration-response').textContent = data.message;
    $('registration-form').reset();
    $('registration-section').hidden = true;
    $('login-section').hidden = false;
  } catch (error) { $('registration-response').textContent = error.message; }
});

$('login-form').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const data = await requestJSON('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: $('email').value.trim() })
    });
    userId = data.userId;
    $('username-display').textContent = data.username;
    $('roll-number-display').textContent = data.rollNumber;
    updateBalance(data);
    $('login-section').hidden = true;
    $('registration-section').hidden = true;
    $('balance-section').hidden = false;
    $('apply-leave-section').hidden = false;
    showMessage(data.message);
  } catch (error) { showMessage(error.message, true); }
});

function updateBalance(data) {
  $('casual-leave-display').textContent = data.casualLeave;
  $('medical-leave-display').textContent = data.medicalLeave;
}

$('refresh-balance').addEventListener('click', async () => {
  if (!userId) return;
  try { updateBalance(await requestJSON(`/api/leave-balance/${userId}`)); showMessage('Balance refreshed.'); }
  catch (error) { showMessage(error.message, true); }
});

$('leave-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!userId) return showMessage('Please log in first.', true);
  try {
    const data = await requestJSON(`/api/apply-leave/${userId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: $('leave-type').value, days: Number($('leave-days').value) })
    });
    updateBalance(data);
    $('leave-form').reset();
    showMessage(data.message);
  } catch (error) { showMessage(error.message, true); }
});

$('show-registration').addEventListener('click', () => {
  $('login-section').hidden = true; $('registration-section').hidden = false; showMessage('');
});
$('show-login').addEventListener('click', () => {
  $('registration-section').hidden = true; $('login-section').hidden = false; showMessage('');
});
$('logout-button').addEventListener('click', () => {
  userId = null;
  $('balance-section').hidden = true; $('apply-leave-section').hidden = true;
  $('login-section').hidden = false; $('registration-section').hidden = true;
  $('login-form').reset(); $('leave-form').reset(); showMessage('You have logged out.');
});
