import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    console.log('RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: 'tickets@globalkontaktempire.com',
      to: 'kelvinboateng94@outlook.com',
      subject: 'Test Email from Resend',
      text: 'This is a test email from Resend.',
      // Basic email options only
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ 
        success: false, 
        error,
        message: 'Failed to send email via Resend API',
      }, { status: 500 });
    }

    console.log('Email sent successfully. ID:', data?.id);
    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Email sent successfully. Check your inbox and spam folder.'
    });
    
  } catch (error) {
    console.error('Error in test email endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to send test email'
      },
      { status: 500 }
    );
  }
}
