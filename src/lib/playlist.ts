import { Hymn, getAllHymns } from "./data";
export type { Hymn };

export interface PlaylistResult {
  success: boolean;
  hymns?: Hymn[];
  totalDuration?: number;
  message?: string;
}

/**
 * Thuật toán quay lui (Backtracking) để tìm ra đúng 3 bài hát
 * chứa targetVibe và tổng thời gian bằng đúng 480 hoặc 540 giây.
 */
export function generateVibePlaylist(targetVibe: string): PlaylistResult {
  const allHymns = getAllHymns();
  
  // Lọc các bài hát có chứa vibe mong muốn
  const eligibleHymns = allHymns.filter(hymn => 
    hymn.vibes.some(v => v.toLowerCase() === targetVibe.toLowerCase())
  );

  if (eligibleHymns.length < 3) {
    return {
      success: false,
      message: `Không đủ 3 bài hát có vibe "${targetVibe}" trong hệ thống.`
    };
  }

  const TARGET_DURATIONS = [480, 540]; // 8 phút hoặc 9 phút rưỡi
  let foundCombination: Hymn[] | null = null;
  let foundDuration = 0;

  // Thuật toán: Sinh tổ hợp chập 3 của eligibleHymns
  for (let i = 0; i < eligibleHymns.length - 2; i++) {
    for (let j = i + 1; j < eligibleHymns.length - 1; j++) {
      for (let k = j + 1; k < eligibleHymns.length; k++) {
        const combo = [eligibleHymns[i], eligibleHymns[j], eligibleHymns[k]];
        const sumDuration = combo.reduce((acc, curr) => acc + curr.duration_seconds, 0);

        if (TARGET_DURATIONS.includes(sumDuration)) {
          // EARLY EXIT: Stop loop entirely and return immediately to prevent browser freeze
          return {
            success: true,
            hymns: combo,
            totalDuration: sumDuration
          };
        }
      }
    }
  }

  // Cạn kiệt vòng lặp nhưng không tìm ra
  return {
    success: false,
    message: `Không tìm thấy tổ hợp 3 bài hát "${targetVibe}" nào có tổng thời gian chính xác 480s hoặc 540s.`
  };
}

export function getAllAvailableVibes(): string[] {
  const allHymns = getAllHymns();
  const vibesSet = new Set<string>();
  
  allHymns.forEach(hymn => {
    hymn.vibes.forEach(v => vibesSet.add(v.toLowerCase()));
  });

  return Array.from(vibesSet).sort();
}
