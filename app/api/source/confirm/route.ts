import { NextResponse } from "next/server";
import { getAppEnv, requireSecret } from "@/lib/cloudflare";
import { signJson, verifySignedJson } from "@/lib/security/crypto";
import { assertSameOrigin, getRiskSubject } from "@/lib/security/request";
import { confirmSourceRequestSchema, sourceSnapshotSchema, type SourceSnapshot } from "@/lib/source/schemas";

type PreviewValue = { snapshot: SourceSnapshot; issuedFor: string };

export async function POST(request: Request) {
  try {
    const input = confirmSourceRequestSchema.parse(await request.json());
    const env = await getAppEnv();
    assertSameOrigin(request, env.APP_URL || "http://localhost:3000");
    const secret = requireSecret(env, "SOURCE_PREVIEW_SECRET");
    const preview = await verifySignedJson<PreviewValue>(input.previewToken, secret, "source-preview");
    const subject = await getRiskSubject(request, env);
    if (preview.issuedFor !== subject) throw new Error("This source preview belongs to a different session.");
    const snapshot = sourceSnapshotSchema.parse(input.snapshot);
    if (snapshot.type !== preview.snapshot.type || snapshot.url !== preview.snapshot.url) {
      throw new Error("The source URL or type cannot be changed after preview. Preview the new source instead.");
    }
    const confirmedSourceToken = await signJson(
      { snapshot, issuedFor: subject },
      secret,
      "source-confirmed",
      20 * 60,
    );
    return NextResponse.json({ confirmedSourceToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The source could not be confirmed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
