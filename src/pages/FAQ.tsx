import { Bookmark, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useState } from 'react';

type FAQItem = {
  question: string;
  answer: string;
  category: string;
};

const faqs: FAQItem[] = [
  {
    question: "What is SkillSwapX?",
    answer: "SkillSwapX is a global talent development ecosystem where professionals maintain lifetime ownership of their career data, skills, and achievements across organizations.",
    category: "Platform"
  },
  {
    question: "How does data ownership work?",
    answer: "Your profile, skills, certifications, and career history belong to you forever. Even if you change employers, your data remains under your control with full GDPR compliance.",
    category: "Data"
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use enterprise-grade security with end-to-end encryption, role-based access control, and strict GDPR compliance measures to protect your data.",
    category: "Security"
  },
  {
    question: "How do I verify my skills?",
    answer: "Skills can be verified through peer endorsements, project completion badges, and third-party certifications. All verifications are stored securely on the blockchain.",
    category: "Skills"
  },
  {
    question: "What are the benefits of mentorship?",
    answer: "Our mentorship program connects you with industry experts, helps accelerate your career growth, and provides verifiable achievements to showcase your progress.",
    category: "Mentorship"
  }
];

export function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h1>
        <p className="mt-1 text-gray-500">
          Find answers to common questions about SkillSwapX platform
        </p>
      </div>

      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search FAQs..."
              className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="divide-y divide-gray-200">
          {filteredFAQs.map((faq, index) => (
            <div key={index} className="px-4 py-6 sm:px-6">
              <button
                onClick={() => toggleItem(index)}
                className="flex w-full items-start justify-between text-left"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Bookmark className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-900">{faq.question}</p>
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {faq.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-6 flex h-7 items-center">
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-6 w-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </button>
              {openItems.includes(index) && (
                <div className="mt-4 ml-9">
                  <p className="text-base text-gray-500">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}