import { useRef, useState } from 'react';
import styles from './PhotoUpload.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faCamera, faUpload } from '@fortawesome/free-solid-svg-icons';
import { UserProfileData } from '@/lib/firebase/interfaces';

interface PhotoUploadProps {
    onClose: () => void;
    onSubmit: (url: string) => void;
    userProfile: UserProfileData;
}

const PhotoUpload = ({onClose, onSubmit, userProfile}: PhotoUploadProps) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const selected = e.target.files?.[0];
            if (selected && selected.type.startsWith("image/")) {
                setFile(selected);
                setPreview(URL.createObjectURL(selected));
            }
        } catch (err: any){
            console.error("an error occurred while handling file upload/change: " + err);
        }

    }

    const handleUploadPhoto = () => {
        fileInputRef.current?.click()
    }

    const handleTakePhoto = async() => {
        setIsCameraActive(true)
        try{
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            console.log("video? " + videoRef.current);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                // setIsCameraActive(true);
                console.log("camera active? " + isCameraActive)
            } else {
                console.log("camera?")
            }

        } catch(err: any){
            console.error("an error occurred while accessing camera: ", err);
        }
    }

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if(ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if(blob){
                        const newFile = new File([blob], `${userProfile.username}photo.jpg`, { type: "image/jpeg"});
                        setFile(newFile)
                        const objectUrl = URL.createObjectURL(newFile);
                        setPreview(objectUrl);
                    }
                }, "image/jpeg");
            }

            const tracks = (video.srcObject as MediaStream)?.getTracks();
            tracks?.forEach((track) => track.stop());
            setIsCameraActive(false);
        }
    }

    const handleSubmit = () => {
        if (file && preview) {
            onSubmit(preview!);
        } 
    }

    return(
        <div className={styles.photoUploadModalOverlay}>
            <div className={styles.photoUploadContainer}>
                <div className={styles.photoUploadHeader}>
                    <h3>Photos</h3>
                    <button onClick={onClose}>
                        <FontAwesomeIcon icon={faX}/>
                    </button>
                </div>


                <div className={styles.photoUploadBody}>
                    {preview ? (
                        <div className={styles.preview}>
                            <img src={preview} alt="Preview" />
                        </div>
                    ) : isCameraActive ? (
                        <div className={styles.cameraContainer}>
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className={styles.cameraFeed}
                            />
                            <button 
                                onClick={handleCapture}
                                className={styles.captureButton}
                            >
                                Capture
                            </button>
                            <canvas ref={canvasRef} style={{ display: "none"}} />
                        </div>
                    ) : (
                    <div className={styles.photoInput}>
                        <button onClick={handleUploadPhoto}>
                            <FontAwesomeIcon icon={faUpload}/>Upload
                        </button>
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <button onClick={handleTakePhoto}>
                            <FontAwesomeIcon icon={faCamera}/>Take
                        </button>
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                    )}


                    <div className={styles.photoFooter}>
                        <div className={styles.usePhoto}>
                            <button onClick={handleSubmit} disabled={!file}>
                                Use Photo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PhotoUpload