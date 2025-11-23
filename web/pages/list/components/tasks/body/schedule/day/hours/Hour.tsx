
interface HourProps{
    hour: string;
}

const Hour = ({
    hour,
}: HourProps) => {
    return (
        <div className="flex h-[80px] border-t-solid border-t-[1px] border-t-gray-300
        text-[var(--iconColor)]">
            {hour}
        </div>
    )
}

export default Hour;