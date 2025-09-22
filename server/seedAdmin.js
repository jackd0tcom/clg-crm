import { User } from "./model.js";
import dotenv from "dotenv";

dotenv.config();

const seedAdmin = async () => {
  try {
    // Get admin email from environment variable or use default
    const adminEmail = process.env.ADMIN_EMAIL || "jackballdev@gmail.com";

    console.log(`🔍 Looking for user with email: ${adminEmail}`);

    const user = await User.findOne({ where: { email: adminEmail } });

    if (user) {
      // Update existing user to admin
      await user.update({
        isAllowed: true,
        role: "admin",
      });

      console.log("✅ Admin user updated successfully!");
      console.log(`   User ID: ${user.userId}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Access: ${user.isAllowed ? "Allowed" : "Blocked"}`);
    } else {
      console.log("❌ User not found in database.");
      console.log("📋 To create your admin user:");
      console.log("   1. Log in once with your Google account");
      console.log("   2. Run this script again: node seedAdmin.js");
      console.log("");
      console.log("💡 Or set the FIRST_ADMIN_EMAIL environment variable:");
      console.log(
        "   FIRST_ADMIN_EMAIL=admin@yourlawfirm.com node seedAdmin.js"
      );
    }
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  }
};

// Run the seed function
seedAdmin();
