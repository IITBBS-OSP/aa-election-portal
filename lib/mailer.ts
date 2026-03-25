import nodemailer from "nodemailer"
import { google } from "googleapis"

const OAuth2 = google.auth.OAuth2

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
})

const IS_DEV = process.env.NODE_ENV !== "production"
const DEV_EMAIL = process.env.DEV_EMAIL!

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const accessToken = await oauth2Client.getAccessToken()

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_FROM,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token || "",
      },
    })

    const finalRecipient = IS_DEV ? DEV_EMAIL : to

    await transporter.sendMail({
      from: `IIT BBS Elections <${process.env.EMAIL_FROM}>`,
      to: finalRecipient,
      subject,
      html: IS_DEV
        ? `
        <div style="border:1px solid #ccc; padding:12px">
          <p><strong>[DEV MODE]</strong></p>
          <p><strong>Original recipient:</strong> ${to}</p>
          <hr />
          ${html}
        </div>
      `
        : html,
    })
  } catch (error: any) {
    throw new Error(error.message)
  }
}







// import nodemailer from "nodemailer"
// import { google } from "googleapis"

// const OAuth2 = google.auth.OAuth2

// const oauth2Client = new OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET
// )

// oauth2Client.setCredentials({
//   refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
// })

// export async function sendMail({
//   to,
//   subject,
//   html,
// }: {
//   to: string
//   subject: string
//   html: string
// }) {
//   try {
//     const accessToken = await oauth2Client.getAccessToken()

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         type: "OAuth2",
//         user: process.env.EMAIL_FROM,
//         clientId: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
//         accessToken: accessToken.token || "",
//       },
//     })

//     await transporter.sendMail({
//       from: `IIT BBS Elections <${process.env.EMAIL_FROM}>`,
//       to,
//       subject,
//       html,
//     })
//   } catch (error: any) {
//     throw new Error(error.message)
//   }
// }