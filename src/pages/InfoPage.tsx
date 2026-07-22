import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CONTENT: Record<string, { title: string; body: string[] }> = {
  terms: {
    title: "Terms of Use",
    body: [
      "Draft lang ito — palitan bago i-launch publicly. Sa paggamit ng VORTEXIA, sumasang-ayon kang gamitin ang app nang responsable at hindi lalabag sa batas.",
      "Bawal ang pag-abuso sa points/invite system, pekeng account, o pananakot/panliligalig sa ibang miyembro.",
      "Maaaring suspindihin o tanggalin ang account na lumalabag sa mga panuntunang ito, ayon sa nakasaad sa Community Guidelines.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "Draft lang ito — palitan bago i-launch publicly. Kinokolekta lang namin ang impormasyong kailangan para gumana ang app: email, profile info, at activity na susunod sa trust-and-verification na layunin ng VORTEXIA.",
      "Hindi namin ibinabahagi ang personal data mo sa mga third party para sa advertising.",
      "Maaari kang humiling ng pagtanggal ng account/data anumang oras sa pamamagitan ng Help & Support.",
    ],
  },
  guidelines: {
    title: "Community Guidelines",
    body: [
      "Igalang ang bawat miyembro — walang panliligalig, pananakot, o hate speech.",
      "Sundin ang \"walang gimmick\" na patakaran ng VORTEXIA: totoo lang ang mga achievement, badge, at reward.",
      "I-report agad sa Help & Support ang kahina-hinalang account o pag-uugali.",
    ],
  },
  safety: {
    title: "Safety Advice",
    body: [
      "Huwag magbigay ng sensitibong personal na impormasyon (bank details, OTP, atbp.) sa kahit kaninong miyembro.",
      "Kumpletuhin ang verification bago mag-transact para sa dagdag proteksyon.",
      "I-block at i-report agad ang sinumang nagpapadala ng kahina-hinalang link o kahilingan.",
    ],
  },
  about: {
    title: "About the Developer",
    body: [
      "Ginawa at inaalagaan ang VORTEXIA ng maliit na team na naniniwala sa trust-before-transaction na approach sa job-hunting at networking.",
      "May tanong o suggestion? Gamitin ang Help & Support para makipag-ugnayan.",
    ],
  },
};

export default function InfoPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const content = (slug && CONTENT[slug]) || null;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/settings")} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">{content?.title ?? "Not found"}</h1>
      </div>
      {content ? (
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-slate-800 dark:bg-slate-900 dark:text-gray-300">
          {content.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Wala kaming nahanap na page na ito.</p>
      )}
    </div>
  );
}
