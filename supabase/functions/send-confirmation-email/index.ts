import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ConfirmationEmail } from './_templates/confirmation-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  firstName: string
  email: string
  registrationType: 'individual' | 'team' | 'children'
  startTime?: string
  teamName?: string
  teamStartTime?: string
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const { 
      firstName, 
      email, 
      registrationType, 
      startTime, 
      teamName, 
      teamStartTime 
    }: EmailRequest = await req.json()

    console.log('Sending confirmation email to:', email, 'Type:', registrationType)

    // Render the React Email template
    const html = await renderAsync(
      React.createElement(ConfirmationEmail, {
        firstName,
        registrationType,
        startTime,
        teamName,
        teamStartTime,
      })
    )

    // Create plain text version (fallback)
    const getPlainTextContent = () => {
      let content = `Hallo ${firstName},\n\n`
      
      switch (registrationType) {
        case 'individual':
          content += `Du hast dich erfolgreich für den Durchlauf um ${startTime} angemeldet.\n\n`
          content += `Wir bitten dich, 30 Minuten vor Laufbeginn vor Ort zu sein, um deine Startnummer abzuholen und die Einweisung zu erhalten.\n\n`
          break
        case 'team':
          content += `Euer Team ${teamName} ist für den Durchlauf um ${teamStartTime} angemeldet.\n\n`
          content += `Wir bitten Euch, 30 Minuten vor Laufbeginn vor Ort zu sein, um eure Startnummer abzuholen und die Einweisung zu erhalten.\n\n`
          break
        case 'children':
          content += `Ihr habt euch erfolgreich für den Kinderlauf angemeldet.\n\n`
          content += `Startzeit: 13:30\n\n`
          content += `Wir bitten Euch, 30 Minuten vor Laufbeginn vor Ort zu sein, um die Startnummer(n) abzuholen und die Einweisung zu erhalten.\n\n`
          break
      }
      
      content += `Weitere Infos:\n`
      content += `• Es stehen nur wenige Parkplätze zur Verfügung (wir empfehlen, zu Fuß oder mit öffentlichen Verkehrsmitteln anzukommen).\n`
      content += `• Taschen können wir während der Laufzeit trocken beherbergen.\n`
      content += `• Nehmt Familie und Freunde zum Anfeuern mit: Vor Ort gibt es kleine Imbissstände und viel Programm für Kinder.\n`
      content += `• Unsere Sponsoren übernehmen die Spenden für gelaufene Runden. Trotzdem freuen wir uns, wenn ihr eure erlaufenen Beträge durch einen eigenen Beitrag unterstützt (bar / online möglich).\n`
      content += `• Kinder können wir (auf eigene Verantwortung) während der Laufzeiten betreuen\n\n`
      content += `Folgt uns auf Instagram: https://instagram.com/spendenlauf_luenburg/\n`
      content += `Bei Fragen: https://spendenlauf-bw-lg.de/FAQs\n\n`
      content += `Mit sportlichen Grüßen,\nDas Bundeswehr Spendenlauf-Team`
      
      return content
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Spendenlauf Lüneburg <onboarding@resend.dev>',
      to: [email],
      subject: 'Bestätigung zur Anmeldung – 2. Lüneburger Spendenlauf',
      html,
      text: getPlainTextContent(),
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log('Email sent successfully:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Confirmation email sent successfully',
        emailId: data?.id 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )

  } catch (error: any) {
    console.error('Error in send-confirmation-email function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    )
  }
})