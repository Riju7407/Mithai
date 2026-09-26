export type CutoffUnit = 'hours' | 'minutes' | 'seconds';

export interface ISlotCutoffConfig {
  cutoffValue?: number | null;
  cutoffUnit?: CutoffUnit | string | null;
}

export interface ISlotCutoffResult {
  isPastCutoff: boolean;
  cutoffTime: Date;
  slotStartTime: Date;
  effectiveValue: number;
  effectiveUnit: CutoffUnit;
  bufferMs: number;
  noticeText: string;
  cutoffMessage: string;
  getRejectionMessage: (slotTitle: string) => string;
}

export function formatNoticeText(value: number, unit: CutoffUnit | string): string {
  const num = Math.max(0, Number(value) || 0);
  const rawUnit = String(unit || 'hours').toLowerCase().trim();

  let base = 'hours';
  if (rawUnit.startsWith('sec') || rawUnit === 's') {
    base = 'seconds';
  } else if (rawUnit.startsWith('min') || rawUnit === 'm') {
    base = 'minutes';
  }

  if (num === 1) {
    if (base === 'hours') return '1 hour';
    if (base === 'minutes') return '1 minute';
    if (base === 'seconds') return '1 second';
  }

  return `${num} ${base}`;
}

export function computeSlotCutoff(
  startTimeStr: string,
  config?: ISlotCutoffConfig,
  referenceDate: Date = new Date()
): ISlotCutoffResult {
  const value = Math.max(0, Number(config?.cutoffValue ?? 1));
  const rawUnit = String(config?.cutoffUnit || 'hours').toLowerCase().trim();

  let effectiveUnit: CutoffUnit = 'hours';
  let bufferMs = value * 60 * 60 * 1000;

  if (rawUnit.startsWith('sec') || rawUnit === 's') {
    effectiveUnit = 'seconds';
    bufferMs = value * 1000;
  } else if (rawUnit.startsWith('min') || rawUnit === 'm') {
    effectiveUnit = 'minutes';
    bufferMs = value * 60 * 1000;
  } else {
    effectiveUnit = 'hours';
    bufferMs = value * 60 * 60 * 1000;
  }

  const [sh, sm] = (startTimeStr || '00:00').split(':').map((v) => parseInt(v, 10) || 0);
  const slotStartTime = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    sh,
    sm,
    0,
    0
  );

  const cutoffTime = new Date(slotStartTime.getTime() - bufferMs);
  const isPastCutoff = referenceDate.getTime() >= cutoffTime.getTime();
  const noticeText = formatNoticeText(value, effectiveUnit);

  return {
    isPastCutoff,
    cutoffTime,
    slotStartTime,
    effectiveValue: value,
    effectiveUnit,
    bufferMs,
    noticeText,
    cutoffMessage: `Closed: ${noticeText} advance notice required`,
    getRejectionMessage: (slotTitle: string) =>
      `Delivery slot '${slotTitle}' is no longer available for today. Same-day instant orders require booking at least ${noticeText} before the slot starts.`,
  };
}
