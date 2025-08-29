import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ConfirmationEmailProps {
  firstName: string
  registrationType: 'individual' | 'team' | 'children'
  startTime?: string
  teamName?: string
  teamStartTime?: string
}

export const ConfirmationEmail = ({
  firstName,
  registrationType,
  startTime,
  teamName,
  teamStartTime,
}: ConfirmationEmailProps) => {
  const getTypeSpecificContent = () => {
    switch (registrationType) {
      case 'individual':
        return (
          <>
            <Text style={text}>
              Du hast dich erfolgreich für den Durchlauf um <strong>{startTime}</strong> angemeldet.
            </Text>
            <Text style={text}>
              Wir bitten dich, 30 Minuten vor Laufbeginn vor Ort zu sein, um deine Startnummer abzuholen und die Einweisung zu erhalten.
            </Text>
          </>
        )
      case 'team':
        return (
          <>
            <Text style={text}>
              Euer Team <strong>{teamName}</strong> ist für den Durchlauf um <strong>{teamStartTime}</strong> angemeldet.
            </Text>
            <Text style={text}>
              Wir bitten Euch, 30 Minuten vor Laufbeginn vor Ort zu sein, um eure Startnummer abzuholen und die Einweisung zu erhalten.
            </Text>
          </>
        )
      case 'children':
        return (
          <>
            <Text style={text}>
              Ihr habt euch erfolgreich für den Kinderlauf angemeldet.
            </Text>
            <Text style={text}>
              <strong>Startzeit:</strong> 13:30
            </Text>
            <Text style={text}>
              Wir bitten Euch, 30 Minuten vor Laufbeginn vor Ort zu sein, um die Startnummer(n) abzuholen und die Einweisung zu erhalten.
            </Text>
          </>
        )
      default:
        return <Text style={text}>Hallo</Text>
    }
  }

  return (
    <Html>
      <Head />
      <Preview>Bestätigung zur Anmeldung – 2. Lüneburger Spendenlauf</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>2. Lüneburger Spendenlauf</Heading>
          
          <Text style={text}>Hallo {firstName},</Text>
          
          {getTypeSpecificContent()}
          
          <Text style={text}>
            <strong>Weitere Infos:</strong>
          </Text>
          
          <ul style={list}>
            <li style={listItem}>
              Es stehen nur wenige Parkplätze zur Verfügung (wir empfehlen, zu Fuß oder mit öffentlichen Verkehrsmitteln anzukommen).
            </li>
            <li style={listItem}>
              Taschen können wir während der Laufzeit trocken beherbergen.
            </li>
            <li style={listItem}>
              Nehmt Familie und Freunde zum Anfeuern mit: Vor Ort gibt es kleine Imbissstände und viel Programm für Kinder.
            </li>
            <li style={listItem}>
              Unsere Sponsoren übernehmen die Spenden für gelaufene Runden. Trotzdem freuen wir uns, wenn ihr eure erlaufenen Beträge durch einen eigenen Beitrag unterstützt (bar / online möglich).
            </li>
            <li style={listItem}>
              Kinder können wir (auf eigene Verantwortung) während der Laufzeiten betreuen
            </li>
          </ul>
          
          <Text style={text}>
            Folgt uns auf{' '}
            <Link
              href="https://instagram.com/spendenlauf_luenburg/"
              target="_blank"
              style={link}
            >
              Instagram
            </Link>
            , um Bilder des Spendenlaufs zu sehen.
          </Text>
          
          <Text style={text}>
            Bei Fragen antwortet einfach auf diese E-Mail oder schaut in unseren{' '}
            <Link
              href="https://spendenlauf-bw-lg.de/FAQs"
              target="_blank"
              style={link}
            >
              FAQ
            </Link>
            .
          </Text>
          
          <Text style={footer}>
            Mit sportlichen Grüßen,<br />
            Das Bundeswehr Spendenlauf-Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ConfirmationEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
}

const container = {
  paddingLeft: '12px',
  paddingRight: '12px',
  marginLeft: '20px',
  marginRight: 'auto',
  maxWidth: '600px',
}

const h1 = {
  color: '#333',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  fontSize: '14px',
  margin: '24px 0',
}

const link = {
  color: '#2754C5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  fontSize: '14px',
  textDecoration: 'underline',
}

const list = {
  margin: '16px 0',
  paddingLeft: '20px',
}

const listItem = {
  color: '#333',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  fontSize: '14px',
  margin: '8px 0',
}

const footer = {
  color: '#333',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  fontSize: '14px',
  marginTop: '40px',
  marginBottom: '24px',
}