
interface ProgressProps{
    total: number;
    completed: number;
    color: string;
    height: string;    
}

/**
 * Bar to display visual progress of tasks completed vs. total
 */

const ProgressBar = ({total, completed, color, height}: ProgressProps) => {

    const progressMeter: number = completed/total;
    const borderRadius: number = parseInt(height.replaceAll('px', ''))
    const halfBorder: string = `${borderRadius / 2}px`

    return (
        <div 
            className="w-full bg-gray-300 border-gray-300 border-solid border-[1px]"
            style={{
                height: height,
                borderRadius: borderRadius
            }}
        >
            <div 
                className="h-full"
                style={{
                    background: color, 
                    width: `${(progressMeter) * 100}%`,
                    borderStartStartRadius: halfBorder,
                    borderEndStartRadius: halfBorder,
                    borderStartEndRadius: progressMeter >= 1 ? halfBorder : "0px",
                    borderEndEndRadius: progressMeter >= 1 ? halfBorder : "0px"
                }}
            >
                
            </div>
        </div>
    )
}

export default ProgressBar;