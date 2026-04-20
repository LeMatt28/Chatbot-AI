// dictionnaire categories : cle = valeur interne, label = affichage Discord, emoji = icone
export const CATEGORIES = {
  ia:          { label: "IA",               emoji: "🤖" },
  cyber:       { label: "Cybersecurite",    emoji: "🔐" },
  crypto:      { label: "Crypto / Web3",    emoji: "🪙" },
  entreprises: { label: "Entreprises tech", emoji: "🏢" },
  dev:         { label: "Dev",              emoji: "💻" },
  hardware:    { label: "Hardware",         emoji: "⚙️"  },
  data:        { label: "Data / ML",        emoji: "📊" },
  startups:    { label: "Startups",         emoji: "🚀" },
  regulation:  { label: "Regulation",       emoji: "⚖️"  },
};

export const feeds = [
  // ia
  { name: "MIT Tech Review AI", url: "https://www.technologyreview.com/feed/",                             category: "ia"          },
  { name: "The Verge AI",       url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", category: "ia"          },
  { name: "Ars Technica AI",    url: "https://feeds.arstechnica.com/arstechnica/index",                    category: "ia"          },

  // cyber
  { name: "Krebs on Security",  url: "https://krebsonsecurity.com/feed/",                                  category: "cyber"       },
  { name: "The Hacker News",    url: "https://feeds.feedburner.com/TheHackersNews",                        category: "cyber"       },
  { name: "Bleeping Computer",  url: "https://www.bleepingcomputer.com/feed/",                             category: "cyber"       },

  // crypto / web3
  { name: "CoinDesk",           url: "https://www.coindesk.com/arc/outboundfeeds/rss/",                    category: "crypto"      },
  { name: "Decrypt",            url: "https://decrypt.co/feed",                                            category: "crypto"      },

  // tech
  { name: "TechCrunch",         url: "https://techcrunch.com/feed/",                                       category: "entreprises" },
  { name: "The Verge",          url: "https://www.theverge.com/rss/index.xml",                             category: "entreprises" },

  // dev
  { name: "Dev.to",             url: "https://dev.to/feed",                                                category: "dev"         },
  { name: "Hacker News",        url: "https://hnrss.org/frontpage",                                        category: "dev"         },

  // hardware
  { name: "Tom's Hardware",     url: "https://www.tomshardware.com/feeds/all",                             category: "hardware"    },
  { name: "Ars Technica HW",    url: "https://feeds.arstechnica.com/arstechnica/gadgets",                  category: "hardware"    },

  // data
  { name: "Towards Data Science", url: "https://towardsdatascience.com/feed",                              category: "data"        },
  { name: "KDnuggets",            url: "https://www.kdnuggets.com/feed",                                   category: "data"        },

  // startup
  { name: "TechCrunch Startups", url: "https://techcrunch.com/category/startups/feed/",                    category: "startups"    },
  { name: "EU Startups",         url: "https://www.eu-startups.com/feed/",                                 category: "startups"    },

  // regulation
  { name: "Politico Tech",      url: "https://rss.politico.com/technology.xml",                            category: "regulation"  },
];