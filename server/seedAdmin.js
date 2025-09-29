import { User } from "./model.js";
import dotenv from "dotenv";

dotenv.config();

const seedAdmin = async () => {
  try {
    // Get admin emails from environment variable (comma-separated)
    const adminEmails = process.env.ADMIN_EMAIL ? 
      process.env.ADMIN_EMAIL.split(',').map(e => e.trim()) : 
      ["jack@fishbones.digital"];

    console.log(`🔍 Looking for admin users with emails: ${adminEmails.join(', ')}`);

    let successCount = 0;
    let errorCount = 0;

    for (const adminEmail of adminEmails) {
      try {
        const user = await User.findOne({ where: { email: adminEmail } });

        if (user) {
          // Update existing user to admin
          await user.update({
            isAllowed: true,
            role: "admin",
          });

          console.log(`✅ Admin user updated: ${adminEmail}`);
          console.log(`   User ID: ${user.userId}`);
          console.log(`   Role: ${user.role}`);
          console.log(`   Access: ${user.isAllowed ? "Allowed" : "Blocked"}`);
          successCount++;
        } else {
          console.log(`❌ User not found: ${adminEmail}`);
          console.log("📋 To create admin user:");
          console.log("   1. Log in once with your Google account");
          console.log("   2. Run this script again: node seedAdmin.js");
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${adminEmail}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary: ${successCount} updated, ${errorCount} errors`);
    console.log("💡 Set multiple admin emails like: ADMIN_EMAIL=admin1@firm.com,admin2@firm.com");
  } catch (error) {
    console.error("❌ Error seeding admin users:", error);
  }
};

// Run the seed function
seedAdmin();
