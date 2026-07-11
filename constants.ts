
import { Job, Scholarship, Story, Deal, Company, UserProfile, Role, VerificationStatus, Thread } from './types';

export const DETAILED_MAJORS = [
    { category: 'All Categories', subcategories: ['All Majors'] },
    { category: 'Engineering & Architecture', subcategories: ['Architecture', 'Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Engineering (General)'] },
    { category: 'STEM & Health', subcategories: ['Computer Science', 'Physics', 'Chemistry', 'Biology', 'Pre-Med', 'Nursing', 'Environmental Science'] },
    { category: 'Business & Law', subcategories: ['Business Administration', 'Accounting', 'Finance', 'Marketing', 'Political Science'] },
    { category: 'Humanities & Arts', subcategories: ['History', 'English Literature', 'Psychology', 'Sociology', 'Art History', 'Philosophy', 'Journalism', 'Graphic Design', 'Culinary Arts'] },
    { category: 'Education & Vocational', subcategories: ['Education', 'Automotive Technology', 'Trade School'] },
];

export const MOCK_MEMBERS: UserProfile[] = [
  {
    uid: 'm1',
    name: 'Sarah Chen',
    email: 'sarah@mit.edu',
    headline: 'AI Research Student @ MIT | Aspiring ML Engineer',
    role: Role.STUDENT,
    isVerified: true,
    status: VerificationStatus.APPROVED,
    major: 'Computer Science',
    savedItems: [],
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    portfolioLinks: [
      { id: 'pl1', platform: 'GitHub', url: 'https://github.com/sarahchen' },
      { id: 'pl2', platform: 'LinkedIn', url: 'https://linkedin.com/in/sarahchen' },
      { id: 'pl3', platform: 'Portfolio', url: 'https://sarah.dev' }
    ],
    projects: [
      {
        id: 'p1',
        title: 'NeuralVision AI',
        description: 'A real-time computer vision system for identifying assistive devices in urban environments.',
        imageUrl: 'https://images.unsplash.com/photo-1555255707-c07966488bc7?w=800&h=450&fit=crop',
        link: 'https://github.com/sarahchen/neuralvision',
        tags: ['Python', 'PyTorch', 'React']
      },
      {
        id: 'p2',
        title: 'DataFlow Core',
        description: 'High-throughput data pipeline architecture optimized for distributed sensing networks.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bbbda540d3b9?w=800&h=450&fit=crop',
        link: 'https://github.com/sarahchen/dataflow',
        tags: ['Go', 'Kubernetes']
      }
    ],
    endorsements: [
      {
        id: 'e1',
        fromName: 'Dr. Robert Vance',
        relationship: 'Professor at MIT',
        text: 'Sarah is one of the most dedicated researchers I have had the pleasure to mentor. Her work on NeuralVision is truly groundbreaking.',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      }
    ]
  },
  {
    uid: 'm2',
    name: 'Marcus Miller',
    email: 'marcus@alumni.upenn.edu',
    headline: 'Software Engineer @ Google | Penn Alumni',
    role: Role.GRADUATE,
    isVerified: true,
    status: VerificationStatus.APPROVED,
    major: 'Software Engineering',
    savedItems: [],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    portfolioLinks: [
      { id: 'pl4', platform: 'Twitter', url: 'https://twitter.com/marcuscodes' }
    ]
  },
  {
    uid: 'm3',
    name: 'Jessica Wu',
    email: 'jess@design.school',
    headline: 'UX Designer & Visual Storyteller',
    role: Role.STUDENT,
    isVerified: false,
    status: VerificationStatus.PENDING,
    major: 'Graphic Design',
    savedItems: [],
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop'
  },
  {
    uid: 'm4',
    name: 'David Thorne',
    email: 'david@fintech.com',
    headline: 'Senior Analyst | Mentor for Finance Grads',
    role: Role.GRADUATE,
    isVerified: true,
    status: VerificationStatus.APPROVED,
    major: 'Finance',
    savedItems: [],
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=100&fit=crop'
  }
];

