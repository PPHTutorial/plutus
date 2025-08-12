'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as cheerio from "cheerio";
export async function scrapeBlockchainPrices() {
    const headers = {
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        Referer: "https://blockhain.com/",
        Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    };

    try {
        const response = await fetch("https://www.blockchain.com/explorer/prices", {
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const cryptoData: { href: any; icon: string; name: any; symbol: any; price: number; usdprice: number; change24h: any; marketCap: any; volume24h: any; circulatingSupply: any; }[] = [];
        $(".sc-3861aabb-15.gilWJv > a").each((i: any, el: any) => {
            const link = $(el);

            const name = link.find("span.fYsYrO").text().trim() || "";
            const symbol = link.find("span.crmkSt").text().trim() || "";
            const icon = `https://bin.bnbstatic.com/static/assets/logos/${symbol.toUpperCase()}.png`;

            const price =
                parseFloat(
                    link
                        .find("div.iQXnyB")
                        .text()
                        .replace(/[^0-9.]/g, "")
                ) || 0;

            const change24h =
                link.find("div.sc-89fc2ff1-13.fnuBgf").text().trim() || "";
            const ch24 = link.find("div.sc-89fc2ff1-13.eiVIQs").text().trim() || "";

            const change = change24h === "" ? ch24 : change24h;

            const marketCap = link.find("div.cBoudl").text().trim() || "";
            const volume24h = link.find("div.jBxFfE").text().trim() || "";
            const circulatingSupply =
                link.find("div.pyRes > div").first().text().trim() || "";

            const usdprice = parseFloat((1 / price).toFixed(8));

            cryptoData.push({
                href: link.attr("href"),
                icon,
                name,
                symbol,
                price,
                usdprice,
                change24h: change,
                marketCap,
                volume24h,
                circulatingSupply,
            });
        });

        return formatPriceData(cryptoData);
    } catch (error) {
        console.error("Error fetching blockchain.com prices:", error);
        return [];
    }
}

function formatPriceData(data: any[]) {
    return data.map((coin: { symbol: any; name: any; icon: any; price: any; usdprice: any; change24h: any; volume24h: any; marketCap: any; }) => ({
        currency: coin.symbol,
        name: coin.name,
        icon: coin.icon,
        price: coin.price,
        usd: coin.usdprice,
        change24h: coin.change24h,
        volume24h: coin.volume24h,
        marketCap: coin.marketCap,
    }));
}