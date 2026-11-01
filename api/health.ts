export default function handler(_request: unknown, response: any) {
  response.status(200).json({ status: "ok", service: "omaluxe-api" });
}
