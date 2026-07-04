import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  AGREEMENT_KEY,
  AGREEMENT_VERSION,
  LICENSEE_SIGNATURE_HASH,
  LicenseeSignedBadge,
  AgreementBody,
} from "./agreement-content";

async function sha256Hex(input: string) {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return "0x" + Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const emptyRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
  }, []);

  const getPos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    drawingRef.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    emptyRef.current = false;
  };
  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (!emptyRef.current) onChange(canvasRef.current!.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    emptyRef.current = true;
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="rounded-md border border-border bg-white">
        <canvas
          ref={canvasRef}
          className="block h-40 w-full touch-none rounded-md"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Sign inside the box with your mouse, trackpad, or finger.</span>
        <Button type="button" variant="ghost" size="sm" onClick={clear}>Clear</Button>
      </div>
    </div>
  );
}

export function AgreementDialog({
  open,
  onOpenChange,
  onSigned,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSigned: () => void;
}) {
  const { data } = useCurrentUser();
  const defaultName = data?.profile?.full_name || "";
  const [tab, setTab] = useState<"draw" | "type">("type");
  const [typedName, setTypedName] = useState(defaultName);
  const [drawData, setDrawData] = useState<string | null>(null);
  const [ack, setAck] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setTypedName(defaultName); }, [defaultName]);

  const signedName = tab === "type" ? typedName.trim() : (defaultName || typedName).trim();
  const canSubmit = ack && signedName.length > 1 && (tab === "type" || !!drawData);

  const submit = async () => {
    if (!data?.user || !canSubmit) return;
    setSaving(true);
    try {
      const payloadForHash = [
        data.user.id,
        AGREEMENT_KEY,
        AGREEMENT_VERSION,
        signedName,
        tab,
        drawData ?? "typed",
        new Date().toISOString(),
      ].join("|");
      const licensor_hash = await sha256Hex(payloadForHash);
      const { error } = await supabase.from("user_agreements" as any).insert({
        user_id: data.user.id,
        agreement_key: AGREEMENT_KEY,
        version: AGREEMENT_VERSION,
        signature_type: tab,
        signature_data: tab === "draw" ? (drawData ?? "") : signedName,
        signed_name: signedName,
        acknowledged: true,
        licensor_hash,
        licensee_hash: LICENSEE_SIGNATURE_HASH,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      } as any);
      if (error) throw error;
      toast.success("Agreement signed. Thank you!");
      onSigned();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Could not save signature.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !saving) return; onOpenChange(o); }}>
      <DialogContent
        className="max-w-3xl p-0 gap-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border">
          <DialogTitle>SoundXpand — Platform Usage & Distribution Agreement</DialogTitle>
          <DialogDescription>
            Please read the agreement carefully. You must accept and sign before continuing to use the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="relative max-h-[55vh] overflow-y-auto bg-background">
          <LicenseeSignedBadge />
          <AgreementBody fullName={signedName || defaultName} />
        </div>

        <div className="border-t border-border bg-muted/30 px-6 py-4 space-y-4">
          <div className="flex items-start gap-2">
            <Checkbox id="ack" checked={ack} onCheckedChange={(v) => setAck(!!v)} className="mt-0.5" />
            <Label htmlFor="ack" className="text-sm font-normal leading-snug cursor-pointer">
              I have read, understood, and accept the Exclusive Licensing and Distribution Agreement,
              and I acknowledge the binding arbitration and governing-law provisions.
            </Label>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid grid-cols-2 w-full max-w-sm">
              <TabsTrigger value="type">Type signature</TabsTrigger>
              <TabsTrigger value="draw">Draw signature</TabsTrigger>
            </TabsList>
            <TabsContent value="type" className="mt-3 space-y-2">
              <Label htmlFor="typed" className="text-xs">Full legal name</Label>
              <Input
                id="typed"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Your full legal name"
                className="max-w-md"
              />
              {typedName && (
                <p
                  className="text-2xl text-foreground pt-1"
                  style={{ fontFamily: "'Brush Script MT','Segoe Script',cursive" }}
                >
                  {typedName}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground">
                Typing your full name acts as your digital signature and is legally binding.
              </p>
            </TabsContent>
            <TabsContent value="draw" className="mt-3 space-y-2">
              <SignaturePad onChange={setDrawData} />
              <div className="space-y-1">
                <Label htmlFor="drawname" className="text-xs">Printed full legal name</Label>
                <Input
                  id="drawname"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Your full legal name"
                  className="max-w-md"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-muted-foreground">
              Agreement version <span className="font-mono">{AGREEMENT_VERSION}</span>
            </p>
            <Button onClick={submit} disabled={!canSubmit || saving}>
              {saving ? "Signing…" : "Accept & sign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
