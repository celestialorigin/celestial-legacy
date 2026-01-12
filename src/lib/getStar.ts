import { stars, type StarData } from "../data/stars";

export function getStar(slug: string): StarData {
    const star = stars[slug];
    if (!star) {
        // Graceful fallback for unknown slugs
        return {
            slug: "unknown",
            title: "Unknown Archive",
            subtitle: "Undefined Log",
            displayId: "LOG : ???",
            internalId: "OBS-ERR-X-???",
            type: "UNKNOWN",
            status: "STABLE",
            colorKey: "chaos",
            paragraphs: ["観測データが存在しません。記録は既に失われたか、元より存在しなかった可能性があります。"]
        };
    }
    return star;
}
