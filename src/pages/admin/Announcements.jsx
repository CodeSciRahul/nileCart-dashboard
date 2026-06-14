import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

const emptyForm = {
  message: "",
  backgroundColor: "",
  textColor: "",
  priority: "0",
  startsAt: "",
  endsAt: "",
  isActive: true,
};

const toDatetimeLocal = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromDatetimeLocal = (value) => (value ? new Date(value).toISOString() : undefined);

const formatSchedule = (startsAt, endsAt) => {
  if (!startsAt && !endsAt) return "Always";
  const start = startsAt ? new Date(startsAt).toLocaleString() : "Any time";
  const end = endsAt ? new Date(endsAt).toLocaleString() : "No end";
  return `${start} → ${end}`;
};

function ColorField({ label, value, onChange }) {
  const pickerValue = value || "#ffffff";

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          className="h-9 w-14 shrink-0 cursor-pointer p-1"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
        />
      </div>
    </div>
  );
}

function AnnouncementPreview({ message, backgroundColor, textColor }) {
  if (!message) return null;

  return (
    <div
      className="rounded-lg px-4 py-2 text-sm"
      style={{
        backgroundColor: backgroundColor || undefined,
        color: textColor || undefined,
      }}
    >
      {message}
    </div>
  );
}

function AnnouncementsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.announcements,
    queryFn: listAnnouncements,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editId ? updateAnnouncement(editId, payload) : createAnnouncement(payload),
    onSuccess: () => {
      toast.success(editId ? "Announcement updated" : "Announcement created");
      setForm(emptyForm);
      setEditId(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.announcements });
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateAnnouncement(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.announcements });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      toast.success("Announcement deleted");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.announcements });
    },
    onError: (err) => toast.error(err.message),
  });

  const announcements = data?.announcements || [];

  const buildPayload = () => ({
    message: form.message.trim(),
    backgroundColor: form.backgroundColor.trim() || undefined,
    textColor: form.textColor.trim() || undefined,
    priority: Number(form.priority) || 0,
    isActive: form.isActive,
    startsAt: fromDatetimeLocal(form.startsAt),
    endsAt: fromDatetimeLocal(form.endsAt),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const startEdit = (announcement) => {
    setEditId(announcement._id);
    setForm({
      message: announcement.message || "",
      backgroundColor: announcement.backgroundColor || "",
      textColor: announcement.textColor || "",
      priority: String(announcement.priority ?? 0),
      startsAt: toDatetimeLocal(announcement.startsAt),
      endsAt: toDatetimeLocal(announcement.endsAt),
      isActive: announcement.isActive ?? true,
    });
  };

  return (
    <DashboardLayout title="Announcements" variant="admin">
      <Card className="mb-6 max-w-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{editId ? "Edit announcement" : "Create announcement"}</CardTitle>
          {editId && (
            <Button variant="outline" size="sm" onClick={resetForm}>
              Cancel edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.message.trim()) {
                toast.error("Message is required.");
                return;
              }
              saveMutation.mutate(buildPayload());
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <Label>Message *</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <ColorField
                label="Background color"
                value={form.backgroundColor}
                onChange={(backgroundColor) => setForm((f) => ({ ...f, backgroundColor }))}
              />
              <ColorField
                label="Text color"
                value={form.textColor}
                onChange={(textColor) => setForm((f) => ({ ...f, textColor }))}
              />
            </div>
            <AnnouncementPreview
              message={form.message}
              backgroundColor={form.backgroundColor}
              textColor={form.textColor}
            />
            <div className="space-y-1">
              <Label>Priority</Label>
              <Input
                type="number"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              />
              <p className="text-muted-foreground text-xs">Higher priority shows first.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Starts at</Label>
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Ends at</Label>
                <Input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Active
            </label>
            <Button type="submit" disabled={saveMutation.isPending}>
              {editId ? "Update" : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : announcements.length === 0 ? (
        <p className="text-muted-foreground text-sm">No announcements yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map((announcement) => (
              <TableRow key={announcement._id}>
                <TableCell className="max-w-sm">
                  <div
                    className="truncate rounded-lg px-3 py-1.5 text-sm"
                    style={{
                      backgroundColor: announcement.backgroundColor || undefined,
                      color: announcement.textColor || undefined,
                    }}
                  >
                    {announcement.message}
                  </div>
                </TableCell>
                <TableCell>{announcement.priority ?? 0}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatSchedule(announcement.startsAt, announcement.endsAt)}
                </TableCell>
                <TableCell>
                  <Badge variant={announcement.isActive ? "success" : "secondary"}>
                    {announcement.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button size="sm" variant="outline" onClick={() => startEdit(announcement)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toggleMutation.mutate({
                        id: announcement._id,
                        isActive: !announcement.isActive,
                      })
                    }
                  >
                    {announcement.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm("Delete this announcement?")) {
                        deleteMutation.mutate(announcement._id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DashboardLayout>
  );
}

export default function Announcements() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AnnouncementsPage />
    </ProtectedRoute>
  );
}
