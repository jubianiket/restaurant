
import { NextResponse } from 'next/server';
import Twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: Twilio.Twilio | null = null;
let twilioInitializationError: string | null = null;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  const missingVars = [
    !accountSid ? "TWILIO_ACCOUNT_SID" : null,
    !authToken ? "TWILIO_AUTH_TOKEN" : null,
    !twilioPhoneNumber ? "TWILIO_PHONE_NUMBER" : null,
  ].filter(Boolean).join(', ');
  twilioInitializationError = `Twilio is not configured. Missing environment variables: ${missingVars}. SMS sending will be disabled.`;
  console.warn(twilioInitializationError);
} else {
  try {
    twilioClient = new Twilio.Twilio(accountSid, authToken);
  } catch (error) {
    twilioInitializationError = `Failed to initialize Twilio client: ${(error as Error).message}`;
    console.error(twilioInitializationError);
  }
}

export async function POST(request: Request) {
  if (twilioInitializationError || !twilioClient) {
    return NextResponse.json({ 
      message: 'SMS service not available due to configuration error.', 
      error: twilioInitializationError || "Twilio client not initialized." 
    }, { status: 503 }); // Service Unavailable
  }

  let requestBody;
  try {
    requestBody = await request.json();
    const { to, body } = requestBody;

    if (!to || !body) {
      return NextResponse.json({ 
        message: 'Missing "to" (phone number) or "body" (message content).', 
        error: 'Request body must contain "to" and "body".' 
      }, { status: 400 });
    }

    if (!to.startsWith('+')) {
      return NextResponse.json({ 
        message: 'Invalid recipient phone number.', 
        error: "Recipient phone number must be in E.164 format (e.g., +12223334444)." 
      }, { status: 400 });
    }

    const message = await twilioClient.messages.create({
      body: body,
      from: twilioPhoneNumber,
      to: to,
    });

    return NextResponse.json({ 
      success: true, 
      messageSid: message.sid, 
      message: 'SMS sent successfully!' 
    });

  } catch (error: any) {
    console.error('Twilio API Error:', error);
    let errorMessage = 'Failed to send SMS due to an unexpected error.';
    let statusCode = 500;

    try {
      if (error.status && error.message) { // Twilio error structure
        statusCode = error.status;
        errorMessage = `Twilio Error (Code ${error.code || 'N/A'}): ${error.message}`;
        if (error.code === 21211) { // Invalid 'To' Phone Number
            errorMessage = `Twilio Validation Error: The recipient phone number ('${requestBody?.to}') is invalid. Ensure it's in E.164 format (e.g., +12223334444).`;
        } else if (error.code === 21606) { // 'From' phone number is not a valid Twilio number
            errorMessage = `Twilio Configuration Error: The 'From' number (${twilioPhoneNumber}) is not a valid Twilio phone number or has country/capability restrictions. Please check your Twilio console.`;
        } else if (error.code === 21608) { // Unverified 'To' number for trial accounts
            errorMessage = `Twilio Error (Code ${error.code}): The number ${requestBody?.to || 'provided'} is unverified. Trial accounts cannot send messages to unverified numbers; verify ${requestBody?.to || 'the number'} at twilio.com/user/account/phone-numbers/verified, or purchase a Twilio number to send messages to unverified numbers.`;
        } else if (error.code === 20003) { // Account suspended or not enough funds
            errorMessage = `Twilio Account Issue (Code ${error.code}): Cannot send SMS. Your Twilio account may be suspended or have insufficient funds. Details: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
    } catch (processingError) {
        console.error("Error processing Twilio error object:", processingError);
        // Keep the original generic error message if processing the Twilio error itself fails
    }
    
    return NextResponse.json({ 
      message: 'Failed to send SMS.', 
      error: errorMessage 
    }, { status: statusCode });
  }
}
