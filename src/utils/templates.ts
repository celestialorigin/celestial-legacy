export const CATEGORY_TEMPLATES: Record<string, string> = {
    FIELD: "観測手記を検知。テキスト・ノードよりデータの移送を確認した。",
    SONIC: "音響信号を受信。周波数解析の結果、有効なパターンを検出した。",
    FRAGMENTS: "視覚断片を抽出。再構成された光の軌跡をアーカイブへ格納した。",
    MOTION: "動的シーケンスを記録。境界点における事象の連続性を確認した。",
    COEXISTENCE: "共鳴パターンの変動を観測。境界領域における相互作用を解析中。",
    OBSERVERS: "観測体からの信号を解析。個体パスの追跡とデータ集積を継続する。",
    ARCHIVE: "全データの統合完了。マスターアーカイブへの同期を実行した。"
};

export function getSummary(category: string, customSummary?: string) {
    if (customSummary) return customSummary;
    return CATEGORY_TEMPLATES[category] || "信号を捕捉。データの完全性を確認中。";
}
