package TaskEnums

type GrowthCategory string

const (
	Mental       GrowthCategory = "Mental"
	Physical     GrowthCategory = "Physical"
	Social       GrowthCategory = "Social"
	Mindfulness  GrowthCategory = "Mindfulness"
	Productivity GrowthCategory = "Productivity"
	Creativity   GrowthCategory = "Creativity"
	Financial    GrowthCategory = "Financial"
)

type TaskType string

const (
	Daily    TaskType = "daily"
	Schedule TaskType = "schedule"
	Bucket   TaskType = "bucket"
)

type PriorityType string

const (
	Low    PriorityType = "Low"
	Medium PriorityType = "Medium"
	High   PriorityType = "High"
)

type TimeType string

const (
	Minute TimeType = "Minute"
	Hour   TimeType = "Hour"
	None   TimeType = "N/A"
)
