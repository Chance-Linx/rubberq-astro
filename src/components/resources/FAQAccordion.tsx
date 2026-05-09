'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  return (
    <div className="bg-white p-8 shadow-sm">
      {items.map((faq, idx) => (
        <div key={idx} className="border-b border-industrial-200 last:border-0">
          <button
            onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
            className="w-full flex items-center justify-between py-5 text-left hover:bg-industrial-50 px-4 -mx-4 transition-colors"
          >
            <span className="font-bold text-industrial-900 pr-4">{faq.question}</span>
            {openFAQ === idx ? (
              <ChevronUp className="w-5 h-5 text-accent-orange flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-industrial-500 flex-shrink-0" />
            )}
          </button>
          {openFAQ === idx && (
            <div className="pb-5 text-industrial-600 leading-relaxed">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
