import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import dotenv from 'dotenv';

dotenv.config();

// Configure Neon for Node.js
neonConfig.webSocketConstructor = ws;

async function showDatabase() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔍 TOWER OF LEARNING DATABASE CONTENTS');
    console.log('='.repeat(60));

    // Users
    console.log('\n👥 USERS:');
    console.log('-'.repeat(40));
    const users = await pool.query('SELECT id, email, display_name, role, current_floor, level, xp, lectures_completed, battles_won, battles_lost, created_at FROM users ORDER BY created_at DESC');
    users.rows.forEach(user => {
      console.log(`ID: ${user.id.substring(0,8)}...`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.display_name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Floor: ${user.current_floor} | Level: ${user.level} | XP: ${user.xp}`);
      console.log(`  Lectures: ${user.lectures_completed} | Battles: ${user.battles_won}W/${user.battles_lost}L`);
      console.log(`  Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log('');
    });

    // Lectures
    console.log('\n📚 LECTURES:');
    console.log('-'.repeat(40));
    const lectures = await pool.query('SELECT floor, title, difficulty, xp_reward FROM lectures ORDER BY floor, order_in_floor');
    lectures.rows.forEach(lecture => {
      console.log(`Floor ${lecture.floor}: ${lecture.title} (${lecture.difficulty}) - ${lecture.xp_reward} XP`);
    });

    // Battles
    console.log('\n⚔️ BATTLES:');
    console.log('-'.repeat(40));
    const battles = await pool.query('SELECT id, floor, status, player1_score, player2_score, winner_id, created_at FROM battles ORDER BY created_at DESC LIMIT 5');
    battles.rows.forEach(battle => {
      console.log(`Battle ${battle.id.substring(0,8)}... - Floor ${battle.floor} - ${battle.status}`);
      console.log(`  Score: ${battle.player1_score} vs ${battle.player2_score}`);
      console.log(`  Winner: ${battle.winner_id ? battle.winner_id.substring(0,8) + '...' : 'Draw'}`);
      console.log('');
    });

    // Quiz Questions
    console.log('\n❓ QUIZ QUESTIONS:');
    console.log('-'.repeat(40));
    const questions = await pool.query('SELECT COUNT(*) as total FROM quiz_questions');
    console.log(`Total questions: ${questions.rows[0].total}`);

    // User Progress
    console.log('\n📊 USER PROGRESS:');
    console.log('-'.repeat(40));
    const progress = await pool.query('SELECT COUNT(*) as total_completed FROM user_progress WHERE completed = true');
    console.log(`Completed lectures: ${progress.rows[0].total_completed}`);

    console.log('\n✅ Database query completed!');

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

showDatabase();