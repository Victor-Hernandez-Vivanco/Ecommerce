import bcrypt from "bcryptjs";

async function createAdminHash() {
  const password = "admin123";
  const hash = await bcrypt.hash(password, 12);
  console.log("Hash para admin123:", hash);
}

createAdminHash();
