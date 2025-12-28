import { storage } from '../../server/storage';
import bcrypt from 'bcryptjs';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    console.log("Login attempt:", { email, passwordLength: password?.length });

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Get user
    const user = await storage.getUserByEmail(email);

    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    console.log("User found, comparing password...");

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json(user);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
}