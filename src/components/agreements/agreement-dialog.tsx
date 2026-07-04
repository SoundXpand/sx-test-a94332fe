import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { signAgreement } from "@/lib/agreement.functions";
import {
  AGREEMENT_KEY,
  AGREEMENT_VERSION,
  LicenseeSignedBadge,
  AgreementBody,
} from "./agreement-content";

function SignaturePad({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
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
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
  }, []);

  // Clear if externally reset
  useEffect(() => {
    if (value === null && !emptyRef.current) {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      emptyRef.current = true;
    }
  }, [value]);

  const getPos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const start = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
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
          className="block h-32 w-full touch-none rounded-md"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
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
  const [tab, setTab] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState(defaultName);
  const [drawData, setDrawData] = useState<string | null>(null);
  const [ack, setAck] = useState(false);
  const [saving, setSaving] = useState(false);
  const sign = useServerFn(signAgreement);

  useEffect(() => { setTypedName(defaultName); }, [defaultName]);

  const signedName = typedName.trim();
  const canSubmit =
    ack &&
    signedName.length > 1 &&
    (tab === "type" || !!drawData) &&
    !saving;

  // What we render in the agreement's Licensor slot as they work
  const previewSignatureImage =
    tab === "draw" ? drawData : null;

  const submit = async () => {
    if (!data?.user || !canSubmit) return;
    setSaving(true);
    try {
      const result = await sign({
        data: {
          signature_type: tab,
          signature_data: tab === "draw" ? (drawData ?? "") : signedName,
          signed_name: signedName,
          acknowledged: true,
          agreement_key: AGREEMENT_KEY,
          version: AGREEMENT_VERSION,
        },
      });
      toast.success("Agreement signed", {
        description: (
          <a
            href={result.pdf_url}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            Download signed PDF
          </a>
        ) as any,
      });
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
        className="max-w-4xl p-0 gap-0 overflow-hidden flex flex-col max-h-[92vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle>SoundXpand — Platform Usage & Distribution Agreement</DialogTitle>
          <DialogDescription>
            Please read the agreement carefully. You must accept and sign before continuing to use the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex-1 min-h-0 overflow-y-auto bg-background">
          <LicenseeSignedBadge />
          <AgreementBody
            fullName={signedName || defaultName}
            signatureImage={previewSignatureImage}
          />
        </div>

        <div className="shrink-0 border-t border-border bg-muted/30 px-6 py-4 space-y-3">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid grid-cols-2 w-full max-w-sm">
              <TabsTrigger value="draw">Draw signature</TabsTrigger>
              <TabsTrigger value="type">Type signature</TabsTrigger>
            </TabsList>

            <TabsContent value="draw" className="mt-3 space-y-2">
              <SignaturePad value={drawData} onChange={setDrawData} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="drawname" className="text-xs">Printed full legal name</Label>
                  <Input
                    id="drawname"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="Your full legal name"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="type" className="mt-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                <div className="space-y-1">
                  <Label htmlFor="typed" className="text-xs">Full legal name</Label>
                  <Input
                    id="typed"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="Your full legal name"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Typing your full name acts as your digital signature and is legally binding.
                  </p>
                </div>
                <div className="rounded-md border border-border bg-white h-24 flex items-center justify-center px-3 overflow-hidden">
                  {typedName ? (
                    <p
                      className="text-3xl text-slate-900 truncate"
                      style={{ fontFamily: "'Brush Script MT','Segoe Script',cursive" }}
                    >
                      {typedName}
                    </p>
                  ) : (
                    <span className="text-xs text-muted-foreground">Signature preview</span>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-start gap-2">
            <Checkbox id="ack" checked={ack} onCheckedChange={(v) => setAck(!!v)} className="mt-0.5" />
            <Label htmlFor="ack" className="text-sm font-normal leading-snug cursor-pointer">
              I have read, understood, and accept the Exclusive Licensing and Distribution Agreement,
              and I acknowledge the binding arbitration and governing-law provisions.
            </Label>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-muted-foreground">
              Version <span className="font-mono">{AGREEMENT_VERSION}</span>
              {" · "}
              {tab === "draw"
                ? drawData ? "Signature captured" : "Waiting for signature"
                : signedName.length > 1 ? "Signature ready" : "Enter your name"}
            </p>
            <Button onClick={submit} disabled={!canSubmit} size="lg">
              {saving ? "Signing & generating PDF…" : "Accept & sign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
