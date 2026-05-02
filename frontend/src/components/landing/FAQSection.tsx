import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What audio formats does HarBaat support?',
    answer:
      'We support MP3, WAV, M4A, and OGG files up to 100MB in size. Most meeting recordings from Zoom, Teams, Google Meet, or any phone recording app will work directly.',
  },
  {
    question: 'How long does processing take?',
    answer:
      'Most recordings are fully processed in under 5 minutes. A 1-hour meeting typically completes transcription and entity extraction in 3–4 minutes, with knowledge graph and conflict analysis running in the background.',
  },
  {
    question: 'Is my meeting data private and secure?',
    answer:
      'Yes. All recordings are encrypted in transit and at rest. We do not use your data to train our models, and you can delete your data at any time from the settings page.',
  },
  {
    question: 'Can I rename speakers after the fact?',
    answer:
      'Absolutely. HarBaat auto-detects speakers as SPEAKER_00, SPEAKER_01, etc. You can rename them to real names directly in the speaker panel, and those names persist across future meetings with the same voice.',
  },
  {
    question: 'What languages are supported?',
    answer:
      "We currently support English, Spanish, French, German, Mandarin Chinese, Japanese, Arabic, Hindi, and Urdu. Auto-detection picks the dominant language automatically if you don't specify.",
  },
  {
    question: 'How does conflict detection work?',
    answer:
      "After each meeting is processed, our system compares entities, decisions, and deadlines against all previous meetings in the same project. If a task was reassigned, a deadline changed, or a decision was reversed without acknowledgment, you'll see it flagged in the Conflicts tab.",
  },
  // {
  //   question: 'Can I use HarBaat via API?',
  //   answer:
  //     'API access is available on the Pro and Team plans. Full documentation is available at docs.harbaat.ai.',
  // },
  // {
  //   question: 'Is there a free trial for paid plans?',
  //   answer:
  //     'Yes. All paid plans include a 14-day free trial with no credit card required. You can upgrade, downgrade, or cancel at any time.',
  // },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 sm:py-24 px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">FAQ</p>
        <h2 className="text-4xl font-bold tracking-tight">Frequently asked questions</h2>
        <p className="mt-4 text-muted-foreground text-lg">
          Everything you need to know about HarBaat AI.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-border rounded-lg px-4"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
