export interface StarData {
    slug: string;
    title: string;
    subtitle: string;
    displayId: string;
    internalId: string;
    type: string;
    status: string;
    colorKey: string;
    paragraphs: string[];
}

export const stars: Record<string, StarData> = {
    wood: {
        slug: "wood",
        title: "緑の星",
        subtitle: "観測ログ：色彩記録「木」",
        displayId: "OBSERVATION LOG : 001",
        internalId: "OBS-001-G-001",
        type: "COLOR",
        status: "STABLE",
        colorKey: "leaf",
        paragraphs: [
            "この色調の下では、すべてが円を描き、土へと還る。",
            "芽吹きと凋落は等価値であり、終わりは始まりの糧とされる。",
            "かつて誰かの歩みに寄り添っていたその影も、今は静かな腐植へと溶け込んでいる。",
            "輪の外へ逸れた微かな残響を拾う者はなく、ただ静止した記録のみが残る。",
            "誰かのために終わることを、この星はあまりに静かに受け入れている。"
        ]
    },
    fire: {
        slug: "fire",
        title: "赤の星",
        subtitle: "観測ログ：色彩記録「火」",
        displayId: "OBSERVATION LOG : 002",
        internalId: "OBS-002-R-001",
        type: "COLOR",
        status: "STABLE",
        colorKey: "flame",
        paragraphs: [
            "吹き荒れる熱量は、何かを壊すためではなく、ただ灯り続けるために。",
            "勝利のための剣は折れ、守るための泥濘が足元を絡めとる。それは、誰かが残した最後の「選別」の結果だったのかもしれない。",
            "観測範囲を離脱したその決断に、怒りであったか祈りであったかを問う術はない。",
            "倒れる場所を探しているのではない、立ち続ける理由を削り出しているのだ。",
            "最後に残った色が、誰かの瞳にどう映ったかを知る者はいない。"
        ]
    },
    water: {
        slug: "water",
        title: "青の星",
        subtitle: "観測ログ：色彩記録「水」",
        displayId: "OBSERVATION LOG : 003",
        internalId: "OBS-003-B-001",
        type: "COLOR",
        status: "STABLE",
        colorKey: "drop",
        paragraphs: [
            "水面は常に揺れ、すべては下流へと押し流されていく。",
            "失った記録の重ささえ、流れのなかでは浮力へと変換される矛盾。",
            "かつて、この流れを共に眺めていた気配だけが、冷たさの中に微かな温度として残る。",
            "抗わずにいることは、意志を捨て去ることと同じではない。その指が掴もうとしたものは、既に観測の向こう側にある。",
            "飲み込まれる寸前、この星が見上げた空は、あまりに深く澄み渡っていた。"
        ]
    },
    earth: {
        slug: "earth",
        title: "茶の星",
        subtitle: "観測ログ：色彩記録「土」",
        displayId: "OBSERVATION LOG : 004",
        internalId: "OBS-004-E-001",
        type: "COLOR",
        status: "STABLE",
        colorKey: "rock",
        paragraphs: [
            "積み上げられた石の塔は、時の重みをそのまま形に変えている。",
            "昨日の続きを明日も繰り返すことが、もっとも困難な祈りとされる。",
            "背負った責任は、大地に縛り付ける枷となり、かつて誰かが守ろうとした秩序を維持し続けている。",
            "動かぬことで守れるものがあると信じたい。その沈黙は、既に去った誰かへの、名前のない供物だ。",
            "風が土を削り取っても、彼らはまだ、そこに在ることをやめない。"
        ]
    },
    wind: {
        slug: "wind",
        title: "銀の星",
        subtitle: "観測ログ：色彩記録「風」",
        displayId: "OBSERVATION LOG : 005",
        internalId: "OBS-005-S-001",
        type: "COLOR",
        status: "STABLE",
        colorKey: "vortex",
        paragraphs: [
            "情報の海を渡る翼は、どこにも繋ぎ止められることを望まない。",
            "ただ見ているだけの透明な存在ならば、罪を負わずに済むと信じていた。",
            "しかし、観測するという行為そのものが、対象を歪めていく矛盾。誰かがその記録から外れたとき、観測者は初めて自らの空白に気づく。",
            "傍観者の席を立ち、泥にまみれた大地へ降りるための合図は、既に風の中に失われた。",
            "すべてを知っているようでいて、自分さえ見失いそうな輝き。"
        ]
    },
    thunder: {
        slug: "thunder",
        title: "黄の星",
        subtitle: "観測ログ：色彩記録「雷」",
        displayId: "OBSERVATION LOG : 006",
        internalId: "OBS-006-Y-001",
        type: "COLOR",
        status: "STABLE",
        colorKey: "bolt",
        paragraphs: [
            "火花が散る一瞬に、永遠のすべてが凝縮されている。",
            "速さは正義ではなく、鈍重な時間を切り裂くための鋭利な痛みに過ぎない。",
            "用意された最短解を捨て、遠回りの果てに沈む決断。その軌跡だけが、誰かがかつてそこにいた唯一の証明となる。",
            "臨界点を超えた先に見える景色を、彼らは一秒だけ分かち合う。それは、もはや観測不可能な、極私的な領域での出来事だった。",
            "いつか燃え尽きるとしても、その瞬間の輝きまでは奪わせない。"
        ]
    },
    chaos: {
        slug: "chaos",
        title: "紫の星",
        subtitle: "観測ログ：色彩記録「混沌」",
        displayId: "OBSERVATION LOG : 007",
        internalId: "OBS-007-X-001",
        type: "COLOR",
        status: "FRAGMENT",
        colorKey: "chaos",
        paragraphs: [
            "捨て去られた感情、解決されぬ矛盾、それらが吹き溜まって淀んでいる現象。",
            "倒すべき敵はどこにもおらず、ただ内なる混濁を御する規格の崩壊を記録する。",
            "封印とは守るための壁であり、同時にそこから逃げ出せない檻。境界線から外れたものは、定義そのものを失っていく。",
            "終わりを受け入れた者だけが、言葉にならない色の意味を知る。それは、いかなる座標からも遠く離れた場所での、静かなる規格外。",
            "すべてが溶け合い、定義を失っていく場所で、静かに幕が降りる。"
        ]
    }
};
