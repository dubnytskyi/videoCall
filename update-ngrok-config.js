// Simple script to update ngrok configuration
// Run this in browser console on the remote laptop

function updateNgrokConfig() {
  const currentUrl = window.location.href;
  console.log("Current URL:", currentUrl);

  if (currentUrl.includes("ngrok")) {
    // Extract the ngrok domain
    const url = new URL(currentUrl);
    const ngrokDomain = url.hostname;
    const protocol = url.protocol;

    // Create backend URL
    const backendUrl = `${protocol}//${ngrokDomain.replace("5173", "4000")}`;

    console.log("Detected ngrok domain:", ngrokDomain);
    console.log("Backend URL should be:", backendUrl);

    // Test the backend URL
    fetch(`${backendUrl}/health`)
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ Backend is accessible:", data);
        alert(`Backend URL: ${backendUrl}\nStatus: ${data.status}`);
      })
      .catch((error) => {
        console.error("❌ Backend not accessible:", error);
        alert(`Backend URL: ${backendUrl}\nError: ${error.message}`);
      });
  } else {
    console.log("Not using ngrok, using local configuration");
  }
}

// Run the function
updateNgrokConfig();








