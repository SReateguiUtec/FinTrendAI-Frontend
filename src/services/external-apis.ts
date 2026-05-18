// src/services/external-apis.ts

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY || '';
const POLYGON_KEY = import.meta.env.VITE_POLYGON_API_KEY || '';
const NEWS_KEY = import.meta.env.VITE_NEWS_API_KEY || '';
const ALPHA_VANTAGE_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '';

export interface MacroEvent {
  time: string;
  country: string;
  event: string;
  impact: string;
  estimate?: string;
  actual?: string;
}

export interface MarketStatus {
  market: string;
  serverTime: string;
  exchanges: {
    nyse: string;
    nasdaq: string;
    otc: string;
  };
}

export interface BreakingNews {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

export interface TopMover {
  ticker: string;
  price: string;
  changeAmount: string;
  changePercentage: string;
  volume: string;
}

export interface TopMoversResult {
  gainers: TopMover[];
  losers: TopMover[];
  mostActivelyTraded: TopMover[];
}

export async function getMacroCalendar(): Promise<MacroEvent[]> {
  if (!FINNHUB_KEY) throw new Error("Missing VITE_FINNHUB_API_KEY");
  
  // Try to get events for today
  try {
    const res = await fetch(`https://finnhub.io/api/v1/calendar/economic?token=${FINNHUB_KEY}`);
    if (!res.ok) throw new Error("Finnhub error");
    const data = await res.json();
    return (data.economicCalendar || []).slice(0, 10).map((item: any) => ({
      time: item.time,
      country: item.country,
      event: item.event,
      impact: item.impact || 'Medium',
      estimate: item.estimate?.toString(),
      actual: item.actual?.toString(),
    }));
  } catch (error) {
    console.error("Error fetching Macro Calendar", error);
    return [];
  }
}

export async function getMarketStatus(): Promise<MarketStatus | null> {
  if (!POLYGON_KEY) throw new Error("Missing VITE_POLYGON_API_KEY");

  try {
    const res = await fetch(`https://api.polygon.io/v1/marketstatus/now?apiKey=${POLYGON_KEY}`);
    if (!res.ok) throw new Error("Polygon error");
    const data = await res.json();
    return {
      market: data.market || 'closed',
      serverTime: data.serverTime || new Date().toISOString(),
      exchanges: {
        nyse: data.exchanges?.nyse || 'closed',
        nasdaq: data.exchanges?.nasdaq || 'closed',
        otc: data.exchanges?.otc || 'closed',
      }
    };
  } catch (error) {
    console.error("Error fetching Market Status", error);
    return null;
  }
}

export async function getBreakingNews(): Promise<BreakingNews[]> {
  if (!NEWS_KEY) throw new Error("Missing VITE_NEWS_API_KEY");

  try {
    const res = await fetch(`https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=${NEWS_KEY}`);
    if (!res.ok) throw new Error("NewsAPI error");
    const data = await res.json();
    return (data.articles || []).slice(0, 10).map((article: any) => ({
      title: article.title,
      source: article.source?.name || 'News',
      url: article.url,
      publishedAt: article.publishedAt,
    }));
  } catch (error) {
    console.error("Error fetching Breaking News", error);
    return [];
  }
}

export async function getTopMovers(): Promise<TopMoversResult> {
  if (!ALPHA_VANTAGE_KEY) throw new Error("Missing VITE_ALPHA_VANTAGE_API_KEY");

  try {
    const res = await fetch(`https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_KEY}`);
    if (!res.ok) throw new Error("Alpha Vantage error");
    const data = await res.json();
    
    // Si la API alcanza el límite retorna un Information o Note en lugar del array
    if (data.Information || data.Note) {
      console.warn("Alpha Vantage limit reached:", data.Information || data.Note);
      return { gainers: [], losers: [], mostActivelyTraded: [] };
    }

    return {
      gainers: (data.top_gainers || []).slice(0, 5).map(mapAlphaMover),
      losers: (data.top_losers || []).slice(0, 5).map(mapAlphaMover),
      mostActivelyTraded: (data.most_actively_traded || []).slice(0, 5).map(mapAlphaMover),
    };
  } catch (error) {
    console.error("Error fetching Top Movers", error);
    return { gainers: [], losers: [], mostActivelyTraded: [] };
  }
}

function mapAlphaMover(item: any): TopMover {
  return {
    ticker: item.ticker,
    price: item.price,
    changeAmount: item.change_amount,
    changePercentage: item.change_percentage,
    volume: item.volume,
  };
}
