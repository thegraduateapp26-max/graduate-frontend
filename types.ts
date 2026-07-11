// Role enum updated to include RECRUITER
export enum Role {
  VISITOR = 'visitor',
  STUDENT = 'student',
  GRADUATE = 'graduate',
  EMPLOYER = 'employer',
  RECRUITER = 'recruiter',
  PROFESSOR = 'professor',
  ADMIN = 'admin',
}

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface PortfolioLink {
  id: string;
  platform: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  tags: string[];
}

export interface Endorsement {
  id: string;
  fromName: string;
  relationship: string;
  text: string;
  avatarUrl?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Thread {
  id: string;
  participantId: string;
  lastMessage: string;
  timestamp: number;
  unread: boolean;
  messages: Message[];
}

export interface JobAlert {
  id: string;
  title: string;
  filters: {
    keywords: string;
    location: string;
    major: string;
  };
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  headline?: string;
  role: Role;
  isVerified: boolean;
  status: VerificationStatus;
  activeStatus?: 'online' | 'offline'; // Added status field
  avatarUrl?: string;
  backgroundUrl?: string; // New field for aesthetics
  savedItems: SavedItem[];
  portfolioLinks?: PortfolioLink[];
  projects?: Project[];
  endorsements?: Endorsement[];
  jobAlerts?: JobAlert[];
  major?: string;
  school?: string;
  skills?: string[];
  location?: string;
  // Added company field to fix error in App.tsx line 365
  company?: string;
}

export interface SavedItem {
  item_type: 'job' | 'scholarship';
  item_id: string;
}

export interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  date: number;
}

export interface Company {
  id: string;
  name: string;
  logo_url: string;
  description: string;
  industry: string;
  website: string;
  location: string;
  reviews: Review[];
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  company_name: string;
  logo_url: string;
  remote_type: 'remote' | 'hybrid' | 'onsite';
  city: string;
  state: string;
  target_audience: 'students' | 'graduates' | 'both';
  createdAt: number;
  skills: string[];
  status: 'open' | 'closed';
  salary: string;
  description_detail: string;
  qualifications: string[];
  target_majors: string[];
  benefits?: string[];
  culture_insights?: string;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount_display: string;
  deadline: number;
  eligible_levels: string[];
  application_url: string;
  featured: boolean;
}

export interface Story {
  id: string;
  title: string;
  subtitle?: string;
  hero_image_url: string;
  featured: boolean;
  author: string;
  createdAt: number;
  content: string;
}

export interface Deal {
  id: string;
  merchant: string;
  title: string;
  description: string;
  code: string;
  tags: string[];
}