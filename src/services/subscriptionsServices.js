// plans utilisateurs
export const PLANS = {
  free: {
    label: "Gratuit",
    summaries: 1,
    asks: 0,
    chat: false,
    analysis: false
  },
  freemium: {
    label: "Freemium",
    summaries: 5,
    asks: 10,
    chat: true,
    analysis: false
  },
  premium: {
    label: "Premium",
    summaries: 999,
    asks: 999,
    chat: true,
    analysis: true
  }
};


// stockage utilisateurs et quotas
const users = new Map();
const quotas = new Map();


// date du jour
function todayKey() {
  const date = new Date();
  return date.toISOString().slice(0, 10);
}


// cle quota
function quotaKey(userId) {
  return userId + ":" + todayKey();
}


// plan utilisateur
export function getUserPlan(userId) {
  const plan = users.get(userId);

  if (!plan) {
    return "free";
  }

  return plan;
}


// infos plan
export function getPlan(userId) {
  const planName = getUserPlan(userId);
  return PLANS[planName];
}


// changer plan
export function setUserPlan(userId, plan) {

  if (!PLANS[plan]) {
    return false;
  }

  users.set(userId, plan);
  return true;
}


// quota utilisateur
export function getQuota(userId) {

  const key = quotaKey(userId);
  const quota = quotas.get(key);

  if (!quota) {
    return {
      summaries: 0,
      asks: 0
    };
  }

  return quota;
}


// peut utiliser resume
export function canUseSummary(userId) {

  const plan = getPlan(userId);
  const quota = getQuota(userId);

  return quota.summaries < plan.summaries;
}


// peut utiliser chat
export function canUseChat(userId) {

  const plan = getPlan(userId);
  const quota = getQuota(userId);

  return plan.chat && quota.asks < plan.asks;
}


// increment resume
export function incrementSummary(userId) {

  const key = quotaKey(userId);
  const quota = getQuota(userId);

  quotas.set(key, {
    summaries: quota.summaries + 1,
    asks: quota.asks
  });
}


// increment chat
export function incrementAsk(userId) {

  const key = quotaKey(userId);
  const quota = getQuota(userId);

  quotas.set(key, {
    summaries: quota.summaries,
    asks: quota.asks + 1
  });
}


// quota restant
export function getRemainingQuota(userId) {

  const plan = getPlan(userId);
  const quota = getQuota(userId);

  let summaries = plan.summaries - quota.summaries;
  let asks = plan.asks - quota.asks;

  if (summaries < 0) {
    summaries = 0;
  }

  if (asks < 0) {
    asks = 0;
  }

  return {
    summaries: summaries,
    asks: asks
  };
}