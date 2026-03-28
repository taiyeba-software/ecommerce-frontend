import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ModalContext } from "@/context/ModalContext";

export default function Login() {
  const { openModal } = useContext(ModalContext);
  const navigate = useNavigate();

  useEffect(() => {
    openModal("login");
    navigate("/", { replace: true });
  }, [openModal, navigate]);

  return null;
}
