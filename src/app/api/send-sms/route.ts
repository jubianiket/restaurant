
import { NextResponse } from 'next/server';

// Removed Twilio client initialization and environment variable checks

export async function POST(request: Request) {
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

    // Simulate sending the SMS by logging it
    console.log(`SIMULATED SMS to ${to}:`);
    console.log(`Body: ${body}`);
    
    // You could add a small delay here if you want to more closely mimic an API call
    // await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({ 
      success: true, 
      messageSid: `simulated-${Date.now()}`, // Provide a simulated SID
      message: 'SMS simulated successfully!' 
    });

  } catch (error) {
    console.error('Error in simulated SMS route:', error);
    
    let responseErrorMessage = 'An unknown error occurred during SMS simulation.';
    if (error instanceof Error) {
        responseErrorMessage = error.message;
    } else if (typeof error === 'string') {
        responseErrorMessage = error;
    }
    
    return NextResponse.json({ 
      message: 'Failed to simulate SMS.', 
      error: responseErrorMessage 
    }, { status: 500 });
  }
}
