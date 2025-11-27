import { CategoryConfig } from '../types';

export const INTERVIEW_CATEGORIES: CategoryConfig[] = [
  {
    id: 'software-engineering',
    name: 'Software Engineering',
    description: 'Technical interviews for software development roles',
    context: 'Focus on algorithms, data structures, system design, and coding practices',
    questionTemplates: [
      'Describe your experience with {topic}',
      'How would you approach {problem}',
      'Explain the trade-offs between {option1} and {option2}'
    ]
  },
  {
    id: 'data-science',
    name: 'Data Science',
    description: 'Interviews for data science and machine learning positions',
    context: 'Focus on statistical analysis, machine learning, data visualization, and model evaluation',
    questionTemplates: [
      'How would you handle {data_problem}',
      'Explain your approach to {ml_task}',
      'What metrics would you use for {scenario}'
    ]
  },
  {
    id: 'product-management',
    name: 'Product Management',
    description: 'Product manager role interviews',
    context: 'Focus on product strategy, roadmapping, stakeholder management, and user research',
    questionTemplates: [
      'How would you prioritize {features}',
      'Describe your process for {product_task}',
      'How do you handle {pm_challenge}'
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Marketing and growth role interviews',
    context: 'Focus on marketing strategy, campaign management, analytics, and brand development',
    questionTemplates: [
      'How would you market {product}',
      'Describe your approach to {marketing_challenge}',
      'What channels would you use for {goal}'
    ]
  },
  {
    id: 'sales',
    name: 'Sales',
    description: 'Sales and business development interviews',
    context: 'Focus on sales techniques, relationship building, negotiation, and closing deals',
    questionTemplates: [
      'How do you handle {objection}',
      'Describe your sales process for {scenario}',
      'How would you approach {prospect}'
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Financial analyst and accounting role interviews',
    context: 'Focus on financial modeling, analysis, reporting, and investment strategies',
    questionTemplates: [
      'How would you analyze {financial_scenario}',
      'Explain your approach to {valuation_task}',
      'What factors would you consider for {decision}'
    ]
  },
  {
    id: 'consulting',
    name: 'Consulting',
    description: 'Management and strategy consulting interviews',
    context: 'Focus on case studies, problem-solving, business strategy, and client management',
    questionTemplates: [
      'How would you approach {business_problem}',
      'What framework would you use for {analysis}',
      'How do you handle {client_situation}'
    ]
  },
  {
    id: 'design',
    name: 'UX/UI Design',
    description: 'User experience and interface design interviews',
    context: 'Focus on design thinking, user research, prototyping, and visual design',
    questionTemplates: [
      'How would you design {feature}',
      'Describe your process for {design_challenge}',
      'How do you balance {design_tradeoff}'
    ]
  },
  {
    id: 'hr',
    name: 'Human Resources',
    description: 'HR and talent management interviews',
    context: 'Focus on recruitment, employee relations, performance management, and organizational development',
    questionTemplates: [
      'How would you handle {hr_situation}',
      'Describe your approach to {talent_challenge}',
      'What strategies would you use for {hr_goal}'
    ]
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Operations and supply chain management interviews',
    context: 'Focus on process optimization, logistics, quality control, and efficiency',
    questionTemplates: [
      'How would you optimize {process}',
      'Describe your approach to {operations_challenge}',
      'What metrics would you track for {operation}'
    ]
  },
  {
    id: 'customer-success',
    name: 'Customer Success',
    description: 'Customer success and support role interviews',
    context: 'Focus on customer relationships, retention, onboarding, and satisfaction',
    questionTemplates: [
      'How would you handle {customer_issue}',
      'Describe your approach to {cs_challenge}',
      'How do you measure {success_metric}'
    ]
  },
  {
    id: 'project-management',
    name: 'Project Management',
    description: 'Project and program management interviews',
    context: 'Focus on planning, execution, risk management, and team coordination',
    questionTemplates: [
      'How would you manage {project_scenario}',
      'Describe your approach to {pm_challenge}',
      'How do you handle {project_risk}'
    ]
  },
  {
    id: 'legal',
    name: 'Legal',
    description: 'Legal and compliance role interviews',
    context: 'Focus on legal analysis, contract review, compliance, and risk assessment',
    questionTemplates: [
      'How would you approach {legal_issue}',
      'Describe your analysis of {legal_scenario}',
      'What considerations are important for {legal_matter}'
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Healthcare and medical profession interviews',
    context: 'Focus on patient care, medical knowledge, clinical decision-making, and healthcare systems',
    questionTemplates: [
      'How would you handle {clinical_scenario}',
      'Describe your approach to {patient_situation}',
      'What factors would you consider for {medical_decision}'
    ]
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Teaching and educational role interviews',
    context: 'Focus on pedagogy, curriculum development, student engagement, and assessment',
    questionTemplates: [
      'How would you teach {concept}',
      'Describe your approach to {teaching_challenge}',
      'How do you handle {classroom_situation}'
    ]
  },
  {
    id: 'research',
    name: 'Research',
    description: 'Academic and industry research position interviews',
    context: 'Focus on research methodology, experimental design, analysis, and publication',
    questionTemplates: [
      'How would you design {experiment}',
      'Describe your approach to {research_problem}',
      'What methods would you use for {investigation}'
    ]
  },
  {
    id: 'executive',
    name: 'Executive Leadership',
    description: 'C-level and senior leadership interviews',
    context: 'Focus on strategic vision, organizational leadership, change management, and decision-making',
    questionTemplates: [
      'How would you lead {organizational_change}',
      'Describe your vision for {strategic_goal}',
      'How do you handle {leadership_challenge}'
    ]
  },
  {
    id: 'entrepreneurship',
    name: 'Entrepreneurship',
    description: 'Startup founder and entrepreneur interviews',
    context: 'Focus on business models, fundraising, growth strategies, and innovation',
    questionTemplates: [
      'How would you validate {business_idea}',
      'Describe your approach to {startup_challenge}',
      'What strategies would you use for {growth_goal}'
    ]
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    description: 'Information security and cybersecurity interviews',
    context: 'Focus on security architecture, threat analysis, incident response, and compliance',
    questionTemplates: [
      'How would you secure {system}',
      'Describe your approach to {security_threat}',
      'What measures would you implement for {security_goal}'
    ]
  },
  {
    id: 'devops',
    name: 'DevOps/SRE',
    description: 'DevOps and Site Reliability Engineering interviews',
    context: 'Focus on infrastructure, automation, monitoring, and reliability',
    questionTemplates: [
      'How would you improve {infrastructure_aspect}',
      'Describe your approach to {devops_challenge}',
      'What tools would you use for {operational_goal}'
    ]
  }
];

/**
 * Get a category configuration by ID
 * @param categoryId - The unique identifier for the category
 * @returns The category configuration or undefined if not found
 */
export function getCategoryById(categoryId: string): CategoryConfig | undefined {
  return INTERVIEW_CATEGORIES.find(cat => cat.id === categoryId);
}

/**
 * Get all available category IDs
 * @returns Array of all category IDs
 */
export function getAllCategoryIds(): string[] {
  return INTERVIEW_CATEGORIES.map(cat => cat.id);
}

/**
 * Check if a category ID is valid
 * @param categoryId - The category ID to validate
 * @returns True if the category exists, false otherwise
 */
export function isValidCategory(categoryId: string): boolean {
  return INTERVIEW_CATEGORIES.some(cat => cat.id === categoryId);
}

/**
 * Get the context string for a specific category
 * @param categoryId - The category ID
 * @returns The context string or empty string if category not found
 */
export function getCategoryContext(categoryId: string): string {
  const category = getCategoryById(categoryId);
  return category?.context ?? '';
}

/**
 * Get all categories (returns a copy to prevent mutation)
 * @returns Array of all category configurations
 */
export function getAllCategories(): CategoryConfig[] {
  return [...INTERVIEW_CATEGORIES];
}
