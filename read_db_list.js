const fs = require('fs');

try {
    const data = fs.readFileSync('db_list.json', 'utf8');
    // The file might contain non-JSON text at the beginning/end due to CLI output.
    // Let's try to find the JSON array.
    const startIndex = data.indexOf('[');
    const endIndex = data.lastIndexOf(']') + 1;

    if (startIndex === -1 || endIndex === 0) {
        console.log("Could not find JSON array in file.");
        console.log("Raw content:", data);
    } else {
        const jsonStr = data.substring(startIndex, endIndex);
        const databases = JSON.parse(jsonStr);
        databases.forEach(db => {
            console.log("Database Name:", db.name);
            // name format: projects/{project}/databases/{database_id}
            const parts = db.name.split('/');
            const dbId = parts[parts.length - 1];
            console.log("Database ID:", dbId);
        });
    }
} catch (err) {
    console.error("Error reading/parsing file:", err);
}
