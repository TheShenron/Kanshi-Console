function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function msToSec(ms) {
    return Math.round(ms / 1000);
}

function msToMin(ms) {
    return Math.round(ms / (60 * 1000));
}

/**
 * Build timeline segments for focus lost durations.
 * Assumes events sorted by timestamp.
 */
function computeFocusDurations(events) {
    let totalLost = 0;
    let longestLost = 0;
    let lostCount = 0;
    let rapidSwitchCount = 0;

    let lastLostTs = null;

    for (let i = 0; i < events.length; i++) {
        const e = events[i];

        if (e.type === "FOCUS_LOST") {
            lostCount++;
            lastLostTs = e.timestamp;
        }

        if (e.type === "FOCUS_GAINED" && lastLostTs) {
            const dur = e.timestamp - lastLostTs;

            totalLost += dur;
            longestLost = Math.max(longestLost, dur);

            // rapid switching: lost -> gained in < 2 seconds
            if (dur < 2000) rapidSwitchCount++;

            lastLostTs = null;
        }
    }

    // if user ended exam while still unfocused
    if (lastLostTs) {
        const lastEventTs = events[events.length - 1]?.timestamp || lastLostTs;
        const dur = lastEventTs - lastLostTs;

        totalLost += dur;
        longestLost = Math.max(longestLost, dur);
    }

    const avgLost = lostCount > 0 ? totalLost / lostCount : 0;

    return {
        focusLostCount: lostCount,
        totalFocusLostTimeMs: totalLost,
        avgFocusLostTimeMs: avgLost,
        longestFocusLostTimeMs: longestLost,
        rapidSwitchCount,
    };
}

function computePasteMetrics(events) {
    let pasteCount = 0;
    let largeInsertCount = 0;
    let totalLargeInsertChars = 0;
    let biggestInsertLen = 0;
    let newCodeLargeInsertCount = 0;

    for (const e of events) {
        if (e.type === "PASTE") pasteCount++;

        if (e.type === "LARGE_INSERT") {
            largeInsertCount++;
            const len = e?.meta?.len || 0;
            totalLargeInsertChars += len;
            biggestInsertLen = Math.max(biggestInsertLen, len);

            if (e?.meta?.newCode) newCodeLargeInsertCount++;
        }
    }

    return {
        pasteCount,
        largeInsertCount,
        totalLargeInsertChars,
        biggestInsertLen,
        newCodeLargeInsertCount,
    };
}

/**
 * Detect suspicious patterns:
 * - many pastes in short time window
 * - large insert shortly after long focus lost
 */
function computePatterns(events) {
    const pasteTimestamps = events
        .filter((e) => e.type === "PASTE")
        .map((e) => e.timestamp);

    const largeInserts = events.filter((e) => e.type === "LARGE_INSERT");

    // paste burst: >= 3 pastes within 30 seconds
    let pasteBurstCount = 0;
    for (let i = 0; i < pasteTimestamps.length; i++) {
        const start = pasteTimestamps[i];
        let count = 1;

        for (let j = i + 1; j < pasteTimestamps.length; j++) {
            if (pasteTimestamps[j] - start <= 30_000) count++;
            else break;
        }

        if (count >= 3) pasteBurstCount++;
    }

    // large insert after long focus lost
    let largeInsertAfterLongFocusLost = 0;

    for (let i = 0; i < events.length; i++) {
        const e = events[i];

        if (e.type !== "LARGE_INSERT") continue;

        // look backwards for nearest focus gained
        let lastFocusGained = null;
        let lastFocusLost = null;

        for (let k = i - 1; k >= 0; k--) {
            if (!lastFocusGained && events[k].type === "FOCUS_GAINED") {
                lastFocusGained = events[k];
            }
            if (!lastFocusLost && events[k].type === "FOCUS_LOST") {
                lastFocusLost = events[k];
            }
            if (lastFocusGained && lastFocusLost) break;
        }

        if (lastFocusLost && lastFocusGained) {
            const lostDuration = lastFocusGained.timestamp - lastFocusLost.timestamp;

            // if they were unfocused for > 60 seconds and then inserted big code
            if (lostDuration > 60_000 && (e?.meta?.len || 0) > 100) {
                largeInsertAfterLongFocusLost++;
            }
        }
    }

    return {
        pasteBurstCount,
        largeInsertAfterLongFocusLost,
    };
}

