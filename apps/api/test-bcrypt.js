const bcrypt = require('bcryptjs');

// Test if the password Admin@123 matches common bcrypt hashes
const password = 'Admin@123';

console.log('Testing password:', password);
console.log('');

// Generate a fresh hash
const freshHash = bcrypt.hashSync(password, 10);
console.log('Fresh hash for Admin@123:');
console.log(freshHash);
console.log('');

// Test verification
const isValid = bcrypt.compareSync(password, freshHash);
console.log('Verification test:', isValid ? '✅ PASS' : '❌ FAIL');
