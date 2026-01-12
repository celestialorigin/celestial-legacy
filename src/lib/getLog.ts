import { logs, type LogData } from "../data/logs";

export function getLog(idOrSlug: string): LogData | undefined {
    return logs.find(log => log.internalId === idOrSlug || log.slug === idOrSlug);
}
