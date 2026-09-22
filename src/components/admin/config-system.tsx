"use client";

import { useMemo, useState } from "react";
import { AdminCard, AdminShell } from "@/components/admin/shell";
import { ADMIN_USERS, AUDIT_LOG, BRANCHES, PROTOTYPE_RULES } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import type { AdminRole, AdminUser, AuditEntry } from "@/lib/types";
import { Badge, Button, Callout, EmptyState } from "@/components/ui/primitives";
import { DataTable, type Column } from "@/components/ui/data";
import { TextAreaField, TextField, Toggle } from "@/components/ui/forms";
import { Dialog } from "@/components/ui/overlays";
import {
  DirtyFlag,
  FilterSearch,
  FilterSelect,
  MaskedKeyField,
  SaveSection,
  Toolbar,
  useAnnounce,
} from "@/components/admin/config-shared";

const ROLES: AdminRole[] = ["Super Admin", "Branch Manager", "Branch Staff", "Kitchen", "Finance"];

const PERMISSIONS: { key: string; label: string; roles: AdminRole[] }[] = [
  { key: "orders.act", label: "Accept, reject and advance orders", roles: ["Super Admin", "Branch Manager", "Branch Staff"] },
  { key: "kitchen", label: "Kitchen board", roles: ["Super Admin", "Branch Manager", "Kitchen"] },
  { key: "menu.edit", label: "Edit menu and prices", roles: ["Super Admin", "Branch Manager"] },
  { key: "refunds.approve", label: "Approve refunds", roles: ["Super Admin", "Finance"] },
  { key: "settings", label: "System settings", roles: ["Super Admin"] },
  { key: "audit", label: "Read audit log", roles: ["Super Admin", "Finance"] },
];

export function BranchesScreen() {
  const { pushToast } = useStore();
  const [paused, setPaused] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState("Sunway Pyramid");

  return (
    <AdminShell
      title="Branch management"
      description="Hours, radius, fees and the pause switch. A third branch is a data change — the customer site already reads from this list."
      actions={
        <Button size="sm" onClick={() => setAdding(true)}>
          Add future branch
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {BRANCHES.map((b) => {
          const reason = paused[b.id];
          return (
            <AdminCard
              key={b.id}
              title={b.shortName}
              action={
                <Badge tone={reason ? "warning" : "success"} icon={reason ? "alert" : "check"} soft>
                  {reason ? "Paused" : "Live"}
                </Badge>
              }
            >
              <p className="text-[13px] text-grey">{b.address}, {b.postcode} {b.city}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
                <div>
                  <dt className="text-grey">Phone</dt>
                  <dd className="num font-semibold">{b.phone}</dd>
                </div>
                <div>
                  <dt className="text-grey">Prep time</dt>
                  <dd className="num font-semibold">{b.prepTimeMinutes} min</dd>
                </div>
                <div>
                  <dt className="text-grey">Delivery radius</dt>
                  <dd className="num font-semibold">{b.deliveryRadiusKm} km</dd>
                </div>
                <div>
                  <dt className="text-grey">Modes</dt>
                  <dd className="font-semibold">
                    {[b.supportsPickup && "Pickup", b.supportsDelivery && "Delivery", b.supportsDineIn && "Dine-in"]
                      .filter(Boolean)
                      .join(" · ")}
                  </dd>
                </div>
              </dl>
              <ol className="mt-3 grid grid-cols-2 gap-1 text-[12px] text-grey">
                {b.hours.map((h) => (
                  <li key={h.day} className="num">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][h.day - 1]} {h.opens}–{h.closes}
                  </li>
                ))}
              </ol>
              <div className="mt-4">
                <Toggle
                  checked={Boolean(reason)}
                  onChange={(v) => {
                    setPaused((prev) => {
                      const next = { ...prev };
                      if (v) next[b.id] = "Kitchen at capacity — taking pickup only after 20:00";
                      else delete next[b.id];
                      return next;
                    });
                    pushToast({
                      tone: v ? "warning" : "success",
                      title: v ? `${b.shortName} paused` : `${b.shortName} taking orders`,
                      body: v ? "Customers see a reason, not a generic closed badge." : "Online ordering is open again.",
                    });
                  }}
                  label="Pause online ordering"
                  description={reason ?? "Leave on only when the kitchen cannot take more tickets."}
                />
              </div>
            </AdminCard>
          );
        })}

        <AdminCard title="Coming soon">
          <p className="text-[14px] text-ink">Sunway Pyramid</p>
          <p className="mt-1 text-[13px] text-grey">Listed on the locations page as a future branch. Not orderable.</p>
          <Badge tone="info" className="mt-3" soft>
            Draft · no hours yet
          </Badge>
        </AdminCard>
      </div>

      <Dialog open={adding} onClose={() => setAdding(false)} title="Add a future branch">
        <TextField label="Working name" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
        <p className="mt-3 text-[13px] text-grey">Saved as a coming-soon pin. Ordering stays off until hours and a radius are set.</p>
        <Button
          className="mt-4"
          onClick={() => {
            setAdding(false);
            pushToast({ tone: "success", title: `${draftName} added as coming soon` });
          }}
        >
          Save draft
        </Button>
      </Dialog>
    </AdminShell>
  );
}

