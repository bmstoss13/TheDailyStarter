import { Category, CategoryType, DailyTask, RecommendationBlueprint, ScheduledEvent } from "@/lib/firebase/interfaces"


export function handleTaskColor(task: DailyTask | ScheduledEvent | RecommendationBlueprint) {

    switch(task.category){
        case 'Mental':
            return 'var(--mental)'
        case 'Physical':
            return 'var(--physical)'
        case 'Social':
            return 'var(--social)'
        case 'Mindfulness':
            return'var(--mindfulness)'
        case 'Productivity':
            return 'var(--productivity)'
        case 'Creativity':
            return 'var(--creativity)'
        case 'Financial':
            return 'var(--financial)'
        default:
            return ''
    }
}

export function handleCategoryColor(category: Category | CategoryType) {
    switch(category){
        case 'Mental':
            return 'var(--mental)'
        case 'Physical':
            return 'var(--physical)'
        case 'Social':
            return 'var(--social)'
        case 'Mindfulness':
            return'var(--mindfulness)'
        case 'Productivity':
            return 'var(--productivity)'
        case 'Creativity':
            return 'var(--creativity)'
        case 'Financial':
            return 'var(--financial)'
        default:
            return ''
    }
}