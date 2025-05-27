const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '../../.responder-state.json');

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (error) {
    // Silent fail
  }
  return null;
}

function saveState(responderId, responderToken) {
  try {
    const state = { responderId, responderToken };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    // Silent fail
  }
}

function clearState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      fs.unlinkSync(STATE_FILE);
    }
  } catch (error) {
    // Silent fail
  }
}

module.exports = {
  loadState,
  saveState,
  clearState
};