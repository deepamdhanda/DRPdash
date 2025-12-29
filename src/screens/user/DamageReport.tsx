import { useEffect, useRef, useState, useMemo } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import {
  Modal,
  Button,
  Form,
  Badge,
  ProgressBar,
  Alert,
} from "react-bootstrap";
import {
  completeChunk,
  getAllDamageReports,
  postStartChunks,
  uploadChunk,
} from "../../APIs/user/damage-report";

// Types
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [recording, setRecording] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [orderId, setOrderId] = useState<string>("");
  const [damageType, setDamageType] =
    useState<DamageReport["damage_type"]>("physical_damage");

  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (show) {
      initCamera();
    }
    return () => {
      cleanup();
    };
  }, [show]);

  const initCamera = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions.");
    }
  };

  const cleanup = (): void => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  };

  const startRecording = (): void => {
    chunks.current = [];
    setError(null);

    if (!streamRef.current) return;

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm",
    });

    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size) chunks.current.push(e.data);
    };

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
        if (t + 1 >= MAX_DURATION) {
          stopRecording();
          if (timerRef.current) clearInterval(timerRef.current);
        }
        return t + 1;
      });
    }, 1000);
  };

  const stopRecording = (): void => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!videoBlob) {
      setError("Please record a video first");
      return;
    }

    if (!orderId.trim()) {
      setError("Please enter an Order ID");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const videoId = Date.now().toString();

      const { uploadId, id } = await postStartChunks({
        order_id: orderId,
        videoId: videoId,
        damage_type: damageType,
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
        parts.push({
          PartNumber: result.partNumber,
          ETag: result.ETag,
        });

        setUploadProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      await completeChunk({
        uploadId,
        videoId,
        parts,
        id,
      });

      setUploading(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      setError("Upload failed: " + (err as Error).message);
      setUploading(false);
    }
  };

  const handleClose = (): void => {
    cleanup();
    setRecording(false);
    setVideoBlob(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setUploading(false);
    setOrderId("");
    setDamageType("physical_damage");
    setError(null);
    setSuccess(false);
    setTime(0);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Damage Report</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success">Report submitted successfully!</Alert>
        )}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              Order ID <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              disabled={uploading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Damage Type <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={damageType}
              onChange={(e) =>
                setDamageType(e.target.value as DamageReport["damage_type"])
              }
              disabled={uploading}
            >
              <option value="physical_damage">Physical Damage</option>
              <option value="packaging_damage">Packaging Damage</option>
              <option value="quantity_issue">Quantity Issue</option>
              <option value="functional_damage">Functional Damage</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Video Recording (Max 20 seconds){" "}
              <span className="text-danger">*</span>
            </Form.Label>
            <div style={{ position: "relative" }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  backgroundColor: "#000",
                  maxHeight: "400px",
                }}
              />
              {recording && (
                <Badge
                  bg="danger"
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    fontSize: "14px",
                    padding: "8px 15px",
                  }}
                >
                  ● REC {time}s
                </Badge>
              )}
            </div>

            <div className="d-flex gap-2 mt-2">
              {!recording && !videoBlob && (
                <Button
                  variant="primary"
                  onClick={startRecording}
                  disabled={uploading}
                >
                  Start Recording
                </Button>
              )}
              {recording && (
                <Button variant="danger" onClick={stopRecording}>
                  Stop Recording ({time}s)
                </Button>
              )}
              {videoBlob && !recording && (
                <Button
                  variant="warning"
                  onClick={() => {
                    setVideoBlob(null);
                    setPreviewUrl(null);
                    setTime(0);
                  }}
                  disabled={uploading}
                >
                  Re-record
                </Button>
              )}
            </div>
          </Form.Group>

          {previewUrl && (
            <Form.Group className="mb-3">
              <Form.Label>Preview</Form.Label>
              <video
                src={previewUrl}
                controls
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  maxHeight: "300px",
                }}
              />
            </Form.Group>
          )}

          {uploading && (
            <Form.Group className="mb-3">
              <Form.Label>Upload Progress</Form.Label>
              <ProgressBar
                now={uploadProgress}
                label={`${uploadProgress}%`}
                animated
                striped
              />
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={handleSubmit}
          disabled={uploading || !videoBlob || !orderId.trim()}
        >
          {uploading ? "Uploading..." : "Submit Report"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function DamageReport() {
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [damageReport, setDamageReport] = useState<DamageReport[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchInitial = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, total } = await getAllDamageReports(page, limit);
      setDamageReport(data);
      setTotalRecords(total);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, [page, limit]);

  const handleSuccess = (): void => {
    fetchInitial();
  };

  const getDamageTypeLabel = (type: DamageReport["damage_type"]): string => {
    return type.replace(/_/g, " ").toUpperCase();
  };

  const getStatusBadgeVariant = (
    status: DamageReport["return_status"]
  ): string => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "warning";
    }
  };

  const columns: TableColumn<DamageReport>[] = useMemo(
    () => [
      {
        name: "Order ID",
        selector: (row: DamageReport) => row.order_id,
        sortable: true,
        width: "200px",
      },
      {
        name: "Damage Type",
        selector: (row: DamageReport) => row.damage_type,
        sortable: true,
        cell: (row: DamageReport) => getDamageTypeLabel(row.damage_type),
        width: "200px",
      },
      {
        name: "Return Status",
        selector: (row: DamageReport) => row.return_status,
        sortable: true,
        cell: (row: DamageReport) => (
          <Badge bg={getStatusBadgeVariant(row.return_status)}>
            {row.return_status}
          </Badge>
        ),
        width: "150px",
      },
      {
        name: "Live Recording",
        selector: (row: DamageReport) => row.live_recording_key,
        sortable: false,
        grow: 1,
      },
    ],
    []
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Damage Reports</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Create Report
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={damageReport}
        pagination
        paginationServer
        paginationTotalRows={totalRecords}
        paginationDefaultPage={page}
        paginationPerPage={limit}
        onChangePage={(p) => {
          setPage(p);
        }}
        onChangeRowsPerPage={(newLimit) => {
          setLimit(newLimit);
          setPage(1); // ALWAYS reset to page 1 when limit changes
        }}
        highlightOnHover
        responsive
        progressPending={loading}
      />
      <VideoRecorderModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
