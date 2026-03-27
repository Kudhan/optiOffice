const bcrypt = require('bcryptjs');

async function test() {
  const password = 'TemporaryPassword123!';
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log('Password:', password);
  console.log('Hashed Password:', hashedPassword);

  const isMatch = await bcrypt.compare(password, hashedPassword);
  console.log('Match (Same rounds):', isMatch);

  const salt10 = await bcrypt.genSalt(10);
  const hashedPassword10 = await bcrypt.hash(password, salt10);
  const isMatch10 = await bcrypt.compare(password, hashedPassword10);
  console.log('Match (Different rounds):', isMatch10);

  const plainCheck = await bcrypt.compare(password, password);
  console.log('Match (Plain check):', plainCheck);
}

test();
