export const emptyAnnouncementForm = {
  message: "",
  type: "top_bar",
  backgroundColor: "",
  textColor: "",
  priority: "0",
  startsAt: "",
  endsAt: "",
  isActive: true,
  link: "",
  deepLink: { kind: "page", ref: "", url: "" },
  dismissible: true,
  targeting: { devices: ["all"], auth: "all" },
};

export const toDatetimeLocal = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const fromDatetimeLocal = (value) =>
  value ? new Date(value).toISOString() : undefined;

export const formatSchedule = (startsAt, endsAt) => {
  if (!startsAt && !endsAt) {
    return { start: "Always visible", end: "—", short: "Always visible" };
  }
  const start = startsAt ? new Date(startsAt).toLocaleString() : "Any time";
  const end = endsAt ? new Date(endsAt).toLocaleString() : "No end";
  return { start, end, short: `${start} → ${end}` };
};

const buildDeepLinkPayload = (deepLink) => {
  if (!deepLink) return undefined;
  const kind = deepLink.kind || "page";
  const ref = deepLink.ref?.trim() || undefined;
  const url = deepLink.url?.trim() || undefined;
  if (!ref && !url) return undefined;
  return { kind, ...(ref ? { ref } : {}), ...(url ? { url } : {}) };
};

export const buildAnnouncementPayload = (form) => ({
  message: form.message.trim(),
  type: form.type || "top_bar",
  backgroundColor: form.backgroundColor.trim() || undefined,
  textColor: form.textColor.trim() || undefined,
  priority: Number(form.priority) || 0,
  isActive: form.isActive,
  startsAt: fromDatetimeLocal(form.startsAt),
  endsAt: fromDatetimeLocal(form.endsAt),
  link: form.link?.trim() || undefined,
  deepLink: buildDeepLinkPayload(form.deepLink),
  dismissible: form.dismissible !== false,
  targeting: {
    devices: form.targeting?.devices?.length
      ? form.targeting.devices
      : ["all"],
    auth: form.targeting?.auth || "all",
  },
});

export const announcementFromApi = (announcement) => ({
  message: announcement.message || "",
  type: announcement.type || "top_bar",
  backgroundColor: announcement.backgroundColor || "",
  textColor: announcement.textColor || "",
  priority: String(announcement.priority ?? 0),
  startsAt: toDatetimeLocal(announcement.startsAt),
  endsAt: toDatetimeLocal(announcement.endsAt),
  isActive: announcement.isActive ?? true,
  link: announcement.link || "",
  deepLink: {
    kind: announcement.deepLink?.kind || "page",
    ref: announcement.deepLink?.ref || "",
    url: announcement.deepLink?.url || "",
  },
  dismissible: announcement.dismissible !== false,
  targeting: {
    devices: announcement.targeting?.devices?.length
      ? [...announcement.targeting.devices]
      : ["all"],
    auth: announcement.targeting?.auth || "all",
  },
});
