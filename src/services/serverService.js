const servers = new Map();

// sauvegarde config serveur
export function setServerConfig(guildId, channelId) {
  servers.set(guildId, {
    channelId,
    active: true
  });
}

// recuperation config serveur
export function getServerConfig(guildId) {
  return servers.get(guildId) ?? null;
}

// liste serveurs actifs
export function getAllActiveServers() {
  const result = [];

  for (const [guildId, cfg] of servers.entries()) {
    if (cfg.active) {
      result.push({
        guildId,
        channelId: cfg.channelId,
        active: cfg.active
      });
    }
  }

  return result;
}