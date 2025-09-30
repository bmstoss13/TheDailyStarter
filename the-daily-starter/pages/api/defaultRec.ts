import { Category, TaskType, PriorityType, RecommendationBlueprint } from '@/lib/firebase/interfaces'; // Assuming your types are in a file named 'your-data-interfaces'

export const defaultRecommendations: RecommendationBlueprint[] = [
  // --- DAILY TASK RECOMMENDATIONS ---
  {
    title: "Mindful Morning Stretch",
    notes: "Spend 5 minutes stretching before checking your phone. Good for mind and body.",
    category: Category.Physical,
    taskType: "daily",
    defaultPoints: 10,
    defaultPriority: "Low" as PriorityType
  },
  {
    title: "Post a 'Shine'",
    notes: "Share a win of the day with your friends!",
    category: Category.Social,
    taskType: "daily",
    defaultPoints: 25,
    defaultPriority: "Medium" as PriorityType
  },
  {
    title: "Clear Your Digital Inbox",
    notes: "Tackle the 'Productivity' category by deleting 10 junk emails or organizing 5 files.",
    category: Category.Productivity,
    taskType: "daily",
    defaultPoints: 20,
    defaultPriority: "Low" as PriorityType
  },
  {
    title: "Quick Journal Reflection",
    notes: "Write down three things you're grateful for today.",
    category: Category.Mindfulness,
    taskType: "daily",
    defaultPoints: 15,
    defaultPriority: "Low" as PriorityType
  },
  {
    title: "No-Spend Hour",
    notes: "Practice financial discipline by actively avoiding any purchases for one hour today.",
    category: Category.Financial,
    taskType: "daily",
    defaultPoints: 15,
    defaultPriority: "Medium" as PriorityType
  },
  
  // --- SCHEDULED EVENT RECOMMENDATIONS ---
  {
    title: "Deep Focus Work Block",
    notes: "Schedule a 90-minute block for uninterrupted, high-priority work. Turn off notifications!",
    category: Category.Productivity,
    taskType: "schedule",
    defaultPoints: 40,
    defaultPriority: "High" as PriorityType
  },
  {
    title: "Creative Hobby Time",
    notes: "Block an hour to dedicate to a hobby like drawing, writing, or playing an instrument.",
    category: Category.Creativity,
    taskType: "schedule",
    defaultPoints: 30,
    defaultPriority: "Medium" as PriorityType
  },
  {
    title: "Weekly Planning & Review",
    notes: "Schedule 45 minutes on Sunday evening to review the past week and plan the next.",
    category: Category.Productivity,
    taskType: "schedule",
    defaultPoints: 35,
    defaultPriority: "High" as PriorityType
  },
  
  // --- BUCKET LIST ITEM RECOMMENDATIONS ---
  {
    title: "Master a New Skill",
    notes: "A long-term goal to acquire proficiency in a challenging new skill (e.g., coding, painting, cooking).",
    category: Category.Mental,
    taskType: "bucket",
    defaultPriority: "High" as PriorityType
  },
  {
    title: "Complete a Local Hike",
    notes: "Find and complete a long, challenging hike or trail in your region.",
    category: Category.Physical,
    taskType: "bucket",
    defaultPriority: "Medium" as PriorityType
  },
  {
    title: "Volunteer for a Cause",
    notes: "Commit to regular volunteer work for a cause you care about to expand your social impact.",
    category: Category.Social,
    taskType: "bucket",
    defaultPriority: "Medium" as PriorityType
  }
];