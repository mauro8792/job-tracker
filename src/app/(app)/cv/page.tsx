"use client";

import { useEffect, useState, useRef } from "react";
import {
  Upload,
  Download,
  Trash2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layout,
  Type,
  ListChecks,
  Bot,
  Target,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Mail,
  PenLine,
  Loader2,
  Cloud,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiStore } from "@/lib/api-store";

const STORAGE_KEY = "djt_cv_file";
const CL_STORAGE_KEY = "djt_cover_letter";

interface StoredCoverLetter {
  mode: "text" | "pdf";
  text?: string;
  pdfName?: string;
  pdfSize?: number;
  pdfData?: string;
  updatedAt: string;
}

interface StoredCV {
  name: string;
  size: number;
  data: string;
  uploadedAt: string;
}

const ATS_TIPS = [
  {
    id: "format",
    icon: Layout,
    color: "text-blue-400",
    title: "Formato: 1 página, sin columnas",
    items: [
      "Máximo 1 página. Los ATS y recruiters descartan CVs de 2+ páginas",
      "Una sola columna. Las columnas dobles confunden a los parsers",
      "No uses tablas, imágenes, íconos ni headers/footers",
      "Formato PDF siempre (no Word, no imagen)",
      "Template limpio: Harvard de FlowCV, o similar single-column",
    ],
  },
  {
    id: "language",
    icon: Type,
    color: "text-emerald-400",
    title: "Idioma: TODO en inglés",
    items: [
      "CV 100% en inglés, incluso si la empresa es de LATAM",
      "El summary y los bullets deben ser en inglés nativo, no traducción literal",
      "Evitá spanglish o mezclar idiomas",
      "Si aplicás a empresas de LATAM en español, tené una versión aparte",
    ],
  },
  {
    id: "structure",
    icon: ListChecks,
    color: "text-purple-400",
    title: "Estructura que funciona",
    items: [
      "Header: Nombre, título, email, teléfono, ubicación, LinkedIn",
      "Summary: 2-3 líneas con años de exp, tecnologías principales, y qué buscás",
      "Experience: Empresa, rol, fechas. Bullets con logros, NO tareas",
      "Skills: Una línea separada por comas (no lista larga)",
      "Education: Título, institución, año",
      "Certificates: Solo los relevantes y vigentes",
    ],
  },
  {
    id: "bullets",
    icon: Target,
    color: "text-amber-400",
    title: "Bullets que venden",
    items: [
      "Empezá con verbo de acción: Built, Designed, Implemented, Led, Optimized",
      "Incluí métricas siempre que puedas: '...reducing errors by 40%'",
      "Fórmula: [Verbo] + [Qué hiciste] + [Con qué tecnología] + [Resultado/Impacto]",
      "Ejemplo: 'Built REST APIs in Node.js/Express serving 10K+ daily users'",
      "Máximo 4 bullets por posición, priorizá los más impactantes",
      "Si trabajaste en varios proyectos en una empresa, consolidalos bajo un solo título",
    ],
  },
  {
    id: "ats",
    icon: Bot,
    color: "text-pink-400",
    title: "Cómo funcionan las AI de RRHH",
    items: [
      "Los ATS (Applicant Tracking Systems) parsean tu CV y extraen keywords",
      "Comparan tus keywords con las del job description",
      "Si no matcheás suficientes keywords, tu CV no llega al recruiter humano",
      "Usá las MISMAS palabras que aparecen en la descripción del puesto",
      "Si dice 'Node.js' poné 'Node.js', no 'NodeJS' ni 'node'",
      "Los ATS más usados: Greenhouse, Lever, Workday, iCIMS, Ashby",
      "Silver.dev, Turing y Arc.dev tienen su propio scoring con AI",
    ],
  },
  {
    id: "mistakes",
    icon: AlertTriangle,
    color: "text-red-400",
    title: "Errores que te eliminan",
    items: [
      "CV de más de 1 página",
      "Sin summary o con summary genérico ('passionate developer...')",
      "Listar tareas en vez de logros ('Responsible for...' en vez de 'Built...')",
      "Tecnologías irrelevantes (Java si aplicás a Node.js, PHP si hacés React)",
      "Certificaciones vencidas sin aclarar",
      "Foto (en USA/Europa es motivo de rechazo automático)",
      "Proyectos freelance sin impacto medible",
      "Links rotos al portfolio o LinkedIn",
    ],
  },
  {
    id: "tools",
    icon: Lightbulb,
    color: "text-cyan-400",
    title: "Herramientas útiles",
    items: [
      "FlowCV (flowcv.com) - Mejor builder gratuito, templates ATS-friendly",
      "Silver.dev - Te da un score de tu CV con AI y feedback",
      "JobScan (jobscan.co) - Compara tu CV con un job description",
      "Resume Worded (resumeworded.com) - Feedback con AI sobre tu CV",
      "Grammarly - Para revisar gramática en inglés",
    ],
  },
];

