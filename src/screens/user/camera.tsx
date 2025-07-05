import { useRef } from "react";
type CameraCaptureProps = {
    images: File[] | null; // or string[] if you're storing base64/image URLs
    setImages: React.Dispatch<React.SetStateAction<File[]>> | null; // or string[] depending on the above
};
export default function CameraCapture({ images, setImages }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // const [images, setImages] = useState<string[]>([]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current!.srcObject = stream;
        } catch (err) {
            alert("Camera access denied or not available");
        }
    };

    const captureImage = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d")?.drawImage(video, 0, 0);
            const imageData = canvas.toDataURL("image/png");
            // Convert base64 to File object
            function dataURLtoFile(dataurl: string, filename: string) {
                const arr = dataurl.split(',');
                const mime = arr[0].match(/:(.*?);/)?.[1] || '';
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new File([u8arr], filename, { type: mime });
            }
            const file = dataURLtoFile(imageData, `capture-${Date.now()}.png`);
            setImages && setImages((prev) => [...prev, file]);
        }
    };

    return (
        <div>
            <video ref={videoRef} autoPlay style={{ width: "100%" }} />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div className="mt-2 d-flex gap-2">
                <button onClick={startCamera}>Start Camera</button>
                <button onClick={captureImage}>Capture</button>
            </div>

            <div className="mt-3 d-flex flex-wrap gap-2">
                {images && images.map((img, idx) => (
                    <img
                        key={idx}
                        src={URL.createObjectURL(img)}
                        alt={`captured-${idx}`}
                        width={80}
                        height={80}
                        style={{ objectFit: "cover", borderRadius: "8px" }}
                    />
                ))}
            </div>
        </div>
    );
}
