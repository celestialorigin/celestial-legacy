export type SourceType = 'youtube' | 'kakuyomu' | 'manual' | 'noise';
export type KindType = 'video' | 'novel' | 'post' | 'stream' | 'note';

export interface SignalNarrative {
  header: string;
  lines: string[];
}

export interface SignalMedia {
  embed?: string;
  thumb?: string;
}

export interface Signal {
  id: string;
  source: SourceType;
  kind: KindType;
  title: string;
  date: string; // ISO8601
  url: string;
  media: SignalMedia;
  auto: boolean;
  observer: string;
  template: string;
  narrative: SignalNarrative;
}
