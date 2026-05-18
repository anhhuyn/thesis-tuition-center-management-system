import {
    FileText,
    FileSpreadsheet,
    FileImage,
    FileArchive,
    FileCode,
} from "lucide-react"

export const getFileIcon = (type: string) => {
    const t = type.toLowerCase()

    switch (t) {
        case "pdf":
            return <FileText className="text-red-500" size={18} />

        case "ppt":
        case "pptx":
            return <FileSpreadsheet className="text-orange-500" size={18} />

        case "xls":
        case "xlsx":
        case "csv":
            return <FileSpreadsheet className="text-green-600" size={18} />

        case "doc":
        case "docx":
            return <FileText className="text-blue-600" size={18} />

        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "webp":
            return <FileImage className="text-pink-500" size={18} />

        case "zip":
        case "rar":
        case "7z":
            return <FileArchive className="text-yellow-600" size={18} />

        case "json":
        case "xml":
        case "html":
        case "js":
        case "ts":
            return <FileCode className="text-purple-500" size={18} />

        default:
            return <FileText className="text-slate-500" size={18} />
    }
}