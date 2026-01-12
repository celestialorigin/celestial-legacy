export const config = {
    // YouTube チャンネル設定
    youtube: [
        {
            id: "UC_PLACEHOLDER_SONIC", // 音響解析用チャンネルID
            category: "SONIC",
            handle: "@lukia_sonic" // ID抽出用
        },
        {
            id: "UC_PLACEHOLDER_MOTION", // 映像記録用チャンネルID
            category: "MOTION",
            handle: "@lukia_motion"
        }
    ],

    // カクヨム設定
    kakuyomu: {
        userId: "lukia_text", // ユーザー名/ID
        category: "FIELD"
    },

    // pixiv設定
    pixiv: {
        userId: "lukia_art", // ユーザーID
        category: "FRAGMENTS"
    },

    // 取得件数
    maxItemsPerCategory: 20
};

export const templates = {
    FIELD: "テキスト・データノードより新たな記録を受信。解析完了。",
    SONIC: "音響リポジトリにて新規波形を検知。アーカイブへ追加。",
    FRAGMENTS: "視覚断片リポジトリにて高密度のノイズを観測。再構成完了。",
    MOTION: "映像リレーノードより動的シーケンスを受信。同期完了。"
};
