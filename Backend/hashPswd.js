import bcrypt from 'bcrypt';

const plainPassword = 'PixelPioneers@1234';
const saltRounds = 10;

const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

console.log('🔒 Hashed Password:', hashedPassword);


// const isMatch = await bcrypt.compare('your_password_here', hashedPassword);

// console.log('✅ Password match?', isMatch);
