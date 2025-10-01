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
                <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <p>
                {date}
            </p>
            <button onClick={onNext}>
                <FontAwesomeIcon icon={faChevronRight} />
            </button>
        </div>
    )
}

export default DateToggler;