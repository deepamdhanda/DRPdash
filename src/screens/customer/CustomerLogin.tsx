import React, { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo.png";
import { customerAxios } from "../../axios/customerAxios";
import { drpCrmBaseUrl } from "../../axios/urls";
import { toast } from "react-toastify";

type Step = "phone" | "otp";

const LoginScreen: React.FC = () => {
  const [step, setStep] = useState<Step>("phone");
  const [otp, setOtp] = useState<string[]>(new Array(4).fill(""));
  const [phone, setPhone] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    // setStep("otp");
    try {
      const { data } = await customerAxios.post(
        `${drpCrmBaseUrl}/customer/auth/send-otp`,
        { phone }
      );
      if (data.success) {
        setStep("otp");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalOtp = otp.join("");
    try {
      const { data } = await customerAxios.post(
        `${drpCrmBaseUrl}/customer/auth/confirm-otp`,
        { phone, otp: finalOtp }
      );
      console.log(data);
      if (data.success) {
        navigate("/customer/order");
      }
      toast.success("Welcome");
    } catch (err) {
      toast.error("Wrong Or Expired OTP");
    }
  };

  return (
    <Container fluid className="vh-100 p-0 overflow-hidden">
      <Row className="h-100 g-0">
        {/* Left Side */}
        <Col
          lg={6}
          className="bg-amber-light d-none d-lg-flex align-items-center p-5"
        >
          <div className="max-w-md mx-auto">
            <h1 className="display-4 fw-bold mb-4" style={{ fontSize: "50px" }}>
              Discover a world of{" "}
              <span className="text-amber">possibilities</span> tailored just
              for you.
            </h1>
            <ul className="list-unstyled mb-5">
              {[
                "Gain access to powerful tools and resources designed to enhance your experience.",
                "Be the first to know about new features, updates, and special events.",
                "Connect with other users and share insights, tips, and experiences.",
                "We prioritize your security and privacy with industry-leading protections.",
              ].map((text, idx) => (
                <li key={idx} className="d-flex align-items-center mb-3">
                  <CheckCircle
                    className="text-amber mt-1 me-3 flex-shrink-0"
                    size={20}
                  />
                  <p className="mb-0 text-black">{text}</p>
                </li>
              ))}
            </ul>
            <p className="text-muted">
              Have questions? Visit our{" "}
              <a href="#" className="text-amber fw-semibold">
                Help Center
              </a>
            </p>
          </div>
        </Col>

        {/* Right Side */}
        <Col
          lg={6}
          className="bg-white d-flex align-items-center justify-content-center p-4"
        >
          <div className="login-card w-100" style={{ maxWidth: "400px" }}>
            <div className="text-center mb-5">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <img src={logoImg} alt="Logo" width={30} />
                <span className="h3 fw-bold ms-2 mb-0 text-amber">
                  Orderz<span className="text-amber">Up</span>
                </span>
              </div>
              <h2 className="fw-bold h4">
                {step === "phone" ? "Login with mobile number" : "Verify OTP"}
              </h2>
              <p className="text-muted small">
                {step === "phone"
                  ? "Please confirm your country code and enter your mobile number"
                  : "Enter the 4-digit code sent to your device"}
              </p>
            </div>

            {step === "phone" ? (
              <Form onSubmit={handleSendOTP}>
                <InputGroup className="mb-4">
                  <Form.Select className="country-select border-end-0 shadow-none">
                    <option>🇮🇳 +91</option>
                  </Form.Select>
                  <Form.Control
                    className="phone-input border-start-0 shadow-none"
                    type="tel"
                    placeholder="98658 98569"
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </InputGroup>
                <Button
                  type="submit"
                  className="btn-amber w-100 py-2 fw-bold mb-4 border-0"
                >
                  Send OTP
                </Button>
              </Form>
            ) : (
              <Form onSubmit={handleVerifyOTP}>
                <div className="d-flex justify-content-center gap-3 mb-4">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="otp-box"
                      value={digit}
                      ref={(el: any) => (inputRefs.current[idx] = el)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange(e.target, idx)
                      }
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                        handleKeyDown(e, idx)
                      }
                      required
                    />
                  ))}
                </div>
                <Button
                  type="submit"
                  className="btn-amber w-100 py-2 fw-bold mb-4 border-0"
                >
                  Verify & Proceed
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="btn btn-link text-amber text-decoration-none fw-semibold p-0"
                  >
                    Change Phone Number
                  </button>
                </div>
              </Form>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginScreen;
