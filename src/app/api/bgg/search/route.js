import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const id = searchParams.get("id");

  try {
    const filePath = path.join(process.cwd(), "public", "bgg_games.csv");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "To bgg_games.csv δεν βρέθηκε στο public/" },
        { status: 404 },
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    // 1. Fetch λεπτομερειών by ID
    if (id) {
      const game = parsed.data.find((g) => String(g.id) === String(id));

      if (!game) {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
      }

      let imageUrl = "";
      let minPlayers = game.minplayers || "2";
      let maxPlayers = game.maxplayers || "4";
      let playingTime = game.playingtime || "60";
      let minAge = game.minage || "10";

      try {
        const bggRes = await fetch(
          `https://api.geekdo.com/api/geekitems?objectid=${id}&objecttype=thing`,
          { cache: "force-cache" },
        );

        if (bggRes.ok) {
          const data = await bggRes.json();
          const item = data?.item;

          if (item) {
            imageUrl =
              item.images?.thumb ||
              item.images?.small ||
              item.images?.medium ||
              "";
            minPlayers = String(item.minplayers || minPlayers);
            maxPlayers = String(item.maxplayers || maxPlayers);
            playingTime = String(item.playingtime || playingTime);
            minAge = String(item.minage || minAge);
          }
        }
      } catch (err) {
        console.warn("Geekdo Fetch error:", err.message);
        // Συνεχίζουμε με τα CSV δεδομένα ως fallback
      }

      return NextResponse.json({
        id: game.id,
        title: game.name,
        yearPublished: game.yearpublished || "",
        thumbnail: imageUrl,
        image: imageUrl,
        minPlayers,
        maxPlayers,
        playingTime,
        minAge,
      });
    }

    // 2. Αναζήτηση από CSV (για dropdown)
    if (query && query.trim().length >= 2) {
      const searchTerm = query.trim().toLowerCase();

      const matches = parsed.data
        .filter((game) => {
          const gameName = game.name || "";
          return gameName.toLowerCase().includes(searchTerm);
        })
        .slice(0, 10)
        .map((game) => ({
          id: game.id,
          name: game.name,
          title: game.name,
          year: game.yearpublished || "",
          yearPublished: game.yearpublished || "",
          minPlayers: game.minplayers || "2",
          maxPlayers: game.maxplayers || "4",
        }));

      return NextResponse.json(matches);
    }

    return NextResponse.json([]);
  } catch (err) {
    console.error("CSV Search Error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
