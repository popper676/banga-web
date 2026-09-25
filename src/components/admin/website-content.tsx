"use client";

import { useState } from "react";
import { AdminCard, AdminShell } from "@/components/admin/shell";
import { TextAreaField, TextField } from "@/components/ui/forms";
import { Badge, Button, Callout } from "@/components/ui/primitives";
import { SITE_CONTENT, SUPABASE_CONTENT_MODEL } from "@/lib/site-content";
import { useStore } from "@/lib/store";

type StoryField = keyof typeof SITE_CONTENT.story;

export function WebsiteContentScreen() {
  const { pushToast } = useStore();
  const [content, setContent] = useState<Record<StoryField, string>>({ ...SITE_CONTENT.story });
  const [dirty, setDirty] = useState(false);

  const update = (key: StoryField, value: string) => {
    setContent((current) => ({ ...current, [key]: value }));
    setDirty(true);
  };

  return (
    <AdminShell
      title="Website content"
      description="Edit customer-facing copy and media slots from one place. This screen is ready to map to Supabase when the backend is connected."
      actions={
        <Button
          size="sm"
          disabled={!dirty}
          onClick={() => {
            setDirty(false);
            pushToast({
              tone: "success",
              title: "Draft saved",
              body: "Prototype only. Supabase will publish these fields in the live build.",
            });
          }}
        >
          Save draft
        </Button>
      }
    >
      <Callout title="Supabase-ready content model">
        Copy, navigation, section visibility and image URLs use stable keys so the UI can later read them from the database without redesigning the pages.
      </Callout>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <AdminCard title="Our Story page">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Eyebrow"
              value={content.eyebrow}
              onChange={(event) => update("eyebrow", event.target.value)}
            />
            <TextField
              label="Hero title"
              value={content.title}
              onChange={(event) => update("title", event.target.value)}
            />
            <TextAreaField
              label="Hero introduction"
              value={content.intro}
              onChange={(event) => update("intro", event.target.value)}
              maxLength={220}
              showCount
            />
            <TextAreaField
              label="Origin story"
              value={content.originBody}
              onChange={(event) => update("originBody", event.target.value)}
              maxLength={260}
              showCount
            />
            <TextAreaField
              label="Brand promise"
              value={content.promiseBody}
              onChange={(event) => update("promiseBody", event.target.value)}
              maxLength={180}
              showCount
            />
            <TextAreaField
              label="Photo booth message"
              value={content.photoBoothBody}
              onChange={(event) => update("photoBoothBody", event.target.value)}
              maxLength={220}
              showCount
            />
          </div>
        </AdminCard>

        <div className="flex flex-col gap-4">
          <AdminCard title="Media library slots">
            <ul className="flex flex-col gap-3">
              {Object.entries(SITE_CONTENT.media).map(([key, asset]) => (
                <li key={key} className="rounded-[12px] border border-line p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                      <p className="mt-1 break-all text-[11px] text-grey">{asset.src}</p>
                    </div>
                    <Badge tone={asset.status === "placeholder" ? "warning" : "success"} soft>
                      {asset.status}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-3"
                    onClick={() =>
                      pushToast({
                        tone: "neutral",
                        title: "Media picker placeholder",
                        body: "Supabase Storage will open here in the connected build.",
                      })
                    }
                  >
                    Replace image
                  </Button>
                </li>
              ))}
            </ul>
          </AdminCard>

          <AdminCard title="Supabase tables">
            <ul className="flex flex-col gap-3">
              {SUPABASE_CONTENT_MODEL.map((item) => (
                <li key={item.table}>
                  <code className="text-[12px] font-bold">{item.table}</code>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-grey">{item.purpose}</p>
                </li>
              ))}
            </ul>
          </AdminCard>
        </div>
      </div>
    </AdminShell>
  );
}
