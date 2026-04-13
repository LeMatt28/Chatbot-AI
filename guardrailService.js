const IT_KEYWORDS = [
  "ia","ai","intelligence artificielle","machine learning","deep learning","llm","gpt","neural","chatgpt","gemini","claude","mistral",
  "cyber","hack","ransomware","malware","phishing","sécurité","vulnérabilité","cve","zero-day","attaque","virus","firewall",
  "crypto","blockchain","bitcoin","ethereum","web3","nft","defi","token","wallet",
  "data","données","base de données","sql","nosql","analytics","big data","dataset",
  "cloud","aws","azure","gcp","infra","kubernetes","docker","devops","ci/cd","déploiement",
  "startup","tech","silicon","google","apple","microsoft","meta","amazon","nvidia","openai","anthropic","sam altman","elon",
  "dev","code","framework","python","javascript","typescript","react","node","api","github","git","programme","logiciel","software",
  "hardware","cpu","gpu","chip","processeur","serveur","réseau","5g","fibre","internet",
  "application","mobile","web","saas","paas","iaas","plateforme",
  "régulation","rgpd","dsa","dma","numérique","loi tech","europe tech",
  "actu","news","actualité","article","résumé","analyse","top","daily","veille",
];

const OFF_TOPIC_KEYWORDS = [
  "recette","cuisine","film","série","musique","sport","football","météo",
  "amour","relation","politique","religion","histoire ancienne","géographie",
  "médecine","santé","pharmacie","droit","juridique","comptabilité","finance personnelle",
];

const GREETINGS = [
  "bonjour","salut","hello","hi","coucou","hey","bonsoir","bonne nuit",
  "ça va","comment vas","comment tu vas","quoi de neuf","yo","wesh",
  "merci","thanks","super","ok","d'accord","parfait","génial","cool",
  "aide","help","que sais-tu","qu'est-ce que tu fais","tu fais quoi",
  "qui es-tu","qui es tu","tu es qui","présente-toi","présente toi","c'est quoi","c'est quoi chat-actu",
];

export function isITRelated(text) {
  const lower = text.toLowerCase();

  const isGreeting = GREETINGS.some((g) => lower.includes(g));
  if (isGreeting) return true;

  const isOffTopic = OFF_TOPIC_KEYWORDS.some((kw) => lower.includes(kw));
  if (isOffTopic) return false;

  const hasIT = IT_KEYWORDS.some((kw) => lower.includes(kw));
  if (hasIT) return true;

  if (text.trim().split(" ").length <= 4) return true;

  return false;
}

export function guardrailRefusal() {
  return "🚫 Je suis spécialisé en actualités IT uniquement (IA, cybersécurité, tech, data, crypto…).\nPose-moi une question sur ces sujets et je ferai de mon mieux !";
}