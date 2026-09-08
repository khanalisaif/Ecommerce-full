import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function testAdminOtpFlow() {
  const email = "hasansaifkhan0@gmail.com";
  console.log("1. Requesting Admin OTP login for:", email);

  try {
    const reqRes = await axios.post("http://localhost:5000/api/admin/auth/request-otp-login", {
      email,
    });
    console.log("OTP Request Response:", reqRes.data);

    // Retrieve the OTP from DB
    await mongoose.connect(process.env.DB_URL);
    const admin = await mongoose.connection.db.collection("admins").findOne({ email });
    console.log("Admin OTP in DB:", admin?.otp);

    if (!admin?.otp?.code) {
      throw new Error("OTP was not saved in DB!");
    }

    const otp = admin.otp.code;
    console.log(`2. Verifying OTP: ${otp} for email: ${email}`);

    const verifyRes = await axios.post("http://localhost:5000/api/admin/auth/verify-otp-login", {
      email,
      otp,
    });
    console.log("Verify Response Status:", verifyRes.status);
    console.log("Verify Response Data:", verifyRes.data);

    const token = verifyRes.data?.data?.token;
    if (!token) throw new Error("No token returned in verify response!");

    console.log("3. Testing /api/admin/auth/me with admin token...");
    const meRes = await axios.get("http://localhost:5000/api/admin/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("/me Response:", meRes.data);

    console.log("\n✅ ALL ADMIN OTP TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err.response?.data || err.message);
    process.exit(1);
  }
}

testAdminOtpFlow();
