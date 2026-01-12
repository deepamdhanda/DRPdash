import { useEffect, useRef, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import {
  Modal,
  Button,
  Form,
  Badge,
  ProgressBar,
  Alert,
  Tabs,
  Tab,
} from "react-bootstrap";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import {
  completeChunk,
  getAllDamageReports,
  postStartChunks,
  uploadChunk,
} from "../../APIs/user/damage-report";

export interface DamageReport {
  _id: string;
  order_id: string;
  live_recording_key: string;
  damage_type:
    | "physical_damage"
    | "packaging_damage"
    | "quantity_issue"
    | "functional_damage";
  return_status: "pending" | "approved" | "rejected";
  created_by: string;
}
const scanningSound = new Audio("/scanner-beep.mp3"); // Place the sound file in the public folder

interface VideoRecorderModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

export interface UploadPart {
  PartNumber: number;
  ETag: string;
}

const MAX_DURATION = 20;
const CHUNK_SIZE = 5 * 1024 * 1024;

function VideoRecorderModal({
  show,
  onHide,
  onSuccess,
}: VideoRecorderModalProps) {
  const [activeTab, setActiveTab] = useState<string>("id-scan");

  const [orderId, setOrderId] = useState<string>("");
  const [manualInput, setManualInput] = useState<string>("");
  const [description, setDescription] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [damageType, setDamageType] =
    useState<DamageReport["damage_type"]>("physical_damage");

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (show && activeTab === "video-record") {
      initCamera();
    } else {
      stopCamera();
    }
    return () => cleanup();
  }, [show, activeTab]);

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setError(null);
    } catch (err) {
      setError("Camera access denied. Please allow permissions.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopCamera();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  };

  const handleBarcodeDetected = (result: any) => {
    if (result) {
      setOrderId(result.text);
      setActiveTab("video-record");
    }
  };

  const handleManualAdd = () => {
    if (manualInput.trim()) {
      setOrderId(manualInput.trim());
      setActiveTab("video-record");
    }
  };

  const startRecording = () => {
    chunks.current = [];
    if (!streamRef.current) return;
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm",
    });
    recorder.ondataavailable = (e) =>
      e.data.size && chunks.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: "video/webm" });
      setVideoBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
    setTime(0);
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t + 1 >= MAX_DURATION) stopRecording();
        return t + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSubmit = async () => {
    if (!videoBlob || !orderId) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const videoId = Date.now().toString();
      const { uploadId, id } = await postStartChunks({
        order_id: orderId,
        videoId,
        damage_type: damageType,
        description,
      });
      const totalChunks = Math.ceil(videoBlob.size / CHUNK_SIZE);
      const parts: UploadPart[] = [];

      for (let i = 0; i < totalChunks; i++) {
        const chunk = videoBlob.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const formData = new FormData();
        formData.append("uploadId", uploadId);
        formData.append("videoId", videoId);
        formData.append("chunkIndex", i.toString());
        formData.append("chunk", chunk);

        const result = await uploadChunk(formData);
        parts.push({ PartNumber: result.partNumber, ETag: result.ETag });
        setUploadProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      await completeChunk({ uploadId, videoId, parts, id });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    cleanup();
    setOrderId("");
    setManualInput("");
    setVideoBlob(null);
    setPreviewUrl(null);
    setSuccess(false);
    setError(null);
    setActiveTab("id-scan");
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>New Damage Report</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        {success && <Alert variant="success">Submitted successfully!</Alert>}

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || "id-scan")}
          className="mb-4"
          justify
        >
          {/* TAB 1: ID SCANNER */}
          <Tab eventKey="id-scan" title="1. Scan Order ID">
            <div className="scanner-container">
              <BarcodeScannerComponent
                width="100%"
                height="100%"
                onUpdate={(err: any, result: any) => {
                  if (result) {
                    scanningSound.play();
                    handleBarcodeDetected(result);
                  }
                  if (err) {
                  }
                }}
              />
              <div className="scanner-overlay">
                <div className="scanner-box"></div>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Manual Entry</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Enter Order/AWB ID"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                />
                <Button
                  onClick={() => {
                    scanningSound.play();
                    handleManualAdd();
                  }}
                  variant="outline-primary"
                >
                  Set ID
                </Button>
              </div>
            </Form.Group>

            {orderId && (
              <Alert variant="success">
                Target ID: <strong>{orderId}</strong>
              </Alert>
            )}
          </Tab>

          {/* TAB 2: RECORDING */}
          <Tab
            eventKey="video-record"
            title="2. Record Evidence"
            disabled={!orderId}
          >
            <Form.Group className="mb-3">
              <Form.Label>Damage Type</Form.Label>
              <Form.Select
                value={damageType}
                onChange={(e) => setDamageType(e.target.value as any)}
              >
                <option value="physical_damage">Physical Damage</option>
                <option value="packaging_damage">Packaging Damage</option>
                <option value="quantity_issue">Quantity Issue</option>
                <option value="functional_damage">Functional Damage</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            <div
              className="position-relative bg-dark rounded overflow-hidden"
              style={{ minHeight: "300px" }}
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: "100%" }}
              />
              {recording && (
                <Badge
                  bg="danger"
                  className="position-absolute"
                  style={{ top: 10, right: 10, fontSize: "1.1rem" }}
                >
                  ● REC {time}s
                </Badge>
              )}
            </div>

            <div className="d-flex gap-2 mt-3">
              {!videoBlob && !recording && (
                <Button variant="primary" onClick={startRecording}>
                  Start Recording
                </Button>
              )}
              {recording && (
                <Button variant="danger" onClick={stopRecording}>
                  Stop ({time}s)
                </Button>
              )}
              {videoBlob && !recording && (
                <Button
                  variant="warning"
                  onClick={() => {
                    setVideoBlob(null);
                    setPreviewUrl(null);
                  }}
                >
                  Re-record
                </Button>
              )}
            </div>

            {previewUrl && (
              <div className="mt-3">
                <Form.Label>Recording Preview</Form.Label>
                <video src={previewUrl} controls className="w-100 rounded" />
              </div>
            )}
          </Tab>
        </Tabs>

        {uploading && (
          <div className="mt-3">
            <Form.Label>Uploading Progress...</Form.Label>
            <ProgressBar
              now={uploadProgress}
              label={`${uploadProgress}%`}
              animated
              striped
            />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        {activeTab === "id-scan" ? (
          <Button
            variant="primary"
            onClick={() => setActiveTab("video-record")}
            disabled={!orderId}
          >
            Next: Record Video
          </Button>
        ) : (
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={uploading || !videoBlob || !orderId}
          >
            Finish & Submit
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function DamageReportPage() {
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, total } = await getAllDamageReports(page, limit);
      setReports(data);
      setTotalRecords(total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const columns: TableColumn<DamageReport>[] = [
    { name: "Order ID", selector: (row) => row.order_id, sortable: true },
    {
      name: "Type",
      selector: (row) => row.damage_type.replace("_", " ").toUpperCase(),
    },
    {
      name: "Status",
      cell: (row) => (
        <Badge bg={row.return_status === "approved" ? "success" : "warning"}>
          {row.return_status}
        </Badge>
      ),
    },
    { name: "Video Key", selector: (row) => row.live_recording_key },
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-4">
        <h3>Damage Reports</h3>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Create New Report
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={reports}
        pagination
        paginationServer
        paginationTotalRows={totalRecords}
        onChangePage={setPage}
        onChangeRowsPerPage={(l) => {
          setLimit(l);
          setPage(1);
        }}
        progressPending={loading}
        highlightOnHover
      />

      <VideoRecorderModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
