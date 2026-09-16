const fs = require('fs');
const file = './node_modules/react-native-track-player/android/src/main/java/com/doublesymmetry/trackplayer/module/MusicModule.kt';
let lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('= scope.launch {')) {
        // Change `= scope.launch {` to `{ scope.launch {`
        lines[i] = lines[i].replace('= scope.launch {', '{ scope.launch {');
        
        // Now find the matching closing brace for the `scope.launch {` block
        let braceCount = 0;
        let foundFirstBrace = false;
        let j = i;
        
        while (j < lines.length) {
            for (let char of lines[j]) {
                if (char === '{') {
                    braceCount++;
                    foundFirstBrace = true;
                } else if (char === '}') {
                    braceCount--;
                }
            }
            
            // If we've found the first brace and braceCount goes down to 1 (because the outer method brace is now the extra 1)
            // Wait: initially the line has `{ scope.launch {` which is TWO opening braces!
            // But wait, my script replaces `= scope.launch {` with `{ scope.launch {`.
            // So on that line, there are TWO opening braces instead of ONE.
            // If I just count braces from line `i`, the total braces will be balanced up to `braceCount == 1`.
            // When the original `scope.launch` closes, `braceCount` drops to 1.
            // At that point, I need to insert `}`.
            
            if (foundFirstBrace && braceCount === 1) {
                // The original scope.launch block has just closed!
                // Add the closing brace for the method on the next line!
                lines.splice(j + 1, 0, '    }');
                break;
            }
            j++;
        }
    }
}

fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed MusicModule.kt safely');