/**
 * Final scoring function (0 - 100)
 * Returns score + level + reasons + metrics
 */
export function calculateProctoringScore(eventsRaw) {
    const events = [...(eventsRaw || [])].sort(
        (a, b) => a.timestamp - b.timestamp
    );

    const focus = computeFocusDurations(events);
    const paste = computePasteMetrics(events);
    const patterns = computePatterns(events);

    let score = 0;
    const reasons = [];

    // -------------------------
    // Focus Lost scoring
    // -------------------------
    // React/Python: focus lost is normal, so keep low weights
    if (focus.focusLostCount >= 5) score += 6;
    if (focus.focusLostCount >= 10) score += 8;

    const totalLostMin = msToMin(focus.totalFocusLostTimeMs);
    if (totalLostMin >= 5) score += 5;
    if (totalLostMin >= 10) score += 8;
    if (totalLostMin >= 20) score += 12;

    const longestLostMin = msToMin(focus.longestFocusLostTimeMs);
    if (longestLostMin >= 3) score += 8;
    if (longestLostMin >= 5) score += 12;
    if (longestLostMin >= 10) score += 18;

    if (focus.rapidSwitchCount >= 5) score += 5;

    // -------------------------
    // Paste scoring (HIGH signal)
    // -------------------------
    if (paste.pasteCount >= 1) score += 8;
    if (paste.pasteCount >= 3) score += 15;
    if (paste.pasteCount >= 6) score += 25;
    if (paste.pasteCount >= 10) score += 35;

    // -------------------------
    // Large inserts scoring
    // -------------------------
    if (paste.largeInsertCount >= 1) score += 8;
    if (paste.largeInsertCount >= 3) score += 15;
    if (paste.largeInsertCount >= 6) score += 25;

    if (paste.biggestInsertLen >= 200) score += 10;
    if (paste.biggestInsertLen >= 500) score += 18;
    if (paste.biggestInsertLen >= 1000) score += 25;

    // newCode = code not seen before in hashes (likely external)
    if (paste.newCodeLargeInsertCount >= 1) score += 10;
    if (paste.newCodeLargeInsertCount >= 3) score += 18;

    // -------------------------
    // Pattern scoring
    // -------------------------
    if (patterns.pasteBurstCount >= 1) score += 10;
    if (patterns.pasteBurstCount >= 3) score += 18;

    if (patterns.largeInsertAfterLongFocusLost >= 1) score += 12;
    if (patterns.largeInsertAfterLongFocusLost >= 3) score += 20;

    // clamp final score
    score = clamp(score, 0, 100);

    // -------------------------
    // Reasons (human readable)
    // -------------------------
    if (paste.pasteCount >= 3) reasons.push(`${paste.pasteCount} paste events`);
    if (paste.largeInsertCount >= 3)
        reasons.push(`${paste.largeInsertCount} large inserts`);
    if (paste.biggestInsertLen >= 500)
        reasons.push(`largest insert ${paste.biggestInsertLen} chars`);
    if (totalLostMin >= 10)
        reasons.push(`focus lost total ${totalLostMin} min`);
    if (longestLostMin >= 5)
        reasons.push(`longest focus loss ${longestLostMin} min`);
    if (patterns.pasteBurstCount >= 1)
        reasons.push(`paste bursts detected (${patterns.pasteBurstCount})`);
    if (patterns.largeInsertAfterLongFocusLost >= 1)
        reasons.push(
            `large insert after long focus loss (${patterns.largeInsertAfterLongFocusLost})`
        );

    let level = "LOW";
    if (score >= 60) level = "HIGH";
    else if (score >= 25) level = "MEDIUM";

    return {
        score,
        level,
        reasons,
        metrics: {
            ...focus,
            ...paste,
            ...patterns,
            totalFocusLostMin: totalLostMin,
            longestFocusLostMin: longestLostMin,
        },
    };
}
