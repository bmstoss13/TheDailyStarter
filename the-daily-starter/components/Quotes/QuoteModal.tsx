import styles from './QuoteModal.module.css'
import { WeatherSunset } from './Sun'

interface QuoteModalProps {
    quote: {
        q: string,
        a: string
    },
    onClose: () => void;
}

const QuoteModal = ({quote, onClose}: QuoteModalProps) => {
    return(
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
            <h2 className={styles.modalHeader}> <WeatherSunset/> Daily Sunshine! </h2>
                <div className={styles.quoteContainer}>
                    <p className={styles.quoteText}>{quote.q}</p>
                    <p className={styles.quoteAuthor}>{quote.a}</p>
                </div>
                <button className={styles.modalCloseButton} onClick={onClose}>
                    Got it!
                </button>
            </div>
        </div>
    )
}

export default QuoteModal;