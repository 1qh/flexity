'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@a/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
const faqs = [
    { a: 'A pixel-level resizable dashboard grid for React with zero config and full control.', q: 'What is ogrid?' },
    {
      a: 'Yes, fully typed with compile-time banned class checking and layout key inference.',
      q: 'Does it support TypeScript?'
    },
    { a: 'Tailwind v4 is a peer dependency. All styling flows through Tailwind classes.', q: 'What about Tailwind?' },
    { a: 'Yes, via localStorage with the id prop or controlled mode with onConfigChange.', q: 'Can I persist layouts?' }
  ],
  AccordionWidget = () => (
    <Card>
      <CardHeader>
        <CardTitle>FAQ</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion>
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${String(i)}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
export default AccordionWidget
