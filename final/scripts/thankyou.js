const params = new URLSearchParams(window.location.search);
const name = params.get("name") || "grower";
const details = document.querySelector("#submission-details");
document.querySelector("#visitor-name").textContent = name;
details.hidden = false;
details.innerHTML = `<h2>Your submission</h2><p><strong>Name:</strong> ${name}<br><strong>Email:</strong> ${params.get("email") || "Not provided"}<br><strong>Farm:</strong> ${params.get("farm") || "Not provided"}<br><strong>Message:</strong> ${params.get("message") || "Not provided"}</p>`;
