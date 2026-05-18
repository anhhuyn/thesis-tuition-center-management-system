export const STATUS_LABEL: Record<string, string> = {
    active: "ĐANG HỌC",
    upcoming: "SẮP KHAI GIẢNG",
    ended: "KẾT THÚC",
};

export const getSubjectStatusLabel = (status?: string) => {
    const key = status?.trim() ?? "";
    return STATUS_LABEL[key] ?? "KHÔNG XÁC ĐỊNH";
};

export const getSubjectStatusStyle = (status?: string) => {
    const key = status?.trim();

    switch (key) {
        case "active":
            return "bg-green-100 text-green-700";
        case "upcoming":
            return "bg-yellow-100 text-yellow-700";
        case "ended":
            return "bg-red-100 text-red-600";
    }
};