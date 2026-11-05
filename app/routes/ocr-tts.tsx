import { OcrTtsPanel } from "~/features/ocr-tts/components/ocr-tts-panel";

export function meta() {
  return [{ title: "OCR to Speech · Smart Reading" }];
}

export default function OcrTtsRoute() {
  return <OcrTtsPanel />;
}
