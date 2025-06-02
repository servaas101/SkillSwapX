import { Check } from 'lucide-react';

export function Pricing() {
  const tiers = [
    {
      name: 'Free',
      price: 0,
      features: [
        'Basic profile management',
        'Skill tracking',
        'Public portfolio page',
        'Community access'
      ]
    },
    {
      name: 'Pro',
      price: 15,
      features: [
        'Everything in Free',
        'Advanced analytics',
        'Priority mentorship matching',
        'Verified achievements',
        'Custom domain support'
      ]
    },
    {
      name: 'Enterprise',
      price: 49,
      features: [
        'Everything in Pro',
        'Dedicated support',
        'Custom integrations',
        'Advanced security',
        'Team collaboration',
        'API access'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Pricing Plans</h1>
        <p className="mt-1 text-gray-500">
          Choose the perfect plan for your career journey
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="flex flex-col rounded-lg bg-white shadow-sm ring-1 ring-gray-200"
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">{tier.name}</h3>
              <p className="mt-4">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  ${tier.price}
                </span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <p className="mt-6 text-gray-500">
                Perfect for {tier.name === 'Free' ? 'getting started' : tier.name === 'Pro' ? 'growing professionals' : 'organizations'}
              </p>

              <ul className="mt-6 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="ml-3 text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-1 flex-col justify-end border-t border-gray-200 p-6">
              <button
                type="button"
                className={`block w-full rounded-md px-4 py-2 text-center text-sm font-medium ${
                  tier.name === 'Pro'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-blue-600 ring-1 ring-blue-200 hover:bg-gray-50'
                }`}
              >
                {tier.name === 'Free' ? 'Get started' : 'Subscribe'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 p-6 sm:rounded-lg">
        <h2 className="text-lg font-medium text-blue-900">Enterprise Solutions</h2>
        <p className="mt-2 text-blue-700">
          Need a custom solution? Contact our sales team for enterprise pricing and features.
        </p>
        <button
          type="button"
          className="mt-4 inline-flex items-center rounded-md border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          Contact Sales
        </button>
      </div>
    </div>
  );
}