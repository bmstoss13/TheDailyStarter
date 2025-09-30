import { Category, DailyTask, RecommendationBlueprint, ScheduledEvent } from "@/lib/firebase/interfaces"


export function handleTaskColor(task: DailyTask | ScheduledEvent | RecommendationBlueprint) {
    switch(task.category){
        case Category.Mental:
            return 'var(--mental)'
        case Category.Physical:
            return 'var(--physical)'
        case Category.Social:
            return 'var(--social)'
        case Category.Mindfulness:
            return'var(--mindfulness)'
        case Category.Productivity:
            return 'var(--productivity)'
        case Category.Creativity:
            return 'var(--creativity)'
        case Category.Financial:
            return 'var(--financial)'
        default:
            return ''
    }
}

export function handleCategoryColor(category: Category) {
    switch(category){
        case Category.Mental:
            return 'var(--mental)'
        case Category.Physical:
            return 'var(--physical)'
        case Category.Social:
            return 'var(--social)'
        case Category.Mindfulness:
            return'var(--mindfulness)'
        case Category.Productivity:
            return 'var(--productivity)'
        case Category.Creativity:
            return 'var(--creativity)'
        case Category.Financial:
            return 'var(--financial)'
        default:
            return ''
    }
}