const fs = require('fs');
const file = './node_modules/react-native-track-player/android/src/main/java/com/doublesymmetry/trackplayer/module/MusicModule.kt';
let code = fs.readFileSync(file, 'utf8');

// First, restore the file to a clean state (optional if we are sure what we have)
// But let's just work on what we have.

// Regex to find methods like:
// @ReactMethod
// fun name(...) = [optional newline] scope.launch {
// and replace with:
// @ReactMethod
// fun name(...) { scope.launch {

const regex = /(@ReactMethod\s+(?:@Deprecated\(.*?\)\s+)?fun\s+[a-zA-Z0-9_]+\s*\([^)]*\))\s*=\s*(scope\.launch\s*\{)/g;

code = code.replace(regex, "$1 { $2");

// Now we need to balance the braces for the methods we just changed.
// This is tricky because we added an opening brace `{`.
// We need to add a closing brace `}` at the end of the `scope.launch` block.

let newCode = "";
let i = 0;
while (i < code.length) {
    let match = code.substring(i).match(/(@ReactMethod\s+(?:@Deprecated\(.*?\)\s+)?fun\s+[a-zA-Z0-9_]+\s*\([^)]*\))\s*\{\s*scope\.launch\s*\{/);
    if (!match) {
        newCode += code.substring(i);
        break;
    }
    
    let index = i + match.index;
    newCode += code.substring(i, index + match[0].length);
    i = index + match[0].length;
    
    let braceCount = 1; // we are inside scope.launch {
    while (braceCount > 0 && i < code.length) {
        if (code[i] === '{') braceCount++;
        else if (code[i] === '}') braceCount--;
        newCode += code[i];
        i++;
    }
    // Now scope.launch closed. Add the method closing brace.
    newCode += "\n    }";
}

fs.writeFileSync(file, newCode);
console.log('Fixed MusicModule.kt with V2 script');
