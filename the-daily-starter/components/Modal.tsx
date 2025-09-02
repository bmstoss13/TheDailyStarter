import styles from "./Modal.module.css";
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { faX, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import React, { ReactNode } from "react";

interface ModalProps{
    onClose: () => void;
    title: string;
    iconProps?: FontAwesomeIconProps;
    footer?: ReactNode;
    children: React.ReactNode;
}

const Modal = ({onClose, children, title, footer, iconProps}: ModalProps) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <div className={styles.modalHeader}>
                    {iconProps && <FontAwesomeIcon {...iconProps} className={styles.modalHeaderIcon} />}
                    <h2>{title}</h2>
                    <button onClick={onClose}>
                        <FontAwesomeIcon icon={faX} />
                    </button>
                </div>
                <div className={styles.modalContent}>
                    {children}
                </div>
                {footer && (
                    <div className={styles.modalFooter}>
                        {footer}
                    </div>
                )}

            </div>
        </div>
    )
};

export default Modal;