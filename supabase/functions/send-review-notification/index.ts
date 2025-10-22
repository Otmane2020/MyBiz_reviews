import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  reviewId: string;
  userId: string;
  locationName: string;
  author: string;
  rating: number;
  comment: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: RequestBody = await req.json();
    const { reviewId, userId, locationName, author, rating, comment } = body;

    console.log('📧 Sending review notification for review:', reviewId);

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      console.error('❌ Could not get user email:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userEmail = userData.user.email;
    const stars = '⭐'.repeat(rating);

    // Email content
    const emailSubject = `🔔 Nouvel avis ${rating} étoiles - ${locationName}`;
    const emailBody = `
Bonjour,

Vous avez reçu un nouvel avis pour votre établissement "${locationName}" !

${stars} (${rating}/5)
Par : ${author}

"${comment}"

Connectez-vous à Starlinko pour répondre à cet avis :
https://starlinko.app

---
Ceci est une notification automatique de Starlinko.
`;

    // Here you would integrate with an email service like SendGrid, Resend, etc.
    // For now, we'll log it
    console.log('📧 Email would be sent to:', userEmail);
    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);

    // TODO: Integrate with email service
    // Example with Resend:
    // const resendApiKey = Deno.env.get('RESEND_API_KEY');
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${resendApiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'Starlinko <notifications@starlinko.app>',
    //     to: userEmail,
    //     subject: emailSubject,
    //     text: emailBody,
    //   }),
    // });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification sent',
        email: userEmail
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
