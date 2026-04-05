import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, verificationLink } = body

    if (!email || !verificationLink) {
      return NextResponse.json(
        { error: 'Missing email or verification link' },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'Saklayyo Store <noreply@saklayyo.com>',
      to: email,
      subject: 'Verify Your Email - Saklayyo Store',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Verify Your Email</h1>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi ${name || 'there'},</p>
            <p>Thanks for signing up for Saklayyo Store! Please verify your email address by clicking the button below:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}"
                 style="background: #667eea; color: white; padding: 14px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email
              </a>
            </div>

            <p style="font-size: 14px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; word-break: break-all; color: #999;">
              ${verificationLink}
            </p>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              If you didn't create an account with Saklayyo Store, you can safely ignore this email.
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Saklayyo Store. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Email error:', error)
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error: any) {
    console.error('Email error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