export const MOCK_THREADS: Thread[] = [
  {
    id: 't1',
    participantId: 'm2',
    lastMessage: 'Let me know when you have time for a quick coffee chat about the Google residency!',
    timestamp: Date.now() - 3600000,
    unread: true,
    messages: [
      { id: 'msg1', senderId: 'm2', text: 'Hey Alex! I saw your portfolio on Graduate. Impressive work.', timestamp: Date.now() - 7200000 },
      { id: 'msg2', senderId: 'u123', text: 'Thanks Marcus! Really appreciate you reaching out.', timestamp: Date.now() - 5000000 },
      { id: 'msg3', senderId: 'm2', text: 'Let me know when you have time for a quick coffee chat about the Google residency!', timestamp: Date.now() - 3600000 }
    ]
  },
  {
    id: 't2',
    participantId: 'm1',
    lastMessage: 'Good luck with the finals!',
    timestamp: Date.now() - 86400000,
    unread: false,
    messages: [
      { id: 'msg4', senderId: 'm1', text: 'Good luck with the finals!', timestamp: Date.now() - 86400000 }
    ]
  }
];

export const ALL_LOCATIONS = [
  'Remote', 'New York, NY', 'San Francisco, CA', 'Seattle, WA', 'Austin, TX', 'Chicago, IL', 'Boston, MA', 'London, UK', 'Sydney, AU', 'Hybrid',
];

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'c1',
    name: 'CipherSec',
    logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop',
    description: 'Leading the way in digital defense and proactive threat hunting. We protect the worlds most valuable data assets.',
    industry: 'Cybersecurity',
    website: 'https://ciphersec.io',
    location: 'Seattle, WA',
    reviews: [
      { id: 'r1', user_name: 'Former Intern', rating: 5, comment: 'Great mentorship program and high-stakes projects.', date: Date.now() - 10000000 },
      { id: 'r2', user_name: 'Junior Dev', rating: 4, comment: 'Fast-paced but very rewarding. Modern tech stack.', date: Date.now() - 5000000 }
    ]
  },
  {
    id: 'c2',
    name: 'InnovateX',
    logo_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=200&fit=crop',
    description: 'A design-first technology studio building tools for the next generation of creative professionals.',
    industry: 'Design Tech',
    website: 'https://innovatex.design',
    location: 'Austin, TX',
    reviews: [
      { id: 'r3', user_name: 'UX Designer', rating: 5, comment: 'The design culture here is unmatched. Absolute freedom to create.', date: Date.now() - 8000000 }
    ]
  },
  {
    id: 'c3',
    name: 'GoldStream Capital',
    logo_url: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=200&h=200&fit=crop',
    description: 'Global investment firm specializing in fintech and sustainable emerging markets.',
    industry: 'Finance',
    website: 'https://goldstream.com',
    location: 'New York, NY',
    reviews: []
  },
  {
    id: 'c4',
    name: 'Google',
    logo_url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=200&h=200&fit=crop',
    description: 'Google’s mission is to organize the world’s information and make it universally accessible and useful.',
    industry: 'Technology',
    website: 'https://google.com',
    location: 'Mountain View, CA',
    reviews: [
      { id: 'r4', user_name: 'Software Engineer', rating: 5, comment: 'Unrivaled benefits and the smartest people I have ever worked with.', date: Date.now() - 1000000 }
    ]
  }
];

