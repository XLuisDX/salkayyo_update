import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getErrorMessage } from '@/lib/utils'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, resetLink } = body

    if (!email || !resetLink) {
      return NextResponse.json(
        { error: 'Missing email or reset link' },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'Saklayyo Store <noreply@saklayyo.com>',
      to: email,
      subject: 'Reset Your Password - Saklayyo Store',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Reset Your Password</h1>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi ${name || 'there'},</p>
            <p>We received a request to reset your password for your Saklayyo Store account. Click the button below to reset it:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}"
                 style="background: #667eea; color: white; padding: 14px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>

            <p style="font-size: 14px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; word-break: break-all; color: #999;">
              ${resetLink}
            </p>

            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>Security Note:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              If you didn't request a password reset, you can safely ignore this email.
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
        { error: 'Failed to send reset email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error: unknown) {
    console.error('Email error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
