document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("gemini").focus();
    const inputField = document.getElementById("gemini");
    const summarizeButton = document.getElementById("summarize-btn"); // The button

    // Listen for Enter key press in the input field
    inputField.addEventListener("keypress", (event) => {
        if (event.key === "Enter") { 
            event.preventDefault(); // Prevents form submission (if inside a form)
            summarizeButton.focus();
            summarizeButton.click(); // Triggers the button click
        }
    });
    document.getElementById("summarize-btn").addEventListener("click", async () => {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
            
            const query = document.getElementById("gemini").value;
            const currentTabUrl = tabs[0].url;           //was origanally for summarizing youtube vids
            console.log("Detected URL:", currentTabUrl); // LOG THE CURRENT TAB URL

            document.getElementById("summary-output").innerText= "Generating response...";
            const summary = await summarizeVideo(query); // Use the currentTabUrl here
            document.getElementById("summary-output").innerHTML = summary;
        });
    });
});

async function summarizeVideo(query) {
    const apiKey = "AIzaSyBMEYSM8-XQqmwnAT4zoNvcJ3_M3c74xro"; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{ parts: [{ text: `My question is: ${query}` }] }]
    };

    try {
        console.log("Sending request to Gemini for:" + query); // LOG API REQUEST

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        console.log("Gemini API Response:", data); // LOG API RESPONSE

        if (data && data.candidates) {
            let rawText = data.candidates[0].content.parts[0].text;

            let formattedText = rawText
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold (**text** -> <strong>text</strong>)
                .replace(/\*(?!\s)(.*?)\*/g, "<em>$1</em>") // Italics (*text* -> <em>text</em>)
                .replace(/\n\* /g, "\n - ") // Convert * to - for bullet points
                .replace(/\n/g, "<br>"); // Convert new lines to <br>

            return formattedText; // Return formatted text
        } else {
            return "No response available.";
        }
    } catch (error) {
        console.error("Error fetching response:", error);
        return "Error fetching response."+error;
    }


}
// Function to get the title from the YouTube page
function getYouTubeVideoTitleFromPage() {
    const titleElement = document.querySelector('h1.title yt-formatted-string');
    return titleElement ? titleElement.textContent : null; // Return the video title or null if not found
}