export const MOCK_JOBS: Job[] = [
    { 
      id: 'j1',
      company_id: 'c1',
      title: 'Junior Cybersecurity Analyst', 
      company_name: 'CipherSec', 
      logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop', 
      remote_type: 'hybrid', 
      city: 'Seattle', 
      state: 'WA', 
      target_audience: 'graduates', 
      createdAt: Date.now() - 86400000, 
      skills: ['Security+', 'Python', 'Networking'], 
      status: 'open',
      salary: '$75,000 - $85,000',
      description_detail: 'Join our team to monitor, analyze, and respond to security threats in a fast-paced environment where your vigilance directly protects millions.',
      qualifications: ['Bachelor\'s degree in CS or related field', 'CompTIA Security+', 'Knowledge of SIEM tools'],
      target_majors: ['Computer Science', 'Information Technology', 'Cybersecurity'],
      benefits: ['Premium Health Insurance', 'Continuing Education Stipend', 'Modern Workspace'],
      culture_insights: 'CipherSec fosters a culture of deep technical curiosity. We hold weekly "Threat Talks" and encourage cross-team collaboration to stay ahead of adversaries.'
    },
    { 
      id: 'j2',
      company_id: 'c2',
      title: 'UX Design Intern', 
      company_name: 'InnovateX', 
      logo_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop', 
      remote_type: 'remote', 
      city: 'Austin', 
      state: 'TX', 
      target_audience: 'students', 
      createdAt: Date.now() - 172800000, 
      skills: ['Figma', 'Prototyping'], 
      status: 'open',
      salary: '$25/hour',
      description_detail: 'Work directly with our senior design team to craft interfaces that define the future of creative tooling. You will own specific features from research to hand-off.',
      qualifications: ['Enrolled in Design program', 'Portfolio demonstrating UX process', 'Strong communication skills'],
      target_majors: ['Graphic Design', 'Fine Arts', 'Computer Science', 'Psychology'],
      benefits: ['Remote Work Equipment Budget', 'Mentorship from Senior Leads', 'Potential for Full-time Offer'],
      culture_insights: 'We are a design-first studio. Our meetings are actually "critique sessions" where we value radical candor and aesthetic excellence.'
    },
    { 
      id: 'j3',
      company_id: 'c3',
      title: 'Financial Operations Associate', 
      company_name: 'GoldStream Capital', 
      logo_url: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=100&h=100&fit=crop', 
      remote_type: 'onsite', 
      city: 'New York', 
      state: 'NY', 
      target_audience: 'graduates', 
      createdAt: Date.now() - 345600000, 
      skills: ['Excel', 'SQL'], 
      status: 'open',
      salary: '$90,000 - $110,000',
      description_detail: 'Manage day-to-day financial operations for our high-growth fintech portfolio. You will be responsible for accuracy in high-stakes reporting environments.',
      qualifications: ['Degree in Finance', 'Expertise in data modeling', 'Attention to detail'],
      target_majors: ['Finance', 'Accounting', 'Economics', 'Business Administration'],
      benefits: ['Annual Performance Bonus', 'Gym Membership Reimbursement', '401k Matching'],
      culture_insights: 'GoldStream operates with the precision of a high-performance engine. We value data-driven decision making and professional integrity above all else.'
    },
    { 
      id: 'j4',
      company_id: 'c4',
      title: 'Software Engineering Fellow', 
      company_name: 'Google', 
      logo_url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=100&h=100&fit=crop', 
      remote_type: 'hybrid', 
      city: 'Mountain View', 
      state: 'CA', 
      target_audience: 'both', 
      createdAt: Date.now() - 1000000, 
      skills: ['Java', 'Algorithms'], 
      status: 'open',
      salary: '$120,000 (Base)',
      description_detail: 'Engage in a year-long fellowship focusing on planet-scale infrastructure. You will be paired with world-class engineers to solve problems affecting billions.',
      qualifications: ['Computer Science degree', 'Strong foundation in data structures', 'Coding proficiency in Java or C++'],
      target_majors: ['Computer Science', 'Software Engineering', 'Mathematics'],
      benefits: ['Free On-site Meals', 'Relocation Assistance', 'Comprehensive Health Plans'],
      culture_insights: 'The Google culture is built on curiosity and "Moonshot" thinking. We encourage our fellows to question the status quo and build for the long term.'
    }
];

export const MOCK_SCHOLARSHIPS: Scholarship[] = [
    { 
      id: 'sch1',
      name: 'STEM Innovation Grant', 
      provider: 'Tech Fund', 
      amount_display: '$5,000', 
      deadline: new Date('2026-03-01').getTime(), 
      eligible_levels: ['Undergraduate'], 
      application_url: '#', 
      featured: true 
    },
    { 
      id: 'sch2',
      name: 'Community Leadership Award', 
      provider: 'City Council', 
      amount_display: '$1,000', 
      deadline: new Date('2025-12-15').getTime(), 
      eligible_levels: ['High School'], 
      application_url: '#', 
      featured: false 
    },
    { 
      id: 'sch3',
      name: 'Women in Engineering Scholarship', 
      provider: 'Ada Lovelace Foundation', 
      amount_display: '$10,000', 
      deadline: new Date('2025-11-30').getTime(), 
      eligible_levels: ['Undergraduate', 'Graduate'], 
      application_url: '#', 
      featured: true 
    },
    { 
      id: 'sch4',
      name: 'Future AI Researchers Grant', 
      provider: 'DeepMind Labs', 
      amount_display: '$25,000', 
      deadline: new Date('2026-01-15').getTime(), 
      eligible_levels: ['Graduate'], 
      application_url: '#', 
      featured: true 
    },
    { 
      id: 'sch5',
      name: 'Creative Arts Excellence Award', 
      provider: 'Global Arts Council', 
      amount_display: '$3,500', 
      deadline: new Date('2025-10-01').getTime(), 
      eligible_levels: ['Undergraduate'], 
      application_url: '#', 
      featured: false 
    },
    { 
      id: 'sch6',
      name: 'Sustainable Energy Fellowship', 
      provider: 'Green Horizons', 
      amount_display: '$12,000', 
      deadline: new Date('2025-12-01').getTime(), 
      eligible_levels: ['Graduate'], 
      application_url: '#', 
      featured: false 
    },
    { 
      id: 'sch7',
      name: 'First-Generation College Grant', 
      provider: 'Pathways Foundation', 
      amount_display: '$4,000', 
      deadline: new Date('2026-04-20').getTime(), 
      eligible_levels: ['Undergraduate'], 
      application_url: '#', 
      featured: true 
    },
    { 
      id: 'sch8',
      name: 'Digital Design Visionary Fund', 
      provider: 'Adobe Community', 
      amount_display: '$5,000', 
      deadline: new Date('2025-09-15').getTime(), 
      eligible_levels: ['High School', 'Undergraduate'], 
      application_url: '#', 
      featured: false 
    },
    { 
      id: 'sch9',
      name: 'Public Health Research Stipend', 
      provider: 'Health First Initiative', 
      amount_display: '$8,500', 
      deadline: new Date('2025-08-30').getTime(), 
      eligible_levels: ['Graduate'], 
      application_url: '#', 
      featured: false 
    },
    { 
      id: 'sch10',
      name: 'Global Leadership Exchange', 
      provider: 'World Connect', 
      amount_display: '$15,000', 
      deadline: new Date('2026-02-14').getTime(), 
      eligible_levels: ['Undergraduate', 'Graduate'], 
      application_url: '#', 
      featured: true 
    }
];

