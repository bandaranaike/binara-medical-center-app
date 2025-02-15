const isStringTotallyChanged = (oldString: string, newString: string) => {
    if (!oldString || !newString) return true;

    // Calculate similarity percentage
    const similarity = getSimilarity(oldString, newString);
    return similarity < 0.5; // Threshold (50%) - Adjust if needed
};

const getSimilarity = (str1: string, str2: string) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;
    return (longer.length - editDistance(longer, shorter)) / longer.length;
};

const editDistance = (s1: string, s2: string) => {
    const dp = Array(s2.length + 1).fill(0).map(() => Array(s1.length + 1).fill(0));
    for (let i = 0; i <= s1.length; i++) dp[0][i] = i;
    for (let j = 0; j <= s2.length; j++) dp[j][0] = j;
    for (let j = 1; j <= s2.length; j++) {
        for (let i = 1; i <= s1.length; i++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[j][i] = dp[j - 1][i - 1];
            } else {
                dp[j][i] = Math.min(dp[j - 1][i - 1], dp[j][i - 1], dp[j - 1][i]) + 1;
            }
        }
    }
    return dp[s2.length][s1.length];
};

export {isStringTotallyChanged, getSimilarity, editDistance}