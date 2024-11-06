import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/user";
import randomInteger from "random-int";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.GMAIL_AUTH_USER,
    pass: process.env.GMAIL_AUTH_PASS,
  },
});

export async function POST(req) {
  const body = await req.json();

  await dbConnect();

  const { email } = body;

  // Check if user with email exists
  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json(
      {
        err: "User not found",
      },
      { status: 400 }
    );
  }

  // const resetCode = nanoid(6); // Generate a 6-character code
  const resetCode = randomInteger(100000, 999999);

  // Save reset code in the user document
  user.resetCode = {
    data: resetCode,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 phút
  };
  await user.save();

  // Send email
  const mailOptions = {
    to: email,
    from: process.env.GMAIL_AUTH_USER,
    subject: "Password Reset Code",
    html: `
          Hi ${user.name},<br />
          <br />
          You have requested a password reset. Please use the following code to reset your password:<br />
          <br />
          <strong>${resetCode}</strong><br />
          <br />
          If you did not request a password reset, please ignore this email.<br />
          <br />
          Thanks,<br />
          The ShineTech Team
      `,
  };

  //   return NextResponse.json({
  //     message: "Check your email for password reset code",
  //   });

  //   transporter.sendMail(mailOptions, (error, info) => {
  //     if (error) {
  //       console.error("Error sending email:", error);
  //       return NextResponse.json(
  //         {
  //           err: "Error sending email",
  //         },
  //         { status: 500 }
  //       );
  //     } else {
  //       console.log("Email sent:", info.response);
  //       return NextResponse.json({
  //         message: "Check your email for password reset code",
  //       });
  //     }
  //   });

  try {
    // Send the email
    await transporter.sendMail(mailOptions);

    // Assuming that the email is sent successfully, send the response to the client.
    return NextResponse.json({
      message: "Check your email for password reset code",
    });
  } catch (error) {
    console.error("Error sending email:", error);

    // If there's an error while sending the email, return an appropriate error response.
    return NextResponse.json(
      {
        err: "Error sending email",
      },
      { status: 500 }
    );
  }
}
