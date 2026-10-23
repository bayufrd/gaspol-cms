import { notification } from "antd";
import SweetAlert from "sweetalert2";

const TYPE_MAP = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
  question: "info",
};

const stripHtml = (value = "") => {
  const element = document.createElement("div");
  element.innerHTML = String(value);
  return element.textContent || element.innerText || "";
};

const isInteractiveDialog = (options) =>
  options.showCancelButton || options.input || options.showDenyButton || options.preConfirm;

const fire = async (input, title, icon) => {
  const options = typeof input === "string"
    ? { title: input, text: title, icon }
    : { ...(input || {}) };

  if (isInteractiveDialog(options)) return SweetAlert.fire(options);

  const type = TYPE_MAP[options.icon] || "info";
  const duration = options.timer ? Math.max(options.timer / 1000, 1) : type === "error" ? 5 : 3;
  notification[type]({
    message: options.title || (type === "error" ? "Terjadi kesalahan" : "Informasi"),
    description: options.text || stripHtml(options.html),
    placement: options.position === "bottom-end" ? "bottomRight" : "topRight",
    duration,
    showProgress: true,
    pauseOnHover: true,
  });

  if (typeof options.willClose === "function") {
    window.setTimeout(options.willClose, options.timer || 0);
  }

  return { isConfirmed: true, isDismissed: false };
};

const Alerts = { fire, close: SweetAlert.close, mixin: SweetAlert.mixin };

export default Alerts;
