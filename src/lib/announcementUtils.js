export const emptyAnnouncementForm = {
  message: "",
  backgroundColor: "",
  textColor: "",
  priority: "0",
  startsAt: "",
  endsAt: "",
  isActive: true,
};

export const toDatetimeLocal = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const fromDatetimeLocal = (value) => (value ? new Date(value).toISOString() : undefined);

export const formatSchedule = (startsAt, endsAt) => {
  if (!startsAt && !endsAt) return "Always visible";
  const start = startsAt ? new Date(startsAt).toLocaleString() : "Any time";
  const end = endsAt ? new Date(endsAt).toLocaleString() : "No end";
  return { start, end, short: `${start} → ${end}` };
};

export const buildAnnouncementPayload = (form) => ({
  message: form.message.trim(),
  backgroundColor: form.backgroundColor.trim() || undefined,
  textColor: form.textColor.trim() || undefined,
  priority: Number(form.priority) || 0,
  isActive: form.isActive,
  startsAt: fromDatetimeLocal(form.startsAt),
  endsAt: fromDatetimeLocal(form.endsAt),
});
