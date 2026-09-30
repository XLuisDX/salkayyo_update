import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface LegalSection {
  heading: string
  paragraphs: string[]
}

interface LegalContentProps {
  sections: LegalSection[]
}

export function LegalContent({ sections }: LegalContentProps) {
  return (
    <Accordion type="single" collapsible defaultValue={sections[0]?.heading} className="max-w-3xl">
      {sections.map((section) => (
        <AccordionItem key={section.heading} value={section.heading}>
          <AccordionTrigger className="text-base font-semibold tracking-tight">
            {section.heading}
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {section.paragraphs.map((paragraph, j) => (
              <p key={j} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
