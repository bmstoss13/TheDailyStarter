import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";



interface DateTogglerProps{
    date: string;
    onPrev: () => void;
    onNext: () => void;
}

const DateToggler = ({
    date,
    onPrev,
    onNext

}: DateTogglerProps) => {
    return(
        <div className={`flex items-center text-center`}>
            <button onClick={onPrev}>
                <FontAwesomeIcon 
                    icon={faChevronLeft} 
                    className="cursor-pointer"
                />
            </button>
            <p>
                {date}
            </p>
            <button onClick={onNext}>
                <FontAwesomeIcon 
                    icon={faChevronRight} 
                    className="cursor-pointer"
                />
            </button>
        </div>
    )
}

export default DateToggler;