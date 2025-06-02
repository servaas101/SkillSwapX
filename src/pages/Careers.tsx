import { Briefcase, MapPin, Clock } from 'lucide-react';

const positions = [
  {
    title: 'Senior Full Stack Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build and maintain our core platform features.'
  },
  {
    title: 'Product Manager',
    department: 'Product',
    location: 'New York, NY',
    type: 'Full-time',
    description: 'Drive product strategy and roadmap.'
  },
  {
    title: 'UX Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Create beautiful and intuitive user experiences.'
  }
];

export function Careers() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Join Our Team</h1>
        <p className="mt-1 text-gray-500">
          Help us build the future of professional development
        </p>
      </div>

      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="divide-y divide-gray-200">
            {positions.map((position, index) => (
              <div key={index} className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {position.title}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Briefcase className="mr-1.5 h-4 w-4" />
                        {position.department}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1.5 h-4 w-4" />
                        {position.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1.5 h-4 w-4" />
                        {position.type}
                      </div>
                    </div>
                  </div>
                  <button className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                    Apply Now
                  </button>
                </div>
                <p className="mt-4 text-sm text-gray-600">{position.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}