export default function CVPage() {
  const { user, refreshProfile, loading: authLoading } = useAuth();
  const remoteCv = user?.cv ?? null;

  const [localOnlyCv, setLocalOnlyCv] = useState<StoredCV | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [expandedTip, setExpandedTip] = useState<string | null>("format");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remoteCl = user?.coverLetter;
  const [localOnlyCl, setLocalOnlyCl] = useState<StoredCoverLetter | null>(null);
  const [clMode, setClMode] = useState<"text" | "pdf">("text");
  const [clText, setClText] = useState("");
  const [clCopied, setClCopied] = useState(false);
  const [clDragOver, setClDragOver] = useState(false);
  const [uploadingCl, setUploadingCl] = useState(false);
  const clFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (remoteCv) {
      setLocalOnlyCv(null);
      return;
    }
    if (!user) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        localStorage.removeItem(STORAGE_KEY);
        setLocalOnlyCv(JSON.parse(raw));
      } else setLocalOnlyCv(null);
    } catch {
      setLocalOnlyCv(null);
    }
  }, [authLoading, user, remoteCv]);

  useEffect(() => {
    if (authLoading || !user) return;
    const rc = user.coverLetter;
    if (rc?.pdf) {
      setLocalOnlyCl(null);
      setClMode("pdf");
      setClText(rc.text ?? "");
      return;
    }
    if (rc && typeof rc.text === "string" && rc.text.length > 0) {
      setLocalOnlyCl(null);
      setClMode("text");
      setClText(rc.text);
      return;
    }
    setClText("");
    setClMode("text");
    try {
      const raw = localStorage.getItem(CL_STORAGE_KEY);
      if (raw) {
        localStorage.removeItem(CL_STORAGE_KEY);
        const parsed: StoredCoverLetter = JSON.parse(raw);
        setLocalOnlyCl(parsed);
        setClMode(parsed.mode);
        if (parsed.text) setClText(parsed.text);
      } else {
        setLocalOnlyCl(null);
      }
    } catch {
      setLocalOnlyCl(null);
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading || !user || localOnlyCl || clMode !== "text") return;
    const serverText = user.coverLetter?.text ?? "";
    if (clText === serverText) return;
    const t = window.setTimeout(() => {
      void (async () => {
        try {
          await apiStore.updateCoverLetterText(clText);
          await refreshProfile();
        } catch (e) {
          console.error(e);
        }
      })();
    }, 1500);
    return () => window.clearTimeout(t);
  }, [clText, authLoading, user, localOnlyCl, clMode, refreshProfile]);

  const uploadCvFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Solo se aceptan archivos PDF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo es muy grande. Máximo 5MB.");
      return;
    }
    setUploadingCv(true);
    try {
      await apiStore.uploadCv(file);
      await refreshProfile();
      localStorage.removeItem(STORAGE_KEY);
      setLocalOnlyCv(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo subir el CV. Revisá que la API tenga Cloudinary configurado.");
    } finally {
      setUploadingCv(false);
    }
  };

  const migrateLocalCvToCloud = async () => {
    if (!localOnlyCv?.data) return;
    setUploadingCv(true);
    try {
      const res = await fetch(localOnlyCv.data);
      const blob = await res.blob();
      const file = new File([blob], localOnlyCv.name, { type: "application/pdf" });
      await apiStore.uploadCv(file);
      await refreshProfile();
      localStorage.removeItem(STORAGE_KEY);
      setLocalOnlyCv(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo migrar el CV");
    } finally {
      setUploadingCv(false);
    }
  };

  const handleFile = (file: File) => {
    void uploadCvFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDownloadCv = async () => {
    if (remoteCv) {
      try {
        const res = await fetch(remoteCv.url);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = remoteCv.fileName || "cv.pdf";
        link.click();
        URL.revokeObjectURL(url);
      } catch {
        window.open(remoteCv.url, "_blank", "noopener,noreferrer");
      }
      return;
    }
    if (!localOnlyCv) return;
    const link = document.createElement("a");
    link.href = localOnlyCv.data;
    link.download = localOnlyCv.name;
    link.click();
  };

  const handleDeleteCv = async () => {
    if (remoteCv) {
      if (!window.confirm("¿Borrar el CV de tu cuenta? Se elimina de la nube.")) return;
      setUploadingCv(true);
      try {
        await apiStore.deleteCv();
        await refreshProfile();
      } catch (e) {
        alert(e instanceof Error ? e.message : "No se pudo borrar");
      } finally {
        setUploadingCv(false);
      }
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    setLocalOnlyCv(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const onClTextChange = (text: string) => {
    setClText(text);
    if (localOnlyCl) {
      const stored: StoredCoverLetter = {
        mode: "text",
        text,
        updatedAt: new Date().toISOString(),
      };
      setLocalOnlyCl(stored);
    }
  };

  const migrateLocalClToCloud = async () => {
    if (!localOnlyCl) return;
    setUploadingCl(true);
    try {
      if (localOnlyCl.mode === "text" && localOnlyCl.text) {
        await apiStore.updateCoverLetterText(localOnlyCl.text);
      } else if (localOnlyCl.mode === "pdf" && localOnlyCl.pdfData) {
        const res = await fetch(localOnlyCl.pdfData);
        const blob = await res.blob();
        const file = new File([blob], localOnlyCl.pdfName || "cover-letter.pdf", {
          type: "application/pdf",
        });
        await apiStore.uploadCoverLetterPdf(file);
      }
      await refreshProfile();
      localStorage.removeItem(CL_STORAGE_KEY);
      setLocalOnlyCl(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo guardar en la nube");
    } finally {
      setUploadingCl(false);
    }
  };

  const handleCLFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Solo se aceptan archivos PDF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo es muy grande. Máximo 5MB.");
      return;
    }
    setUploadingCl(true);
    try {
      await apiStore.uploadCoverLetterPdf(file);
      await refreshProfile();
      localStorage.removeItem(CL_STORAGE_KEY);
      setLocalOnlyCl(null);
      setClMode("pdf");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setUploadingCl(false);
    }
  };

  const handleCLDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setClDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleCLFile(file);
  };

  const switchClTab = async (mode: "text" | "pdf") => {
    if (mode === "text" && remoteCl?.pdf) {
      setUploadingCl(true);
      try {
        await apiStore.deleteCoverLetterPdf();
        await refreshProfile();
        setClMode("text");
      } catch (e) {
        alert(e instanceof Error ? e.message : "Error");
      } finally {
        setUploadingCl(false);
      }
      return;
    }
    setClMode(mode);
  };

  const handleCLDownload = async () => {
    if (remoteCl?.pdf) {
      try {
        const res = await fetch(remoteCl.pdf.url);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = remoteCl.pdf.fileName || "cover-letter.pdf";
        link.click();
        URL.revokeObjectURL(url);
      } catch {
        window.open(remoteCl.pdf.url, "_blank", "noopener,noreferrer");
      }
      return;
    }
    if (localOnlyCl?.mode === "pdf" && localOnlyCl.pdfData) {
      const link = document.createElement("a");
      link.href = localOnlyCl.pdfData;
      link.download = localOnlyCl.pdfName || "cover-letter.pdf";
      link.click();
    }
  };

  const handleCLDelete = async () => {
    if (remoteCl?.pdf) {
      if (!window.confirm("¿Borrar el PDF de la nube?")) return;
      setUploadingCl(true);
      try {
        await apiStore.deleteCoverLetterPdf();
        await refreshProfile();
        setClMode("text");
      } catch (e) {
        alert(e instanceof Error ? e.message : "Error");
      } finally {
        setUploadingCl(false);
      }
      return;
    }
    if (remoteCl && !remoteCl.pdf && clText.length > 0) {
      setUploadingCl(true);
      try {
        await apiStore.updateCoverLetterText("");
        await refreshProfile();
        setClText("");
      } catch (e) {
        alert(e instanceof Error ? e.message : "Error");
      } finally {
        setUploadingCl(false);
      }
      return;
    }
    localStorage.removeItem(CL_STORAGE_KEY);
    setLocalOnlyCl(null);
    setClText("");
  };

  const handleCLCopy = async () => {
    if (!clText) return;
    await navigator.clipboard.writeText(clText);
    setClCopied(true);
    setTimeout(() => setClCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi CV & Cover Letter</h1>
        <p className="text-text-muted mt-1">
          Tené tus documentos siempre a mano, y consultá la guía para optimizarlos
        </p>
      </div>

      {/* Row 1: CV + Cover Letter side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CV upload */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Mi CV</h3>
          </div>

          {remoteCv ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-emerald-500/15 p-2.5">
                  <Cloud className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{remoteCv.fileName}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    <span>{formatSize(remoteCv.size)}</span>
                    {remoteCv.uploadedAt ? (
                      <span>
                        Subido:{" "}
                        {new Date(remoteCv.uploadedAt).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => void handleDownloadCv()}
                      disabled={uploadingCv}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-50"
                    >
                      <Download className="h-3.5 w-3.5" /> Descargar
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingCv}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text hover:border-primary/30 disabled:opacity-50"
                    >
                      {uploadingCv ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}{" "}
                      Reemplazar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteCv()}
                      disabled={uploadingCv}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-red-400 hover:border-red-400/30 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Borrar
                    </button>
                  </div>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleInputChange} className="hidden" />
            </div>
          ) : localOnlyCv ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
                <p className="text-xs font-medium text-amber-200 mb-1">CV solo en este navegador</p>
                <p className="text-xs text-text-muted mb-2">
                  Pasalo a la nube (Cloudinary) para abrirlo desde cualquier dispositivo con tu cuenta.
                </p>
                <button
                  type="button"
                  onClick={() => void migrateLocalCvToCloud()}
                  disabled={uploadingCv}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-50"
                >
                  {uploadingCv ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
                  Guardar en la nube
                </button>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-emerald-500/15 p-2.5">
                    <FileText className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{localOnlyCv.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                      <span>{formatSize(localOnlyCv.size)}</span>
                      <span>
                        Guardado:{" "}
                        {new Date(localOnlyCv.uploadedAt).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => void handleDownloadCv()}
                        disabled={uploadingCv}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-50"
                      >
                        <Download className="h-3.5 w-3.5" /> Descargar
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingCv}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text hover:border-primary/30 disabled:opacity-50"
                      >
                        <Upload className="h-3.5 w-3.5" /> Subir a la nube (reemplazar)
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteCv()}
                        disabled={uploadingCv}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-red-400 hover:border-red-400/30 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Quitar local
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleInputChange} className="hidden" />
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploadingCv && fileInputRef.current?.click()}
              className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                uploadingCv ? "opacity-60 pointer-events-none" : "cursor-pointer"
              } ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
            >
              {uploadingCv ? (
                <Loader2 className="h-10 w-10 text-primary mx-auto mb-2 animate-spin" />
              ) : (
                <Upload className="h-10 w-10 text-text-muted mx-auto mb-2" />
              )}
              <p className="font-medium text-sm mb-1">Arrastrá tu CV acá o hacé click</p>
              <p className="text-xs text-text-muted">Solo PDF, máximo 5MB — se guarda en la nube</p>
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleInputChange} className="hidden" />
            </div>
          )}

          <div className="rounded-lg bg-primary/5 border border-primary/15 p-3 flex items-start gap-2.5">
            <Cloud className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted">
              <span className="font-medium text-text">Cloudinary</span> — El PDF se sube de forma segura y queda asociado a tu
              cuenta. Configurá{" "}
              <code className="text-text/90">CLOUDINARY_*</code> en el servidor de la API.
            </p>
          </div>
        </div>

        {/* Cover Letter */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Cover Letter</h3>
          </div>

          {localOnlyCl && !remoteCl?.pdf ? (
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
              <p className="text-xs font-medium text-amber-200 mb-1">Solo en este navegador</p>
              <p className="text-xs text-text-muted mb-2">
                Guardá el cover letter en tu cuenta (texto o PDF en la nube).
              </p>
              <button
                type="button"
                onClick={() => void migrateLocalClToCloud()}
                disabled={uploadingCl}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {uploadingCl ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
                Guardar en la nube
              </button>
            </div>
          ) : null}

          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => void switchClTab("text")}
              disabled={uploadingCl}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                clMode === "text" && !remoteCl?.pdf ? "bg-primary text-white" : "text-text-muted hover:bg-surface-light"
              } disabled:opacity-50`}
            >
              <PenLine className="h-4 w-4" /> Escribir
            </button>
            <button
              type="button"
              onClick={() => void switchClTab("pdf")}
              disabled={uploadingCl}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                clMode === "pdf" || !!remoteCl?.pdf ? "bg-primary text-white" : "text-text-muted hover:bg-surface-light"
              }`}
            >
              <FileText className="h-4 w-4" /> Subir PDF
            </button>
          </div>

          {remoteCl?.pdf ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-emerald-500/15 p-2.5">
                  <Cloud className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{remoteCl.pdf.fileName}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    <span>{formatSize(remoteCl.pdf.size)}</span>
                    {remoteCl.pdf.uploadedAt ? (
                      <span>
                        Subido:{" "}
                        {new Date(remoteCl.pdf.uploadedAt).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => void handleCLDownload()}
                      disabled={uploadingCl}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Download className="h-3.5 w-3.5" /> Descargar
                    </button>
                    <button
                      type="button"
                      onClick={() => clFileInputRef.current?.click()}
                      disabled={uploadingCl}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text hover:border-primary/30 disabled:opacity-50"
                    >
                      {uploadingCl ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}{" "}
                      Reemplazar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCLDelete()}
                      disabled={uploadingCl}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-red-400 hover:border-red-400/30 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Borrar
                    </button>
                  </div>
                </div>
              </div>
              <input
                ref={clFileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleCLFile(f);
                }}
                className="hidden"
              />
            </div>
          ) : clMode === "text" ? (
            <div className="space-y-2 flex-1">
              <textarea
                value={clText}
                onChange={(e) => onClTextChange(e.target.value)}
                rows={7}
                disabled={uploadingCl}
                placeholder={"Dear Hiring Manager,\n\nI am writing to express my interest in the [Position] role at [Company]...\n\n..."}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[100px] disabled:opacity-50"
              />
              <p className="text-[11px] text-text-muted">
                {localOnlyCl
                  ? "Seguís en modo local hasta que pulses “Guardar en la nube”."
                  : "Se guarda automáticamente en tu cuenta unos segundos después de escribir."}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  {clText.length > 0 ? `${clText.split(/\s+/).filter(Boolean).length} palabras` : ""}
                </span>
                <div className="flex gap-2">
                  {clText ? (
                    <button
                      type="button"
                      onClick={() => void handleCLDelete()}
                      disabled={uploadingCl}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-red-400 hover:border-red-400/30 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Borrar
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleCLCopy}
                    disabled={!clText}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-40"
                  >
                    {clCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : localOnlyCl?.mode === "pdf" && localOnlyCl.pdfData ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{localOnlyCl.pdfName}</p>
                  <p className="text-xs text-text-muted">{formatSize(localOnlyCl.pdfSize || 0)}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => void handleCLDownload()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
                >
                  <Download className="h-3.5 w-3.5" /> Descargar
                </button>
                <button
                  type="button"
                  onClick={() => clFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text hover:border-primary/30"
                >
                  <Upload className="h-3.5 w-3.5" /> Subir a la nube
                </button>
                <button
                  type="button"
                  onClick={() => void handleCLDelete()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-red-400 hover:border-red-400/30"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Quitar
                </button>
              </div>
              <input
                ref={clFileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleCLFile(f);
                }}
                className="hidden"
              />
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setClDragOver(true);
              }}
              onDragLeave={() => setClDragOver(false)}
              onDrop={handleCLDrop}
              onClick={() => !uploadingCl && clFileInputRef.current?.click()}
              className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                uploadingCl ? "opacity-60 pointer-events-none" : "cursor-pointer"
              } ${clDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
            >
              {uploadingCl ? (
                <Loader2 className="h-10 w-10 text-primary mx-auto mb-2 animate-spin" />
              ) : (
                <Upload className="h-10 w-10 text-text-muted mx-auto mb-2" />
              )}
              <p className="font-medium text-sm">Arrastrá tu Cover Letter o hacé click</p>
              <p className="text-xs text-text-muted mt-1">Solo PDF, máximo 5MB — se guarda en la nube</p>
              <input
                ref={clFileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleCLFile(f);
                }}
                className="hidden"
              />
            </div>
          )}

          <div className="rounded-lg bg-surface-light p-3">
            <p className="text-xs text-text-muted">
              <span className="font-medium text-text">Tip:</span> Personalizá tu cover letter para cada aplicación.
              Mencioná la empresa, el puesto y por qué sos un buen fit.
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Links + ATS guide side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Links útiles */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="font-semibold mb-3">Links útiles</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { name: "FlowCV", url: "https://flowcv.com", desc: "Builder gratuito ATS-friendly" },
              { name: "Silver.dev CV Review", url: "https://silver.dev", desc: "Score de tu CV con AI" },
              { name: "JobScan", url: "https://jobscan.co", desc: "Compará CV vs job description" },
              { name: "Resume Worded", url: "https://resumeworded.com", desc: "Feedback AI" },
              { name: "Grammarly", url: "https://grammarly.com", desc: "Gramática en inglés" },
              { name: "LinkedIn Resume Builder", url: "https://linkedin.com/help/linkedin/answer/a541960", desc: "Exportar perfil como CV" },
            ].map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-primary/40 hover:bg-surface-light transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{link.name}</p>
                  <p className="text-xs text-text-muted">{link.desc}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-text-muted shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* ATS guide */}
        <div className="space-y-3">
          <div className="mb-1">
            <h2 className="text-xl font-bold">Guía ATS: que tu CV pase los filtros AI</h2>
            <p className="text-text-muted text-sm mt-1">
              Solo el 25% de los CVs llegan a un humano. Estos tips te ayudan a estar en ese 25%.
            </p>
          </div>

          {ATS_TIPS.map((tip) => {
            const isExpanded = expandedTip === tip.id;
            return (
              <div key={tip.id} className="rounded-xl border border-border bg-surface overflow-hidden">
                <button
                  onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-light transition-colors"
                >
                  <tip.icon className={`h-5 w-5 ${tip.color} shrink-0`} />
                  <span className="font-medium text-sm flex-1">{tip.title}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
                </button>
                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    <ul className="space-y-2">
                      {tip.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-text-muted">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
