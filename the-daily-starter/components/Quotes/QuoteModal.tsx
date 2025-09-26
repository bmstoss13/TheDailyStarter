"use client";

import styles from './QuoteModal.module.css';
import { WeatherSunset } from './Sun';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';


interface QuoteModalProps {
    quote: {
        quote: string,
        author: string
    },
    onClose: () => void;
}

const QuoteModal = ({quote, onClose}: QuoteModalProps) => {
    return(
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
            <h2 className={styles.modalHeader}> <WeatherSunset className={styles.sunriseIcon}/> Quote of The Day! </h2>
                <div className={styles.quoteContainer}>
                    <p className={styles.quoteText}>"{quote.quote}"</p>
                    <p className={styles.quoteAuthor}>—{quote.author}</p>
                </div>
                <div className={styles.closeContainer}>
                    <button className={styles.modalCloseButton} onClick={onClose}>
                        Got it! <FontAwesomeIcon icon={faThumbsUp}/>
                    </button>
                </div>

            </div>
        </div>
    )
}

export default QuoteModal;