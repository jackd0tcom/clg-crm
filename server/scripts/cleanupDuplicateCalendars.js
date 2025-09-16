// Script to help clean up duplicate CLG CMS Tasks calendars
// Run this with: node server/scripts/cleanupDuplicateCalendars.js

import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

async function listAndCleanupCalendars() {
  try {
    console.log("🔍 This script will help you identify duplicate CLG CMS Tasks calendars");
    console.log("⚠️  IMPORTANT: You'll need to manually delete duplicates from Google Calendar");
    console.log("📋 Here's what to do:");
    console.log("   1. Check the output below for duplicate calendars");
    console.log("   2. Go to Google Calendar (calendar.google.com)");
    console.log("   3. Find the 'CLG CMS Tasks' calendars");
    console.log("   4. Delete all but one (keep the one with the most recent creation date)");
    console.log("   5. The app will automatically use the remaining one\n");

    // Get auth URL for manual authentication
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar'],
      prompt: 'consent'
    });

    console.log("🔗 To use this script, you need to:");
    console.log("   1. Visit this URL and authorize the app:");
    console.log(`   ${authUrl}`);
    console.log("   2. Copy the authorization code from the redirect");
    console.log("   3. Run: node cleanupDuplicateCalendars.js <authorization_code>");
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function analyzeCalendars(authCode) {
  try {
    // Exchange auth code for tokens
    const { tokens } = await oauth2Client.getToken(authCode);
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // List all calendars
    const response = await calendar.calendarList.list();
    const allCalendars = response.data.items;

    console.log(`📋 Found ${allCalendars.length} total calendars\n`);

    // Find CLG CMS Tasks calendars
    const clgCalendars = allCalendars.filter(cal => cal.summary === 'CLG CMS Tasks');

    if (clgCalendars.length === 0) {
      console.log("✅ No CLG CMS Tasks calendars found. Everything looks clean!");
      return;
    }

    console.log(`🎯 Found ${clgCalendars.length} CLG CMS Tasks calendars:\n`);

    clgCalendars.forEach((cal, index) => {
      console.log(`${index + 1}. Calendar Details:`);
      console.log(`   ID: ${cal.id}`);
      console.log(`   Name: ${cal.summary}`);
      console.log(`   Description: ${cal.description || 'No description'}`);
      console.log(`   Primary: ${cal.primary ? 'Yes' : 'No'}`);
      console.log(`   Access Role: ${cal.accessRole}`);
      console.log(`   Background Color: ${cal.backgroundColor}`);
      console.log(`   Foreground Color: ${cal.foregroundColor}`);
      console.log('');
    });

    if (clgCalendars.length > 1) {
      console.log("⚠️  DUPLICATE CALENDARS DETECTED!");
      console.log("📝 Recommendation:");
      console.log("   1. Keep the calendar with the most recent description or creation date");
      console.log("   2. Delete the others from Google Calendar");
      console.log("   3. The app will automatically use the remaining calendar");
      
      // Try to determine which one to keep
      const recommendedCalendar = clgCalendars.find(cal => 
        cal.description && cal.description.includes('clg-cms-')
      ) || clgCalendars[0];
      
      console.log(`\n💡 Suggested calendar to keep: ${recommendedCalendar.id}`);
      console.log(`   (${recommendedCalendar.summary})`);
    } else {
      console.log("✅ Only one CLG CMS Tasks calendar found. No cleanup needed!");
    }

  } catch (error) {
    console.error("Error analyzing calendars:", error.message);
  }
}

// Main execution
const authCode = process.argv[2];

if (authCode) {
  analyzeCalendars(authCode);
} else {
  listAndCleanupCalendars();
}