export function UsersScreen() {
  const { pushToast } = useStore();
  const [invite, setInvite] = useState(false);

  const columns: Column<AdminUser>[] = [
    { key: "name", header: "Name", render: (u) => <span className="font-semibold">{u.name}</span> },
    { key: "email", header: "Email", render: (u) => u.email },
    { key: "role", header: "Role", render: (u) => <Badge tone="neutral" soft>{u.role}</Badge> },
    {
      key: "branch",
      header: "Scope",
      render: (u) => (u.branchId ? BRANCHES.find((b) => b.id === u.branchId)?.shortName : "All branches"),
    },
    { key: "last", header: "Last active", render: (u) => u.lastActive },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Badge tone={u.active ? "success" : "danger"} soft>
          {u.active ? "Active" : "Suspended"}
        </Badge>
      ),
    },
  ];

  return (
    <AdminShell
      title="Admins & roles"
      description="Staff accounts, branch scope and the permission matrix. A Super Admin can do everything; Kitchen never sees refunds."
      actions={
        <Button size="sm" onClick={() => setInvite(true)}>
          Invite staff
        </Button>
      }
    >
      <DataTable caption="Admin users" columns={columns} rows={ADMIN_USERS} />

      <AdminCard title="Permission matrix" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-line">
                <th className="px-2 py-2 font-semibold">Capability</th>
                {ROLES.map((r) => (
                  <th key={r} className="px-2 py-2 text-center font-semibold">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.key} className="border-b border-line/70">
                  <td className="px-2 py-2">{p.label}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="px-2 py-2 text-center">
                      {p.roles.includes(r) ? "Yes" : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <Dialog open={invite} onClose={() => setInvite(false)} title="Invite staff">
        <TextField label="Work email" defaultValue="new.staff@bangga.my" />
        <p className="mt-3 text-[13px] text-grey">Prototype only — no email is sent.</p>
        <Button
          className="mt-4"
          onClick={() => {
            setInvite(false);
            pushToast({ tone: "success", title: "Invite queued", body: "They would land on /admin/login." });
          }}
        >
          Send invite
        </Button>
      </Dialog>
    </AdminShell>
  );
}

const PRINTERS = [
  { id: "pr-1", name: "SS15 counter · Epson TM-T82", status: "connected" as const, routing: "Pickup tickets" },
  { id: "pr-2", name: "SS15 kitchen · Epson TM-T20", status: "connected" as const, routing: "Kitchen tickets" },
  { id: "pr-3", name: "Taylor's counter · Star mC-Print3", status: "offline" as const, routing: "Pickup tickets" },
];

export function PrinterScreen() {
  const { pushToast } = useStore();
  const [queue] = useState([
    { id: "q-1", job: "BG-260921-0138 kitchen ticket", reason: "Taylor's counter printer offline" },
  ]);

  return (
    <AdminShell
      title="Printer & POS"
      description="Devices, routing rules, a test print and the retry queue. Printing in this prototype resolves to an on-screen confirmation."
    >
      <ul className="grid gap-3 lg:grid-cols-3">
        {PRINTERS.map((p) => (
          <li key={p.id}>
            <AdminCard
              title={p.name}
              action={
                <Badge tone={p.status === "connected" ? "success" : "danger"} icon={p.status === "connected" ? "check" : "alert"} soft>
                  {p.status === "connected" ? "Connected" : "Offline"}
                </Badge>
              }
            >
              <p className="text-[13px] text-grey">{p.routing}</p>
              <Button
                size="sm"
                className="mt-3"
                variant="secondary"
                onClick={() =>
                  pushToast({
                    tone: p.status === "offline" ? "danger" : "success",
                    title: p.status === "offline" ? "Test print queued" : "Test print sent",
                    body: p.status === "offline" ? "Held in the retry queue until the device is back." : "Kitchen ticket layout, 80 mm.",
                  })
                }
              >
                Test print
              </Button>
            </AdminCard>
          </li>
        ))}
      </ul>

      <AdminCard title="Failed retry queue" className="mt-4">
        {queue.length === 0 ? (
          <EmptyState icon="printer" title="Queue clear" compact />
        ) : (
          <ul className="flex flex-col gap-2">
            {queue.map((j) => (
              <li key={j.id} className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{j.job}</p>
                  <p className="text-[13px] text-grey">{j.reason}</p>
                </div>
                <Button size="sm" onClick={() => pushToast({ tone: "success", title: "Retry sent" })}>
                  Retry
                </Button>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </AdminShell>
  );
}

export function AuditScreen() {
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState("all");
  const [open, setOpen] = useState<string | null>(null);

  const actors = Array.from(new Set(AUDIT_LOG.map((a) => a.actor)));
  const rows = useMemo(
    () =>
      AUDIT_LOG.filter((a) => {
        const q = query.trim().toLowerCase();
        const hit = !q || a.action.includes(q) || a.entity.toLowerCase().includes(q) || a.detail.toLowerCase().includes(q);
        return hit && (actor === "all" || a.actor === actor);
      }),
    [query, actor],
  );

  const columns: Column<AuditEntry>[] = [
    { key: "at", header: "When", render: (a) => <span className="num">{a.at}</span> },
    { key: "actor", header: "Actor", render: (a) => a.actor },
    { key: "action", header: "Action", render: (a) => <span className="num">{a.action}</span> },
    { key: "entity", header: "Entity", render: (a) => a.entity },
    { key: "detail", header: "Detail", render: (a) => <span className="text-[13px] text-grey">{a.detail}</span> },
  ];

  return (
    <AdminShell
      title="Audit logs"
      description="Immutable record of who changed what. This prototype cannot rewrite a row — expanding one only shows the same values again."
    >
      <Toolbar label="Filter audit log">
        <FilterSearch label="Search" value={query} onChange={setQuery} placeholder="Action, entity or detail" />
        <FilterSelect
          label="Actor"
          value={actor}
          onChange={setActor}
          options={[{ value: "all", label: "Everyone" }, ...actors.map((a) => ({ value: a, label: a }))]}
        />
      </Toolbar>
      <div className="mt-3">
        <DataTable
          caption="Audit log"
          columns={columns}
          rows={rows}
          selectedId={open}
          onRowClick={(a) => setOpen(a.id === open ? null : a.id)}
        />
      </div>
      {open && (
        <Callout className="mt-4" title="Before / after">
          {rows.find((r) => r.id === open)?.detail} No previous value is stored for system events.
        </Callout>
      )}
    </AdminShell>
  );
}

export function SettingsScreen() {
  const { pushToast } = useStore();
  const [live, announce] = useAnnounce();
  const [sla, setSla] = useState("5");
  const [slaDirty, setSlaDirty] = useState(false);
  const [sst, setSst] = useState("6");
  const [sstDirty, setSstDirty] = useState(false);
  const [sandbox, setSandbox] = useState(true);
  const [maint, setMaint] = useState(false);
  const [opsDirty, setOpsDirty] = useState(false);
  const [pauseCopy, setPauseCopy] = useState("We are not taking new orders for a few minutes.");

  return (
    <AdminShell
      title="System settings"
      description="Each section saves on its own. Nothing here talks to Maybank, OXPay or Lalamove — the keys are masked placeholders."
    >
      {live}
      <div className="flex flex-col gap-4">
        <SaveSection
          id="ordering"
          title="Ordering rules"
          icon="hourglass"
          description="The prototype SLA the customer confirmation screen quotes."
          dirty={slaDirty}
          onDiscard={() => {
            setSla("5");
            setSlaDirty(false);
          }}
          onSave={() => {
            setSlaDirty(false);
            announce("Ordering rules saved.");
            pushToast({ tone: "success", title: "Ordering rules saved", body: PROTOTYPE_RULES.branchSlaLabel });
          }}
        >
          <TextField
            label="Branch response window (minutes)"
            value={sla}
            onChange={(e) => {
              setSla(e.target.value);
              setSlaDirty(true);
            }}
            hint="Live product default is 5 minutes. Changing it here only updates copy in this prototype."
          />
        </SaveSection>

        <SaveSection
          id="tax"
          title="Tax"
          icon="receipt"
          description="SST printed on receipts."
          dirty={sstDirty}
          onDiscard={() => {
            setSst("6");
            setSstDirty(false);
          }}
          onSave={() => {
            setSstDirty(false);
            pushToast({ tone: "success", title: "Tax rate saved" });
          }}
        >
          <TextField
            label="SST rate (%)"
            value={sst}
            onChange={(e) => {
              setSst(e.target.value);
              setSstDirty(true);
            }}
          />
        </SaveSection>

        <SaveSection
          id="providers"
          title="Payment and delivery providers"
          icon="lock"
          description="Sandbox mode is on. These values cannot be revealed."
          dirty={false}
          onDiscard={() => undefined}
          onSave={() => undefined}
          footerNote="No real key is stored anywhere in this repository."
        >
          <div className="flex flex-col gap-4">
            <MaskedKeyField label="Maybank merchant id" value="mbb_live_••••••••4412" />
            <MaskedKeyField label="OXPay DuitNow key" value="oxp_live_••••••••77b1" />
            <MaskedKeyField label="Lalamove API key" value="llm_live_••••••••09af" />
            <Toggle
              checked={sandbox}
              onChange={setSandbox}
              label="Sandbox mode"
              description="Customer payments stay simulated even if someone pastes a real-looking key."
            />
          </div>
        </SaveSection>

        <SaveSection
          id="ops"
          title="Maintenance"
          icon="settings"
          description="A maintenance flag hides ordering and leaves the story pages up."
          dirty={opsDirty}
          onDiscard={() => {
            setMaint(false);
            setPauseCopy("We are not taking new orders for a few minutes.");
            setOpsDirty(false);
          }}
          onSave={() => {
            setOpsDirty(false);
            pushToast({
              tone: maint ? "warning" : "success",
              title: maint ? "Maintenance mode on" : "Site taking orders",
            });
          }}
        >
          <Toggle
            checked={maint}
            onChange={(v) => {
              setMaint(v);
              setOpsDirty(true);
            }}
            label="Maintenance mode"
          />
          <TextAreaField
            label="Customer-facing pause copy"
            value={pauseCopy}
            onChange={(e) => {
              setPauseCopy(e.target.value);
              setOpsDirty(true);
            }}
          />
          <div className="mt-2">
            <DirtyFlag dirty={opsDirty} />
          </div>
        </SaveSection>
      </div>
    </AdminShell>
  );
}
