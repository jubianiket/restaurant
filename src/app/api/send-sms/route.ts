
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
  }
} else {
  console.warn(
    "Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) are not set. SMS functionality will be disabled."
  );
}


export async function POST(request: Request) {
  if (!twilioClient) {
    return NextResponse.json({ message: 'SMS service is not configured on the server.', error: 'Twilio client not initialized. Check server logs.' }, { status: 503 });
  }
  if (!twilioPhoneNumber) {
    return NextResponse.json({ message: 'Twilio phone number is not configured on the server.', error: 'TWILIO_PHONE_NUMBER is not set in .env.local.' }, { status: 503 });
  }

  try {
    const { to, body } = await request.json();

    if (!to || !body) {
      return NextResponse.json({ message: 'Missing "to" (phone number) or "body" (message content).', error: 'Request body must contain "to" and "body".' }, { status: 400 });
    }

    if (!/^\+[1-9]\d{1,14}$/.test(to)) {
        console.warn(`Potentially invalid 'To' phone number format for SMS: ${to}. E.164 format (e.g., +1XXXXXXXXXX) is recommended.`);
    }
    if (body.length > 1600) {
        return NextResponse.json({ message: 'Message body is too long.', error: 'Message body exceeds maximum length.' }, { status: 400 });
    }

    const message = await twilioClient.messages.create({
      body: body,
      from: twilioPhoneNumber,
      to: to,
    });

    console.log('SMS sent successfully, SID:', message.sid);
    return NextResponse.json({ success: true, messageSid: message.sid, message: 'SMS sent successfully!' });

  } catch (error) {
    console.error('Failed to send SMS via Twilio:', error);
    let errorMessage = 'An unknown error occurred while sending SMS.';
    let statusCode = 500;

    if (error instanceof Error) {
        const twilioError = error as any; // Cast to any to check for Twilio-specific properties
        
        if (twilioError.code) { // Twilio errors usually have a code
            errorMessage = `Twilio Error (Code ${twilioError.code}): ${twilioError.message}`;
            statusCode = typeof twilioError.status === 'number' && twilioError.status >= 400 && twilioError.status < 600 ? twilioError.status : 400;

            if (twilioError.code === 21606) { // 'From' phone number is not a valid, SMS-capable Twilio phone number
                 errorMessage = `Twilio Error: '${twilioPhoneNumber}' is not a valid Twilio 'From' number or cannot send SMS. Please check your TWILIO_PHONE_NUMBER in .env.local and your Twilio account settings.`;
            } else if (twilioError.code === 21211) { // Invalid 'To' Phone Number
                 errorMessage = `Twilio Error: The recipient phone number ('${to}') is invalid. Ensure it's in E.164 format (e.g., +12223334444).`;
            } else if (twilioError.code === 21614) { // 'To' number is not SMS capable
                 errorMessage = `Twilio Error: The recipient phone number ('${to}') is not SMS-capable.`;
            } else if (twilioError.code === 20003) { // Auth error
                 errorMessage = `Twilio Authentication Error: Please check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.local.`;
                 statusCode = 401; // Unauthorized
            }
        } else {
            // Not a standard Twilio error with a code, use the generic message
            errorMessage = error.message;
        }
    }
    
    return NextResponse.json({ message: 'Failed to send SMS.', error: errorMessage }, { status: statusCode });
  }
}
