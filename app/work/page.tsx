import { permanentRedirect } from "next/navigation";

export default function LegacyWorkPage() {
  permanentRedirect("/projetos");
}
