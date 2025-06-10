
import { NextResponse } from 'next/server';
import Twilio from 'twilio';

// Ensure these environment variables are set in your .env.local file
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: Twilio.Twilio | null = null;

if (accountSid && authToken) {
  try {
    twilioClient = new Twilio.Twilio(accountSid, authToken);
  } catch (error) {
    console.error("Failed to initialize Twilio client:", error);
    // You might want to handle this more gracefully, e.g., by disabling SMS functionality
  }
} else {
  console.warn(
    "Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) are not set. SMS functionality will be disabled."
  );
}


export async function POST(request: Request) {
  if (!twilioClient) {
    return NextResponse.json({ message: 'SMS service is not configured on the server.' }, { status: 503 });
  }
  if (!twilioPhoneNumber) {
    return NextResponse.json({ message: 'Twilio phone number is not configured on the server.' }, { status: 503 });
  }

  try {
    const { to, body } = await request.json();

    if (!to || !body) {
      return NextResponse.json({ message: 'Missing "to" (phone number) or "body" (message content).' }, { status: 400 });
    }

    // Basic phone number validation (can be improved)
    // E.164 format is recommended for Twilio, e.g., +1XXXXXXXXXX
    if (!/^\+[1-9]\d{1,14}$/.test(to)) {
        console.warn(`Invalid phone number format for SMS: ${to}. Attempting to send anyway.`);
        // You might want to be stricter here, but for now, let Twilio handle it.
    }
    if (body.length > 1600) { // Twilio has a limit, often around 1600 characters for concatenated SMS
        return NextResponse.json({ message: 'Message body is too long.' }, { status: 400 });
    }


    const message = await twilioClient.messages.create({
      body: body,
      from: twilioPhoneNumber,
      to: to,
    });

    console.log('SMS sent successfully, SID:', message.sid);
    return NextResponse.json({ success: true, messageSid: message.sid, message: 'SMS sent successfully!' });

  } catch (error) {
    console.error('Failed to send SMS:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while sending SMS.';
    
    // Check for specific Twilio error codes if needed
    // if (error.code === 21211) { // Invalid 'To' Phone Number
    //   return NextResponse.json({ message: "The 'To' phone number is not a valid E.164 format.", error: errorMessage }, { status: 400 });
    // }

    return NextResponse.json({ message: 'Failed to send SMS.', error: errorMessage }, { status: 500 });
  }
}
