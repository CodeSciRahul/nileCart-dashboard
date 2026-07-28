import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { DEEP_LINK_KINDS, TARGETING_AUTH_OPTIONS } from "@/constants/marketing.js";

const selectClass =
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function DeepLinkFields({ value, onChange }) {
  const deepLink = value || { kind: "page", ref: "", url: "" };
  const needsUrl = deepLink.kind === "external" || deepLink.kind === "page";
  const needsRef = ["product", "category", "brand", "collection"].includes(
    deepLink.kind
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1.5">
        <Label>Link type</Label>
        <select
          className={selectClass}
          value={deepLink.kind || "page"}
          onChange={(e) =>
            onChange({ ...deepLink, kind: e.target.value })
          }
        >
          {DEEP_LINK_KINDS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {needsRef && (
        <div className="space-y-1.5">
          <Label>Slug / ID</Label>
          <Input
            value={deepLink.ref || ""}
            onChange={(e) =>
              onChange({ ...deepLink, ref: e.target.value })
            }
            placeholder="e.g. summer-dresses"
          />
        </div>
      )}

      {needsUrl && (
        <div className="space-y-1.5 md:col-span-2">
          <Label>{deepLink.kind === "external" ? "External URL" : "Page path"}</Label>
          <Input
            value={deepLink.url || ""}
            onChange={(e) =>
              onChange({ ...deepLink, url: e.target.value })
            }
            placeholder={
              deepLink.kind === "external"
                ? "https://example.com/sale"
                : "/sale"
            }
          />
        </div>
      )}
    </div>
  );
}

export function TargetingFields({ value, onChange }) {
  const targeting = value || { devices: ["all"], auth: "all" };
  const devices = targeting.devices?.length ? targeting.devices : ["all"];

  const toggleDevice = (device) => {
    if (device === "all") {
      onChange({ ...targeting, devices: ["all"] });
      return;
    }

    let next = devices.filter((d) => d !== "all");
    if (next.includes(device)) {
      next = next.filter((d) => d !== device);
    } else {
      next = [...next, device];
    }
    if (!next.length) next = ["all"];
    onChange({ ...targeting, devices: next });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Devices</Label>
        <div className="flex flex-wrap gap-3">
          {[
            { value: "all", label: "All devices" },
            { value: "desktop", label: "Desktop" },
            { value: "mobile", label: "Mobile" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                className="size-4 accent-brand-amber"
                checked={
                  opt.value === "all"
                    ? devices.includes("all")
                    : devices.includes(opt.value) && !devices.includes("all")
                }
                onChange={() => toggleDevice(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Visibility</Label>
        <select
          className={selectClass}
          value={targeting.auth || "all"}
          onChange={(e) =>
            onChange({ ...targeting, auth: e.target.value })
          }
        >
          {TARGETING_AUTH_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export { selectClass };
