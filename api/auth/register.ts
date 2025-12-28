import { storage } from '../../server/storage';
import bcrypt from 'bcryptjs';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, displayName, role, password, firebaseUid } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: "Email, password, and display name are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    let user = await storage.getUserByEmail(email);

    if (user) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await storage.createUser({
      email,
      displayName: displayName || email.split("@")[0],
      passwordHash,
      role: role || "student",
      firebaseUid,
      currentFloor: 1,
      level: 1,
      xp: 0,
      streak: 0,
      battlesWon: 0,
      battlesLost: 0,
      lecturesCompleted: 0,
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
}