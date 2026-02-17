const UserModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const TokenModel = require("../models/tokenModel");
const crypto = require("crypto");
const emailSender = require("../utils/emailSender");

const jwt = require("jsonwebtoken");

// Register
exports.register = async (req, res) => {
  console.log(req.body);
  let {
    username,
    email,
    password,
    role,
    experience,
    age,
    bio,
    specialization,
  } = req.body;

  let usernameExists = await UserModel.findOne({ username });
  if (usernameExists) {
    return res.status(400).json({ error: "Username not available" });
  }

  let emailExists = await UserModel.findOne({ email });
  if (emailExists) {
    return res.status(400).json({ error: "Email already registered." });
  }

  let salt = await bcrypt.genSalt(saltRounds);
  console.log(salt);
  let hashed_password = await bcrypt.hash(password, salt);

  let userToRegister = await UserModel.create({
    username,
    email,
    password: hashed_password,
    role: role || 0, // Default to User if not provided
    image: req.file ? req.file.filename : "",
    experience,
    age,
    dailyRate: req.body.dailyRate || 0,
    bio,
    specialization,
    image: req.file ? req.file.filename : "",
  });

  if (!userToRegister) {
    return res.status(400).json({ error: "Something went wrong" });
  }
  let tokenToSend = await TokenModel.create({
    token: crypto.randomBytes(24).toString("hex"),
    user: userToRegister._id,
  });
  if (!tokenToSend) {
    return res.status(400).json({ error: "Failed to generate token" });
  }

  const URL = `${process.env.FRONTEND_URL}/verify/${tokenToSend.token}`;
  emailSender({
    from: "noreply@something.com",
    to: email,
    subject: "Email Verification",
    text: "Click on the following link to verify your account",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Verify Your Email - Hikehub</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#1f7a4f; padding:20px; text-align:center;">
              <h1 style="margin:0; color:#ffffff;">Hikehub</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333;">
              <h2 style="margin-top:0;">Verify your email address</h2>
              <p>
                Thanks for joining <strong>Hikehub</strong>!  
                Please confirm your email address to activate your account.
              </p>

              <div style="text-align:center; margin:30px 0;">
                <a href="${URL}"
                   style="
                     background-color:#1f7a4f;
                     color:#ffffff;
                     padding:14px 28px;
                     text-decoration:none;
                     border-radius:6px;
                     font-weight:bold;
                     display:inline-block;
                   ">
                  Verify Email
                </a>
              </div>

              <p style="font-size:14px; color:#666666;">
                If the button doesn’t work, copy and paste this link into your browser:
              </p>
              <p style="font-size:13px; word-break:break-all; color:#1f7a4f;">
                ${URL}
              </p>

              <p style="margin-top:30px;">
                Happy hiking! 🌄<br />
                <strong>The Hikehub Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f0f0f0; padding:15px; text-align:center; font-size:12px; color:#888888;">
              © 2025 Hikehub. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`,
  });

  res.send({
    userToRegister,
    success: true,
    message: "User registered successfully.",
  });
};

// Update Profile Data
exports.updateProfile = async (req, res) => {
  try {
    const { username, experience, age, bio, specialization, dailyRate } = req.body;
    
    // Prepare update object
    const updateData = {
      username,
      experience,
      age,
      bio,
      specialization,
      dailyRate: Number(dailyRate) || 0
    };

    // If a new image is uploaded
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true } // Returns the updated document
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  let tokenToVerify = await TokenModel.findOne({ token: req.params.token });
  if (!tokenToVerify) {
    return res
      .status(400)
      .json({ error: "Invalid token or token may have expired" });
  }
  let userToVerify = await UserModel.findById(tokenToVerify.user);
  if (!userToVerify) {
    return res.status(400).json({ error: "User not found." });
  }
  if (userToVerify.isVerified) {
    return res.status(400).json({ error: "User already verified" });
  }
  userToVerify.isVerified = true;
  userToVerify = await userToVerify.save();
  if (!userToVerify) {
    return res.status(400).json({ error: "Failed to verify. Try again later" });
  }
  await TokenModel.findByIdAndDelete(tokenToVerify._id);

  res.send({ success: true, message: "User verified successfully." });
};

exports.resendVerification = async (req, res) => {
  let userToVerify = await UserModel.findOne({ email: req.body.email });
  if (!userToVerify) {
    return res.status(400).json({ error: "Email not registered" });
  }
  if (userToVerify.isVerified) {
    return res.status(400).json({ error: "User already verified." });
  }
  let tokenToSend = await TokenModel.create({
    user: userToVerify._id,
    token: crypto.randomBytes(16).toString("hex"),
  });
  if (!tokenToSend) {
    return res
      .status(400)
      .json({ error: "Faile to generate token. Try again later." });
  }
  const URL = `${process.env.FRONTEND_URL}/verify/${tokenToSend.token}`;
  emailSender({
    from: `noreply@something.com`,
    to: userToVerify.email,
    subject: "Verification Email",
    text: "Click on the following link to verify your email",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Verify Your Email - Hikehub</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#1f7a4f; padding:20px; text-align:center;">
              <h1 style="margin:0; color:#ffffff;">Hikehub</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333;">
              <h2 style="margin-top:0;">Verify your email address</h2>
              <p>
                Thanks for joining <strong>Hikehub</strong>!  
                Please confirm your email address to activate your account.
              </p>

              <div style="text-align:center; margin:30px 0;">
                <a href="${URL}"
                   style="
                     background-color:#1f7a4f;
                     color:#ffffff;
                     padding:14px 28px;
                     text-decoration:none;
                     border-radius:6px;
                     font-weight:bold;
                     display:inline-block;
                   ">
                  Verify Email
                </a>
              </div>

              <p style="font-size:14px; color:#666666;">
                If the button doesn’t work, copy and paste this link into your browser:
              </p>
              <p style="font-size:13px; word-break:break-all; color:#1f7a4f;">
                ${URL}
              </p>

              <p style="margin-top:30px;">
                Happy hiking! 🌄<br />
                <strong>The Hikehub Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f0f0f0; padding:15px; text-align:center; font-size:12px; color:#888888;">
              © 2025 Hikehub. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`,
  });
  res.send({
    success: true,
    message: "verification link has been sent to your email.",
  });
};
// forget password
exports.forgetPassword = async (req, res) => {
  let user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ error: "Email not registered" });
  }
  let tokenToSend = await TokenModel.create({
    user: user._id,
    token: crypto.randomBytes(16).toString("hex"),
  });
  if (!tokenToSend) {
    return res.status(400).json({ error: "Something went wrong." });
  }
  const URL = `${process.env.FRONTEND_URL}/resetpassword/${tokenToSend.token}`;

  emailSender({
    from: `noreply@somethig.com`,
    to: req.body.email,
    subject: `Password reset link`,
    text: `click on the following link to  reset your meail`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Reset Your Password - Hikehub</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#1f7a4f; padding:20px; text-align:center;">
              <h1 style="margin:0; color:#ffffff;">Hikehub</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333;">
              <h2 style="margin-top:0;">Reset your password</h2>
              <p>
                We received a request to reset your <strong>Hikehub</strong> account password.
              </p>
              <p>
                Click the button below to create a new password. This link will expire soon for your security.
              </p>

              <div style="text-align:center; margin:30px 0;">
                <a href="${URL}"
                   style="
                     background-color:#e5533d;
                     color:#ffffff;
                     padding:14px 28px;
                     text-decoration:none;
                     border-radius:6px;
                     font-weight:bold;
                     display:inline-block;
                   ">
                  Reset Password
                </a>
              </div>

              <p style="font-size:14px; color:#666666;">
                If you did not request a password reset, please ignore this email.  
                Your account will remain secure.
              </p>

              <p style="font-size:14px; color:#666666;">
                If the button doesn’t work, copy and paste this link into your browser:
              </p>
              <p style="font-size:13px; word-break:break-all; color:#1f7a4f;">
                ${URL}
              </p>

              <p style="margin-top:30px;">
                Stay safe and happy hiking! 🏕️<br />
                <strong>The Hikehub Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f0f0f0; padding:15px; text-align:center; font-size:12px; color:#888888;">
              © 2025 Hikehub. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`,
  });

  res.status(200).json({
    success: true,
    message: "Password reset link has been sent to your email",
  });
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    // 1. Validate that a password was actually sent
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // 2. Find the token in the database
    let token = await TokenModel.findOne({ token: req.params.token });
    if (!token) {
      return res
        .status(400)
        .json({ error: "Invalid token or token may have expired" });
    }

    // 3. Find the user associated with that token
    let user = await UserModel.findById(token.user);
    if (!user) {
      return res.status(400).json({ error: "User no longer exists" });
    }

    // 4. Hash the new password
    // Note: Use a standard saltRounds (usually 10)
    let salt = await bcrypt.genSalt(10);
    let hashed_password = await bcrypt.hash(password, salt);

    // 5. Update user password
    user.password = hashed_password;
    await user.save();

    // 6. Security: Delete the token so it cannot be used again
    await TokenModel.findByIdAndDelete(token._id);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  let user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "User not registered" });
  }
  let passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(400).json({ error: "Email and password do not match." });
  }
  if (!user.isVerified) {
    return res.status(400).json({ error: "User not verified." });
  }
  let token = jwt.sign(
    {
      _id: user._id,
      email,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.send({
    success: true,
    token,
    message: "Logged in successfully",
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      image: user.image, 
      experience: user.experience, 
      age: user.age,
      bio: user.bio,
      specialization: user.specialization,
    },
  });
};
// get all users
exports.getAllUsers = async (req, res) => {
  try {
    // We find all users. If you want to exclude sensitive data like passwords, 
    // you can use .select("-password")
    let users = await UserModel.find().select("-password");

    if (!users) {
      return res.status(400).json({ success: false, error: "No users found" });
    }

    // Wrapping in a 'data' object is best practice for consistency
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// for guide
exports.getAllGuides = async (req, res) => {
  try {
    // Specifically find users with role 2
    let guides = await UserModel.find({ role: 2 }).select("-password");
    res.status(200).json({ success: true, data: guides });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// get user details
exports.getUserDetails = async (req, res) => {
  let user = await UserModel.findById(req.params.id);
  if (!user) {
    return res.status(400).json({ error: "Something went wrong" });
  }
  res.send(user);
};

// delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Toggle user role (Admin/Client)
exports.toggleUserRole = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Toggle: if role is 1 (Admin), set to 0 (Client), and vice versa
    user.role = user.role === 1 ? 0 : 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${user.role === 1 ? "Admin" : "Client"}`,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.manualVerifyUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ error: "User is already verified" });
    }

    user.isVerified = true;
    await user.save();

    await TokenModel.deleteMany({ user: user._id });

    res.status(200).json({
      success: true,
      message: "User verified successfully by administrator",
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