export const MOCK_STORIES: Story[] = [
    { 
        id: 's1',
        title: 'The Resilience of the New Graduate', 
        subtitle: 'How 2024 graduates are redefining "The Hustle" in a shifting global economy.', 
        hero_image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=600&fit=crop', 
        featured: true, 
        author: 'Julian Thorne', 
        createdAt: Date.now() - 10000000,
        content: `Alex never thought cybersecurity was an option. "I started at community college thinking I'd do general IT," Alex says. But a chance encounter with a mentor changed everything.\n\n"I was working the help desk library when a professor noticed I was reading about network protocols for fun," Alex recalls. That professor, Dr. Mendez, encouraged Alex to apply for a state-funded cybersecurity bootcamp.\n\nThe journey wasn't easy. Late nights, complex certifications, and the pressure of a new field tested Alex's resolve. "There were moments I wanted to quit," Alex admits, "but seeing the real-world impact of keeping people safe online kept me going." Now, Alex leads a team of specialists at a Fortune 500 company.`
    },
    { 
        id: 's2',
        title: 'The Silicon Valley Exodus', 
        subtitle: 'Why top student talent is looking at the Midwest for their first roles.', 
        hero_image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=600&fit=crop', 
        featured: false, 
        author: 'Elena Rossi',
        createdAt: Date.now() - 20000000,
        content: `For decades, the path was clear: graduate and head West. But a new trend is emerging among Gen Z professionals—prioritizing community and cost of living over tech prestige.\n\n"I realized that a six-figure salary doesn't go far in San Francisco," says one graduate who recently moved to Columbus, Ohio. "Here, I can afford a life while doing the same high-impact work." The data supports this shift, with tech hubs in the South and Midwest seeing record growth in entry-level hiring.`
    },
    { 
        id: 's3',
        title: 'Beyond the GPA', 
        subtitle: 'Employers are shifting focus to soft skills and adaptability.', 
        hero_image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=center', 
        featured: false, 
        author: 'Marcus Chen',
        createdAt: Date.now() - 30000000,
        content: `In a world of automated screening, what makes a human candidate stand out? We spoke to five Fortune 500 recruiters who all said the same thing: "Tell me how you solved a problem with a team, not just your grade in Calc III."\n\nAdaptability has become the currency of the modern workplace. Projects, volunteer work, and even part-time jobs in unrelated fields can often showcase more grit than a perfect transcript.`
    }
];

export const MOCK_DEALS: Deal[] = [
    { id: 'd1', merchant: 'TechGear Co.', title: '50% off Laptops', description: 'Essential study tools.', code: 'GRADUATE50', tags: ['tech', 'supplies'] },
    { id: 'd2', merchant: 'DormDecor', title: '15% off Furniture', description: 'Make your room feel like home.', code: 'DORM15', tags: ['dorm', 'home'] },
    { id: 'd3', merchant: 'FashionFits', title: 'Student Discount Day', description: '20% off all clothing.', code: 'STUDENT20', tags: ['clothes'] }
];
